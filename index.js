const express = require('express');
const axios = require('axios');
const cors = require('cors');

const postgres = require('postgres');
require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const app = express();
const PORT = 3000;
const RIOT_API_KEY = '';

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
        console.log('Invocador já existe no banco de dados');
        return;
      }

      const id = response.data.id;
      const name = response.data.name;
      const accountId = response.data.accountId;
      const puuid = response.data.puuid;
      const profileIconId = response.data.profileIconId;
      const revisionDate = response.data.revisionDate;
      const summonerLevel = response.data.summonerLevel;

      const result = await sql`insert into summoners (id, name, accountid, puuid, profileiconid, revisiondate, summonerlevel) values (${id}, ${name}, ${accountId}, ${puuid}, ${profileIconId}, ${revisionDate}, ${summonerLevel})`;
      if (result) {
        console.log('Invocador inserido no banco de dados com sucesso');
      }
    });
  } catch (error) {
    console.error(error);
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
    const response = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${summonerPuuid}/ids?start=0&count=20&type=ranked`, {
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
    res.json(response.data);

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
      console.log('Invocador:', summonerName, 'Campeão:', championName, 'Time:', teamId, 'Venceu:', win === true ? 'Sim' : 'Não', 'Kills:', kills, 'Assists:', assists, 'Deaths:', deaths, 'Gold:', goldEarned, 'Dragões:', dragonKills, 'Barões:', baronKills, 'Visão:', visionScore, 'Torres:', firstTowerKill === true ? 'Sim' : 'Não', 'Minions:', totalMinionsKilled, 'Monstros:', neutralMinionsKilled, 'Abates:', firstBloodKill === true ? 'Sim' : 'Não', 'Visão:', wardsPlaced, 'Visão destruída:', wardsKilled, 'Lane:', lane, 'Role:', role);
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro na chamada da API' });
  }
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
