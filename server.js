const express = require('express');
const axios = require('axios');

const app = express();

// Разрешаем CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ===== API-Football (Турнирная таблица) =====
app.get('/api/matches/:leagueId/:season', async (req, res) => {
    try {
        const leagueId = req.params.leagueId || req.query.leagueId;
        const season = req.params.season || req.query.season;

        if (!leagueId || !season) {
            return res.status(400).json({ error: 'Укажите ID лиги и сезон' });
        }

        const API_KEY = process.env.API_FOOTBALL_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: 'Не найден ключ API_FOOTBALL_KEY' });
        }

        const url = 'https://v3.football.api-sports.io/standings';

        const response = await axios.get(url, {
            params: {
                league: leagueId,
                season: season
            },
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            },
            timeout: 20000
        });

        res.json(response.data);

    } catch (error) {
        console.error('Ошибка API-Football:', error.message);
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data : error.message;
        res.status(status).json({
            error: 'Ошибка при запросе к API-Football',
            details: message
        });
    }
});

// ===== Health check =====
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Прокси работает!',
        port: process.env.PORT || 3000
    });
});

// ===== Запуск =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Прокси запущен на порту ${PORT}`);
});
