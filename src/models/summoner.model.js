const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
class Summoner {
  static async find() {
    try {
      const summoners = await prisma.summoner.findMany();
      return summoners;
    } finally {
      await prisma.$disconnect();
    }
  }

  static async findById(id) {
    try {
      const summoner = await prisma.summoners.findUnique({
        where: {
          puuid: id,
        },
      });
      return summoner;
    } catch (error) {
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  static async createSummoner(summoner) {
    const {
      id,
      accountid,
      puuid,
      name,
      profileiconid,
      revisiondate,
      summonerlevel,
    } = summoner;
    try {
      const summonerExists = await prisma.summoner.findUnique({
        where: {
          puuid: puuid,
        },
      });
      if (summonerExists) {
        throw new Error("Summoner já existe");
      }
      const newSummoner = await prisma.summoner.create({
        data: {
          id: id,
          accountid: accountid,
          puuid: puuid,
          name: name,
          profileiconid: profileiconid,
          revisiondate: revisiondate,
          summonerlevel: summonerlevel,
        },
      });
      return newSummoner;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  static async findByIdAndUpdate(id, body, validators) {
    const {
      accountid,
      puuid,
      name,
      profileiconid,
      revisiondate,
      summonerlevel,
    } = body;
    if (!validators || validators.length === 0) {
      throw new Error("No validators");
    }
    try {
      const updatedSummoner = await prisma.summoner.update({
        where: {
          puuid: id,
        },
        data: {
          id: id,
          accountid: accountid,
          puuid: puuid,
          name: name,
          profileiconid: profileiconid,
          revisiondate: revisiondate,
          summonerlevel: summonerlevel,
        },
        returning: true,
      });
      return updatedSummoner;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  static async findByIdAndDelete(id) {
    try {
      const deletedSummoner = await prisma.summoner.delete({
        where: {
          puuid: id,
        },
        returning: true,
      });
      return deletedSummoner;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

module.exports = Summoner;
