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
}

module.exports = Team;
