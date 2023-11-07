const router = require('express').Router();
const axios = require('axios');
const Router = require('express').Router;
const usersController = require('../controllers/users.controller');
const summonersController = require('../controllers/summoners.controller');
// const championsController = require('../controllers/champions.controller');
// const itemsController = require('../controllers/items.controller');
// const runesController = require('../controllers/runes.controller');
// const spellsController = require('../controllers/spells.controller');
const matchesController = require('../controllers/matches.controller');
// const matchlistsController = require('../controllers/matchlists.controller');
// const leaguesController = require('../controllers/leagues.controller');
// const clashController = require('../controllers/clash.controller');
// const tournamentsController = require('../controllers/tournaments.controller');
// const tournamentsStubController = require('../controllers/tournamentsStub.controller');
const teamsController = require('../controllers/teams.controller');

router.get('/', async (req, res) => {
    const { data } = await axios.get('https://dummyjson.com/quotes/random');
    res.json(data);
    }
);

// Rotas de usuários
router.get('/users', usersController.getUsers);
router.get('/users/:id', usersController.getUserById);
router.post('/users', usersController.createUser);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);

// Rotas da API da Riot
// Matches
router.get('/matches/:puuid', matchesController.getAllMatchsAndSave);
router.get('/matches/:puuid/:count', matchesController.getAllMatchsAndSave);

// Summoners
router.get('/summoners', summonersController.getAllSummoners);
router.get('/summoners/:id', summonersController.getSummonerById);
router.get('/getSummonerByPuuid/:puuid', summonersController.getSummonerByPuuid);
router.get('/getSummonerByName/:name', summonersController.getSummonerByName);
router.get('/getSummoner/:name', summonersController.getSummoner);

router.post('/summoners', summonersController.createSummoner);

router.put('/summoners/:puuid', summonersController.updateSummoner);

router.delete('/summoners/:puuid', summonersController.deleteSummoner);

// Rotas de Stats
router.get('/teammates/:puuid', teamsController.getTopWinningTeammates);
// router.get('/enemies/:puuid', teamsController.getTopWinningEnemies);
// router.get('/teammates/:puuid/:championId', teamsController.getTopWinningTeammatesByChampion);
// router.get('/enemies/:puuid/:championId', teamsController.getTopWinningEnemiesByChampion);
// router.get('/teammates/:puuid/:championId/:lane', teamsController.getTopWinningTeammatesByChampionAndLane);
// router.get('/enemies/:puuid/:championId/:lane', teamsController.getTopWinningEnemiesByChampionAndLane);
router.get('/getAllChampionsWinRate/:puuid', teamsController.getAllChampionsWinRate);

// Rotas da API do Data Dragon
// Champions
// router.get('/champions', championsController.getChampions);
// router.get('/champions/:id', championsController.getChampionById);
// Spells
// router.get('/spells', spellsController.getSpells);
// router.get('/spells/:id', spellsController.getSpellById);
// Runes
// router.get('/runes', runesController.getRunes);
// router.get('/runes/:id', runesController.getRuneById);
// Items
// router.get('/items', itemsController.getItems);
// router.get('/items/:id', itemsController.getItemById);



// Rotas do MongoDB

router.get('/teammates/:puuid', teamsController.getTopWinningTeammates);

// Rotas da API do OpenAI

// Rotas da API do Discord

// Rotas da API do Twitch

// Rotas da API do Twitter


module.exports = router;