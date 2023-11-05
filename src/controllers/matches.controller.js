const Match = require("../models/match.model");
const RiotApiService = require("../services/riotAPI.service");

exports.getAllMatchsAndSave = async (req, res) => {
  const summonerPuuid = req.params.puuid;
  const count = req.body.count || 10;

  async function saveMatchData(matchId) {
    const matchDetails = await RiotApiService.getMatchDetails(matchId).then(
      (result) => {
        return result;
      }
    );
    const matchInsertResult = await Match.saveMatchData(
      matchId,
      matchDetails.info.gameDuration,
      matchDetails.info.gameMode
    );
    if (matchInsertResult) {
      for (const participant of matchDetails.info.participants) {
        try {
          const {
            puuid,
            summonerName,
            kills,
            assists,
            deaths,
            challenges,
            goldEarned,
            item0,
            item1,
            item2,
            item3,
            item4,
            item5,
            item6,
            championName,
            championId,
            individualPosition,
            visionScore,
            lane,
            role,
            teamId,
            win,
          } = participant;
          const savePlayerFromMatch = await Match.savePlayer(
            participant,
            matchId
          );
        } catch (error) {
          console.error(
            `Erro ao inserir participante ${participant.summonerName}:`,
            error
          );
        }
      }
    }
  }

  async function getAllMatches() {
    try {
      const response = await RiotApiService.getMatchIdsByPuuid(
        summonerPuuid,
        count
      );
      console.log(`Foram encontradas ${response.length} partidas`);
      for (const matchId of response) {
        console.log(`Processando partida ${matchId}`);
        const matchExists = await Match.matchExists(matchId);
        if (!matchExists[0].exists || matchExists[0].exists === "false") {
          await saveMatchData(matchId);
        } else {
          console.log("Partida já existe no banco de dados");
        }
      }
      res.status(200).send("Todas as partidas foram processadas com sucesso.");
    } catch (error) {
      console.error("Erro na chamada da API", error);
      res.status(500).send("Ocorreu um erro ao processar as partidas.");
    }
  }

  getAllMatches();
};
