const axios = require('axios');
require("dotenv").config({ path: "../.env" });
const { RIOT_API, RIOT_API_BASE_URL, RIOT_API_BASE_URL_BR } = process.env;
class RiotApiService {
  static async getMatchIdsByPuuid(puuid, count) {
    try {
      const response = await axios.get(`${RIOT_API_BASE_URL}/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}&type=ranked`, {
        headers: {
          'X-Riot-Token': RIOT_API
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro na chamada da API da Riot:', error);
      throw error;
    }
  }

  static async getMatchDetails(matchId) {
    try {
      const response = await axios.get(`${RIOT_API_BASE_URL}/match/v5/matches/${matchId}`, {
        headers: {
          'X-Riot-Token': RIOT_API
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro na chamada da API da Riot:', error);
      throw error;
    }
  }

  static async getSummonerByName(summonerName) {
    try {
      const response = await axios.get(`${RIOT_API_BASE_URL_BR}/summoner/v4/summoners/by-name/${summonerName}`, {
        headers: {
          'X-Riot-Token': RIOT_API
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro na chamada da API da Riot:', error);
      throw error;
    }
  }

}

module.exports = RiotApiService;
