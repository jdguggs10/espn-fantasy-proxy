// index.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const LEAGUE_ID = '30201';
const SEASON_ID = '2025';
const BASE_URL = `https://fantasy.espn.com/apis/v3/games/flb/seasons/${SEASON_ID}/segments/0/leagues/${LEAGUE_ID}`;

const COOKIES = process.env.ESPN_COOKIE;

// GET /standings
app.get('/standings', async (req, res) => {
  try {
    const filter = {
      teams: {
        filterIds: {
          value: Array.from({ length: 12 }, (_, i) => i + 1)
        }
      }
    };
    const response = await axios.post(`${BASE_URL}?view=mStandings`, filter, {
      headers: {
        'Cookie': COOKIES,
        'X-Fantasy-Filter': JSON.stringify(filter),
        'Content-Type': 'application/json'
      }
    });

    const standings = response.data.teams.map(team => ({
      id: team.id,
      name: `${team.location} ${team.nickname}`,
      rank: team.rankCalculatedFinal,
      record: team.record.overall
    }));

    res.json({ standings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /roster/:teamId
app.get('/roster/:teamId', async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const response = await axios.get(`${BASE_URL}?view=mTeam`, {
      headers: {
        'Cookie': COOKIES
      }
    });

    const team = response.data.teams.find(t => t.id === teamId);
    res.json({ roster: team.roster.entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ ESPN Proxy running on port ${PORT}`);
});
