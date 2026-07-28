const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Корневой маршрут
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Прокси работает!' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Прокси работает!' });
});

// xG (Understat)
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
        if (!match) {
            return res.status(404).json({ error: 'Нет данных' });
        }
        res.json(JSON.parse(match[1]));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Live (заглушка)
app.get('/api/live/:home/:away', (req, res) => {
    res.json({ homeScore: 0, awayScore: 0 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('✅ Прокси запущен на порту', PORT);
});
