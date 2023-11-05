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

router.get('/matches/:puuid', matchesController.getAllMatchsAndSave);

router.get('/summoners', summonersController.getAllSummoners);
router.get('/summoners/:puuid', summonersController.getSummonerById);
router.post('/summoners', summonersController.createSummoner);
router.put('/summoners/:puuid', summonersController.updateSummoner);
router.delete('/summoners/:puuid', summonersController.deleteSummoner);

// Rotas do MongoDB


// Rotas da API do OpenAI

// Rotas da API do Discord

// Rotas da API do Twitch

// Rotas da API do Twitter


module.exports = router;