const Match = require("../models/match.model");
const Player = require("../models/player.model");
const RiotApiService = require("../services/riotAPI.service");

exports.getAllMatchsAndSave = async (req, res) => {
  const summonerPuuid = req.params.puuid;
  const count = req.body.count || 29;

  async function saveMatchData(matchId) {
    const matchDetails = await RiotApiService.getMatchDetails(matchId).then(
      (result) => {
        return result;
      }
    );
    
    const matchInsertResult = await Match.saveMatchData(
      matchId,
      matchDetails.info.gameDuration,
      matchDetails.info.gameMode,
      matchDetails.info.gameStartTimestamp,
      matchDetails.info.gameType,
      matchDetails.info.gameVersion,
      matchDetails.info.mapId,
      matchDetails.info.queueId
    );
    
    if (matchInsertResult) {
      for (const participant of matchDetails.info.participants) {
        try {
          const savePlayerFromMatch = await Match.savePlayer(
            participant,
            matchId
          );
          if (savePlayerFromMatch) {
            console.log(`Jogador salvo com sucesso.`);
          } else {
            console.error(`Erro ao salvar jogador.`);
          }
        } catch (error) {
          console.error(
            `Erro ao inserir participante:`,
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
        if (!matchExists[0]) {
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
