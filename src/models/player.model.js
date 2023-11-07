const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ log: ['query', 'info'] });

class Player {
  static async create(playerData) {
    const player = await prisma.player.create({
      data: playerData,
    });
    return player;
  }

  static async findById(id) {
    const player = await prisma.player.findUnique({
      where: {
        id,
      },
    });
    return player;
  }

  static async findAll() {
    const players = await prisma.player.findMany();
    return players;
  }

  static async update(id, playerData) {
    const player = await prisma.player.update({
      where: {
        id,
      },
      data: playerData,
    });
    return player;
  }

  static async delete(id) {
    const player = await prisma.player.delete({
      where: {
        id,
      },
    });
    return player;
  }

  static async savePlayer(participant, matchid) {
    if (!participant || !matchid) {
      throw new Error("Missing parameters");
    }
    return prisma.players.create({
      data: {
        puuid: puuid,
        summonername: summonerName,
        kills: kills,
        assists: assists,
        deaths: deaths,
        kda: participant.challenges.kda,
        goldearned: goldEarned,
        item0: item0,
        item1: item1,
        item2: item2,
        item3: item3,
        item4: item4,
        item5: item5,
        item6: item6,
        championname: championName,
        championid: championid,
        individualposition: individualposition,
        visionscore: visionscore,
        lane: lane,
        role: role,
        teamid: teamid,
        win: win,
        matchid: matchid,
      },
    });
  }
}

module.exports = Player;
