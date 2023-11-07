const teammatesModel = require('../models/team.model.js');

exports.getTopWinningTeammates = async (req, res) => {
  const summonerPuuid = req.params.puuid;
  try {
    const teammatesResult = await teammatesModel.getTopWinningTeammates(summonerPuuid);

    const formattedTeammates = teammatesResult.map(teammate => ({
      summonername: teammate.summonername,
      wins: Number(teammate.wins),
      total_games: Number(teammate.total_games),
      winrate: Number(teammate.winrate)
    }));

    res.json(formattedTeammates);
  } catch (error) {
    console.error('Erro ao buscar dados do banco de dados:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco de dados' });
  }
};