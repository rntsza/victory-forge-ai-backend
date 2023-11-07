const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Match {
  static async find() {
    return prisma.matches.findMany();
  }

  static async findById(id) {
    return prisma.matches.findUnique({
      where: {
        matchid: id
      }
    });
  }

  static async createMatch(match) {
    return prisma.matches.create({
      data: {
        matchid: match.gameId,
        match: match
      }
    });
  }

  static async saveMatchData(matchId, gameDuration, gameMode) {
    if (!matchId || !gameDuration || !gameMode) {
      throw new Error("Missing parameters");
    }
    console.log(`Salvando partida ${matchId}`)
    return prisma.matches.create({
      data: {
        matchid: matchId,
        gameduration: gameDuration,
        gamemode: gameMode,
        gamestarttimestamp: null,
        gametype: null,
        gameversion: null,
        mapid: null,
        queueid: null
      }
    });
  }

  static async matchExists(matchId) {
    console.log(`Verificando se a partida ${matchId} já existe`)
    const match = await prisma.matches.findUnique({
      where: {
        matchid: matchId
      }
    });
    return match !== null;
  }

  static async savePlayer(participant, matchId) {
    if (!participant || !matchId) {
      throw new Error("Missing parameters");
    }
    return prisma.players.create({
      data: {
        puuid: participant.puuid,
        summonername: participant.summonerName,
        kills: participant.kills,
        assists: participant.assists,
        deaths: participant.deaths,
        kda: participant.challenges.kda,
        goldearned: participant.goldEarned,
        item0: participant.item0,
        item1: participant.item1,
        item2: participant.item2,
        item3: participant.item3,
        item4: participant.item4,
        item5: participant.item5,
        item6: participant.item6,
        championname: participant.championName,
        championid: participant.championId,
        individualposition: participant.individualPosition,
        visionscore: participant.visionScore,
        lane: participant.lane,
        role: participant.role,
        teamid: participant.teamId,
        win: participant.win,
        matchid: matchId
      }
    });
  }
}

module.exports = Match;
