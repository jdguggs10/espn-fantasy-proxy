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

    // 🛡️ Defensive check to avoid crashing
    const teams = response.data?.teams;
    if (!teams || !Array.isArray(teams)) {
      console.error('[Proxy] ESPN response is missing `teams` field.');
      return res.status(500).json({ error: 'No teams found in ESPN response. Check cookies or league setup.' });
    }

    // 🎯 Build standings list
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
