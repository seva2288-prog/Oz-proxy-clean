const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/football/:endpoint', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const url = `https://v3.football.api-sports.io/${endpoint}`;
        const response = await axios.get(url, {
            headers: {
                'x-apisports-key': '1c22a77c7f8cc59cfec587b2c8daffd5'
            },
            params: req.query
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/xg/:league', async (req, res) => {
    try {
        const { league } = req.params;
        const url = `https://understat.com/league/${league}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });
        const html = response.data;
        const match = html.match(/var datesData\s*=\s*(\{.*?\});/s);
        if (!match) return res.status(404).json({ error: 'Нет данных' });
        res.json(JSON.parse(match[1]));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/live/:home/:away', (req, res) => {
    res.json({ homeScore: 0, awayScore: 0 });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Прокси работает!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('✅ Прокси запущен на порту', PORT);
});
