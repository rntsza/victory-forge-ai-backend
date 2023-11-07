// No seu arquivo de modelo (por exemplo, teammates.model.js)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Team {
  static async getTopWinningTeammates(puuid) {
    const teammates = await prisma.$queryRaw`
          WITH teammate_wins AS (
            SELECT d.summonerName, COUNT(*) as wins
            FROM players AS p
            INNER JOIN players AS d ON p.matchId = d.matchId AND p.teamId = d.teamId
            WHERE p.puuid = ${puuid} AND d.puuid != ${puuid} AND p.win = true
            GROUP BY d.summonerName
          ),
          teammate_games AS (
            SELECT d.summonerName, COUNT(*) as total_games
            FROM players AS p
            INNER JOIN players AS d ON p.matchId = d.matchId AND p.teamId = d.teamId
            WHERE p.puuid = ${puuid} AND d.puuid != ${puuid}
            GROUP BY d.summonerName
            HAVING COUNT(*) > 3
          )
          SELECT w.summonerName, w.wins, g.total_games, ROUND((w.wins::numeric / g.total_games::numeric) * 100, 2) as winrate
          FROM teammate_wins w
          INNER JOIN teammate_games g ON w.summonerName = g.summonerName
          WHERE g.total_games > 3
          ORDER BY w.wins DESC, winrate DESC
          LIMIT 100
        `;
    return teammates;
  }

  static async getAllChampionsWinRate(puuid) {
    try {
      const championsStats = await prisma.$queryRaw`
      SELECT 
        championName,
        championId,
        SUM(CASE WHEN win THEN 1 ELSE 0 END) as wins,
        COUNT(*) - SUM(CASE WHEN win THEN 1 ELSE 0 END) as losses
      FROM players
      WHERE puuid = ${puuid}
      GROUP BY championName, championId;`;

      const winRates = championsStats.map((champion) => {
        const totalGames = parseInt(champion.wins) + parseInt(champion.losses);
        const winRate = (parseInt(champion.wins) / totalGames) * 100;

        return {
          championName: champion.championname,
          championId: champion.championid,
          winRate: winRate.toFixed(2) + "%",
          wins: parseInt(champion.wins),
          losses: parseInt(champion.losses),
        };
      });
      return winRates;
    } catch (error) {
      console.error("Erro ao buscar dados do banco de dados:", error);
      throw error;
    }
  }
}

module.exports = Team;
