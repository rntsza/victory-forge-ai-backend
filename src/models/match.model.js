const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Match {
  static async find() {
    return prisma.matches.findMany();
  }

  static async findById(id) {
    return prisma.matches.findUnique({
      where: {
        matchid: id,
      },
    });
  }

  static async createMatch(match) {
    return prisma.matches.create({
      data: {
        matchid: match.gameId,
        match: match,
      },
    });
  }

  static async saveMatchData(
    matchId,
    gameDuration,
    gameMode,
    gameStartTimestamp,
    gameType,
    gameVersion,
    mapId,
    queueId
  ) {
    if (!matchId || !gameDuration || !gameMode) {
      throw new Error("Missing parameters");
    }
    const matchExists = await this.matchExists(matchId);

    if (matchExists) {
    } else {
      return prisma.matches.create({
        data: {
          matchid: matchId,
          gameduration: gameDuration,
          gamemode: gameMode,
          gamestarttimestamp: gameStartTimestamp,
          gametype: gameType,
          gameversion: gameVersion,
          mapid: mapId,
          queueid: queueId,
        },
      });
    }
  }

  static async matchExists(matchId) {
    const match = await prisma.matches.findUnique({
      where: {
        matchid: matchId,
      },
    });
    return match !== null;
  }

  static async savePlayer(participant, matchid) {
    if (!participant || !matchid) {
      throw new Error("Missing parameters");
    }
    try {
      const result = await prisma.$queryRaw`INSERT INTO players (puuid, summonername, kills, assists, deaths, kda, goldearned, item0, item1, item2, item3, item4, item5, item6, championname, championid, individualposition, visionscore, lane, role, teamid, win, matchid) VALUES (${participant.puuid}, ${participant.summonerName}, ${participant.kills}, ${participant.assists}, ${participant.deaths}, ${participant.challenges.kda}, ${participant.goldEarned}, ${participant.item0}, ${participant.item1}, ${participant.item2}, ${participant.item3}, ${participant.item4}, ${participant.item5}, ${participant.item6}, ${participant.championName}, ${participant.championId}, ${participant.individualPosition}, ${participant.visionScore}, ${participant.lane}, ${participant.role}, ${participant.teamId}, ${participant.win}, ${matchid});`;
      return result;
    } catch (error) {
      console.error("Erro ao salvar jogador:", error);
      throw error;
    }
  }
}

module.exports = Match;
