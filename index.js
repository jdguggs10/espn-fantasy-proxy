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

app.get('/standings', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}?view=mStandings`, {
      headers: {
        'Cookie': COOKIES,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://fantasy.espn.com/',
        'Origin': 'https://fantasy.espn.com'
      }
    });

    const teams = response.data?.teams;

    if (!teams || !Array.isArray(teams)) {
      console.error('[Proxy] No teams returned. Raw response:', response.data);
      return res.status(500).json({
        error: 'No teams returned from ESPN. Possible invalid cookie, wrong league, or ESPN blocked the call.',
        rawResponse: response.data
      });
    }

    const standings = teams.map(team => ({
      id: team.id,
      name: `${team.location} ${team.nickname}`,
      rank: team.rankCalculatedFinal,
      record: team.record.overall
    }));

    res.json({ standings });
  } catch (err) {
    console.error('[Proxy] Error fetching standings:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Just to confirm app is live
app.get('/', (req, res) => {
  res.send('✅ ESPN Fantasy Proxy is running!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ ESPN Proxy running on port ${process.env.PORT}`);
});
