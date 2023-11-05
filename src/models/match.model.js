const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Match {
  static async find() {
    return prisma.match.findMany();
  }

  static async findById(id) {
    return prisma.match.findUnique({
      where: {
        matchId: id
      }
    });
  }

  static async createMatch(match) {
    return prisma.match.create({
      data: {
        matchId: match.gameId,
        match: match
      }
    });
  }

  static async saveMatchData(matchId, gameDuration, gameMode) {
    if (!matchId || !gameDuration || !gameMode) {
      throw new Error("Missing parameters");
    }
    return prisma.match.create({
      data: {
        matchId: matchId,
        gameDuration: gameDuration,
        gameMode: gameMode
      }
    });
  }

  static async matchExists(matchId) {
    const match = await prisma.match.findUnique({
      where: {
        matchId: matchId
      }
    });
    return match !== null;
  }

  static async savePlayer(participant, matchId) {
    if (!participant || !matchId) {
      throw new Error("Missing parameters");
    }
    return prisma.player.create({
      data: {
        puuid: participant.puuid,
        summonerName: participant.summonerName,
        kills: participant.kills,
        assists: participant.assists,
        deaths: participant.deaths,
        kda: participant.challenges.kda,
        goldEarned: participant.goldEarned,
        item0: participant.item0,
        item1: participant.item1,
        item2: participant.item2,
        item3: participant.item3,
        item4: participant.item4,
        item5: participant.item5,
        item6: participant.item6,
        championName: participant.championName,
        championId: participant.championId,
        individualPosition: participant.individualPosition,
        visionScore: participant.visionScore,
        lane: participant.lane,
        role: participant.role,
        teamId: participant.teamId,
        win: participant.win,
        matchId: matchId
      }
    });
  }
}

module.exports = Match;
