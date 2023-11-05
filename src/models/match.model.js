const postgres = require("postgres");
require("dotenv").config({ path: "../.env" });
let {
  PGHOST_POOLED,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  ENDPOINT_ID_POOLED,
} = process.env;

const sql = postgres({
  host: PGHOST_POOLED,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID_POOLED}`,
  },
});

class Match {
  static async find() {
    const rows = await sql`SELECT * FROM matches`;
    return rows;
  }

  static async findById(id) {
    const match = await sql`SELECT * FROM matches WHERE matchid = ${id}`;
    return match;
  }

  static async createMatch(match) {
    try {
      const newMatch =
        await sql`INSERT INTO matches (matchid, match) VALUES (${match.gameId}, ${match}) RETURNING *`;
      return newMatch;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async saveMatchData(matchId, gameDuration, gameMode) {
    if (!matchId || !gameDuration || !gameMode) {
      throw new Error("Missing parameters");
    }
    const matchInsertResult =
      await sql`insert into matches (matchId, gameDuration, gameMode) values (${matchId}, ${gameDuration}, ${gameMode}) returning matchId`;
    return matchInsertResult;
  }

  static async matchExists(matchId) {
    const matchExists =
      await sql`select exists(select 1 from matches where matchId = ${matchId})`;
    return matchExists;
  }

  static async savePlayer(participant, matchId) {
    if (!participant || !matchId) {
      throw new Error("Missing parameters");
    }
    const savePlayerFromMatch =
      await sql`insert into players (puuid, summonerName, kills, assists, deaths, kda, goldEarned, item0, item1, item2, item3, item4, item5, item6, championName, championId, individualPosition, visionScore, lane, role, teamId, win, matchId) values (${participant.puuid}, ${participant.summonerName}, ${participant.kills}, ${participant.assists}, ${participant.deaths}, ${participant.challenges.kda}, ${participant.goldEarned}, ${participant.item0}, ${participant.item1}, ${participant.item2}, ${participant.item3}, ${participant.item4}, ${participant.item5}, ${participant.item6}, ${participant.championName}, ${participant.championId}, ${participant.individualPosition}, ${participant.visionScore}, ${participant.lane}, ${participant.role}, ${participant.teamId}, ${participant.win}, ${matchId})`;
    return savePlayerFromMatch;
  }
}

module.exports = Match;
