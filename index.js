const express = require('express');
const axios = require('axios');
const cors = require('cors');

const postgres = require('postgres');
require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID, RIOT_API } = process.env;

const app = express();
const PORT = 3000;
const RIOT_API_KEY = RIOT_API;

app.use(cors());

// Rota para o endpoint /getSummoner/:name que recebe o nome do invocador e retorna o id dele
app.get('/getSummoner/:name', async (req, res) => {
  const summonerName = req.params.name;
  try {
    const response = await axios.get(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    }).then(async (response) => {
      // Verifica se o invocador já existe no banco de dados
      const summoner = await sql`select * from summoners where id = ${response.data.id}`;
      if (summoner.length > 0) {
        console.log('summoner', summoner);
        return res.status(200).json({ message: 'Invocador já existe no banco de dados' });
      }
      const { id, name, accountId, puuid, profileIconId, revisionDate, summonerLevel } = response.data;
      const result = await sql`insert into summoners (id, name, accountid, puuid, profileiconid, revisiondate, summonerlevel) values (${id}, ${name}, ${accountId}, ${puuid}, ${profileIconId}, ${revisionDate}, ${summonerLevel})`;
      if (result) {
        return res.status(200).json({ message: 'Invocador inserido no banco de dados com sucesso' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro na chamada da API' });
  }
});

// Rota para o endpoint /getLiveMatch/:id que recebe o id do invocador e retorna o jogo que ele está jogando
app.get('/getLiveMatch/:id', async (req, res) => {
  const summonerId = req.params.id;
  try {
    const response = await axios.get(`https://br1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}`, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Erro na chamada da API' });
  }
});

// Rota para o endpoint /getEntriesBySummoner/:id que recebe o id do invocador e retorna as filas ranqueadas que ele está, nesse caso(o meu), só retorna a fila flex
app.get('/getEntriesBySummoner/:id', async (req, res) => {
  const summonerId = req.params.id;
  try {
    const response = await axios.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Erro na chamada da API' });
  }
});

// Rota para o endpoint /getMatchs/:id que recebe o id do invocador e retorna os ids das partidas que ele jogou
app.get('/getMatchs/:puuid', async (req, res) => {
  const summonerPuuid = req.params.puuid;
  /*
  TODO: Fazer a chamada da api pegar somente as partidas ranqueadas utilizando o parâmetro "type" na chamada da api
  O type pode ser: PRACTICE_GAME, TUTORIAL_GAME, MATCHED_GAME e CUSTOM_GAME
  Ele é um array, então pode ser passado mais de um valor, por exemplo: type=ranked&type=custom
  Descrição da API: Filter the list of match ids by the type of match. This filter is mutually inclusive of the queue filter meaning any match ids returned must match both the queue and type filters.

  O campo queue é o que define se a partida é ranqueada ou não, ele é um array também, então pode ser passado mais de um valor, por exemplo: queue=420&queue=440
  Como o type, ele é um filtro, então a chamada da API vai retornar somente as partidas que são ranqueadas e que são da fila flex ou solo duo
  Descrição da API: Filter the list of match ids by a specific queue id. This filter is mutually inclusive of the type filter meaning any match ids returned must match both the queue and type filters.

  Definir também o count, pois ele pode retornar no máximo 100 ids por chamada, então é necessário fazer mais de uma chamada para pegar todos os ids.
  Isso pode ser feito adicionando o parâmetro count, que por padrão é 20, mas pode ser até 100.
  
  A documentação da API está aqui: https://developer.riotgames.com/apis#match-v5/GET_getMatchIdsByPUUID

  */
  try {
    const response = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${summonerPuuid}/ids?start=0&count=1&type=ranked`, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Erro na chamada da API' });
  }
});

// Rota para o endpoint /getMatchById/:matchid que recebe o id da partida e retorna os detalhes dela
app.get('/getMatchById/:matchid', async (req, res) => {
  const matchId = req.params.matchid;
  try {
    const response = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });
    // res.json(response.data);
    const participants = response.data.info.participants; // Trás os dados de cada jogador de forma MUITO DETALHADA, mas os dados são grandes, então é necessário fazer um tratamento para pegar somente os dados necessários
    const teams = response.data.info.teams; // Trás os dados de cada time, como o time venceu, o time perdeu, o time tem dragão, torre, etc, mas os dados são grandes, então é necessário fazer um tratamento para pegar somente os dados necessários
    const { gameDuration, gameMode, gameStartTimestamp, gameType, gameVersion, mapId, queueId } = response.data.info;
    console.log(matchId, gameDuration, gameMode, gameStartTimestamp, gameType, gameVersion, mapId, queueId);
    
    teams.forEach(async (team) => {
      const { bans, objectives, teamId, win } = team;
      console.log(bans, objectives, teamId, win);
    });

    participants.forEach(async (participant) => {
      const { summonerName, kills, assists, deaths, kda, goldEarned, championName, championId, championLevel, dragonKills, baronKills, damageDealt, damageTaken, wardsPlaced, wardsKilled, visionScore, totalMinionsKilled, neutralMinionsKilled, firstBloodKill, firstTowerKill, lane, role, teamId, win } = participant;
      //kda, championLevel, damageDealt e damageTaken não estão aparecendo o valor, mesmo que eles não estejam undefined
      const _kda = (kills + assists) / deaths;
      console.log('Invocador:', summonerName, 'Campeão:', championName, 'Time:', teamId, 'Venceu:', win === true ? 'Sim' : 'Não', 'Kills:', kills, 'Assists:', assists, 'Deaths:', deaths, 'KDA:', _kda, 'Gold:', goldEarned, 'Dragões:', dragonKills, 'Barões:', baronKills, 'Visão:', visionScore, 'Torres:', firstTowerKill === true ? 'Sim' : 'Não', 'Minions:', totalMinionsKilled, 'Monstros:', neutralMinionsKilled, 'Abates:', firstBloodKill === true ? 'Sim' : 'Não', 'Visão:', wardsPlaced, 'Visão destruída:', wardsKilled, 'Lane:', lane, 'Role:', role);
      // 
      return res.status(200).json({ message: 'Partida inserida no banco de dados com sucesso' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro na chamada da API' });
  }
});

// Rota para o endpoint /getAllMatchsAndSave/:puuid que recebe o puuid do invocador e retorna os ids das partidas que ele jogou e salva no banco de dados
app.get('/getAllMatchsAndSave/:puuid', async (req, res) => {
  const summonerPuuid = req.params.puuid;
  async function saveMatchData(matchId) {
    const matchDetails = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });
    const matchInsertResult = await sql`insert into matches (matchId, gameDuration, gameMode) values (${matchId}, ${matchDetails.data.info.gameDuration}, ${matchDetails.data.info.gameMode}) returning matchId`;
    if (matchInsertResult) {
      for (const participant of matchDetails.data.info.participants) {
        try {
          const _kda = participant.deaths === 0 ? participant.kills + participant.assists : (participant.kills + participant.assists) / participant.deaths;
          await sql`insert into players (puuid, summonerName, kills, assists, deaths, kda, goldEarned, item0, item1, item2, item3, item4, item5, item6, championName, championId, individualPosition, visionScore, lane, role, teamId, win, matchId) values (${participant.puuid}, ${participant.summonerName}, ${participant.kills}, ${participant.assists}, ${participant.deaths}, ${_kda}, ${participant.goldEarned}, ${participant.item0}, ${participant.item1}, ${participant.item2}, ${participant.item3}, ${participant.item4}, ${participant.item5}, ${participant.item6}, ${participant.championName}, ${participant.championId}, ${participant.individualPosition}, ${participant.visionScore}, ${participant.lane}, ${participant.role}, ${participant.teamId}, ${participant.win}, ${matchId})`;
        }
        catch (error) {
          console.error(`Erro ao inserir participante ${participant.summonerName}:`, error);
        }
      }
    }
  }
  
  async function saveMatches() {
    try {
      const response = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${summonerPuuid}/ids?start=0&count=100&type=ranked`, {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      });

      for (const matchId of response.data) {
        const matchExists = await sql`select exists(select 1 from matches where matchId = ${matchId})`;
        if (!matchExists[0].exists || matchExists[0].exists === "false") {
          await saveMatchData(matchId);
        } else {
          console.log('Partida já existe no banco de dados');
        }
      }
      res.status(200).send('Todas as partidas foram processadas com sucesso.');
    } catch (error) {
      console.error('Erro na chamada da API', error);
      res.status(500).send('Ocorreu um erro ao processar as partidas.');
    }
  }
  saveMatches();
});

// Rota para o endpoint /getSummonerByPuuid/:puuid que recebe o puuid do invocador e retorna os dados dele
app.get('/getSummonerByPuuid/:puuid', async (req, res) => {
  const summonerPuuid = req.params.puuid;
  try {
    const response = await axios.get(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${summonerPuuid}`, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Erro na chamada da API' });
  }
});

// Rota para o endpoint /getWinRate/:puuid que recebe o puuid do invocador e retorna a taxa de vitória dele
app.get('/getWinRate/:puuid', async (req, res) => {
  const summonerPuuid = req.params.puuid;
  try {
    // Query para buscar vitórias e derrotas
    const winLossResult = await sql`
      SELECT
        SUM(CASE WHEN win THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN win THEN 0 ELSE 1 END) as losses
      FROM players
      WHERE puuid = ${summonerPuuid}
    `;

    // Calcula a taxa de vitória
    if (winLossResult && winLossResult.count > 0) {
      const { wins, losses } = winLossResult[0];
      const totalGames = parseInt(wins) + parseInt(losses);
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
      res.json({ winRate: winRate.toFixed(2) + '%'});
    } else {
      res.status(404).json({ message: 'Dados não encontrados.' });
    }
  } catch (error) {
    console.error('Erro ao buscar dados do banco:', error);
    res.status(500).json({ message: 'Erro ao processar sua requisição.' });
  }
});

// Rota para o endpoint /getWinRateWithChampion/:puuid/:champion que recebe o puuid do invocador e o nome do campeão e retorna a taxa de vitória dele com o campeão
app.get('/getWinRateWithChampion/:puuid/:champion', async (req, res) => {
  const summonerPuuid = req.params.puuid;
  const championName = req.params.champion;
  try {
    // Consulta para contar vitórias e derrotas com o campeão especificado
    const winLossResult = await sql`
      SELECT 
        SUM(case when win then 1 else 0 end) as wins,
        COUNT(*) - SUM(case when win then 1 else 0 end) as losses
      FROM players
      WHERE puuid = ${summonerPuuid} AND championName = ${championName};
    `;
    
    if (winLossResult.length > 0) {
      const { wins, losses } = winLossResult[0];
      const totalGames = wins + losses;
      const winRate = totalGames > 0 ? (wins / totalGames * 100) : 0;
      
      res.json({ winRate: winRate.toFixed(2), wins, losses });
    } else {
      res.status(404).json({ message: 'Nenhum jogo encontrado com o campeão especificado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar dados do banco de dados:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco de dados' });
  }
});

// Rota para o endpoint /getTopWinningTeammates/:puuid/ que recebe o puuid do invocador e retorna a taxa de vitória dele com o duo/pessoas que mais jogaram com ele
app.get('/getTopWinningTeammates/:puuid', async (req, res) => {
  const summonerPuuid = req.params.puuid;
  try {
    // Consulta para encontrar os companheiros de equipe com mais vitórias
    const teammatesResult = await sql`
      WITH teammate_wins AS (
        SELECT d.summonerName, COUNT(*) as wins
        FROM players AS p
        INNER JOIN players AS d ON p.matchId = d.matchId AND p.teamId = d.teamId
        WHERE p.puuid = ${summonerPuuid} AND d.puuid != ${summonerPuuid} AND p.win = true
        GROUP BY d.summonerName
      ),
      teammate_games AS (
        SELECT d.summonerName, COUNT(*) as total_games
        FROM players AS p
        INNER JOIN players AS d ON p.matchId = d.matchId AND p.teamId = d.teamId
        WHERE p.puuid = ${summonerPuuid} AND d.puuid != ${summonerPuuid}
        GROUP BY d.summonerName
      )
      SELECT w.summonerName, w.wins, g.total_games, ROUND((w.wins::numeric / g.total_games::numeric) * 100, 2) as winrate
      FROM teammate_wins w
      INNER JOIN teammate_games g ON w.summonerName = g.summonerName
      ORDER BY w.wins DESC, winrate DESC
      LIMIT 10;
    `;

    res.json(teammatesResult);
  } catch (error) {
    console.error('Erro ao buscar dados do banco de dados:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco de dados' });
  }
});

// Rota para o endpoint /getAllChampionsWinRate/:puuid que recebe o puuid do invocador e retorna a taxa de vitória dele com cada campeão
app.get('/getAllChampionsWinRate/:puuid', async (req, res) => {
  const summonerPuuid = req.params.puuid;
  try {
    // Consulta para contar vitórias e derrotas por campeão
    const championsStats = await sql`
        SELECT 
        championName,
        championId,
        SUM(CASE WHEN win THEN 1 ELSE 0 END) as wins,
        COUNT(*) - SUM(CASE WHEN win THEN 1 ELSE 0 END) as losses
      FROM players
      WHERE puuid = ${summonerPuuid}
      GROUP BY championName, championId;
    `;

    const winRates = championsStats.map(champion => {
      const totalGames = parseInt(champion.wins) + parseInt(champion.losses);
      const winRate = (champion.wins / totalGames) * 100;
      
      return {
        championName: champion.championname,
        championId: champion.championid,
        winRate: winRate.toFixed(2) + '%',
        wins: champion.wins,
        losses: champion.losses
      };
    });

    res.json(winRates);
  } catch (error) {
    console.error('Erro ao buscar dados do banco de dados:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco de dados' });
  }
});


// Configuração do Postgres 
const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

async function getPgVersion() {
  const result = await sql`select version()`;
  if (!result) {
    return 'Offline ❌';
  } 
  return 'Online 🚀';
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Banco de dados: ${PGDATABASE}`);
  console.log(`Banco:`, await getPgVersion());
});
