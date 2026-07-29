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

// Простой кэш
const cache = {};

// ===== TheSportsDB =====
app.get('/api/sportsdb/:id/:season', async (req, res) => {
    try {
        const id = req.params.id || req.query.id;
        const season = req.params.season || req.query.season;

        if (!id || !season) {
            return res.status(400).json({ error: 'Укажите ID лиги и сезон (например: 4328/2024-2025)' });
        }

        const url = `https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=${id}&s=${season}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.thesportsdb.com/'
            },
            timeout: 20000
        });

        res.json(response.data);
    } catch (error) {
        console.error('Ошибка TheSportsDB:', error.message);
        const status = error.response ? error.response.status : 500;
        res.status(status).json({ 
            error: 'Ошибка при запросе к TheSportsDB',
            details: error.message
        });
    }
});

// ===== xG (Understat) через скрытое API =====
app.get('/api/xg/:league', async (req, res) => {
    try {
        const league = req.params.league || req.query.league;

        if (!league) {
            return res.status(400).json({ error: 'Не указана лига' });
        }

        // Стучимся прямо в их внутреннее API, оно всегда работает
        const url = `https://understat.com/api/league/${league}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 15000
        });

        // API возвращает чистый JSON, парсить HTML не нужно
        res.json(response.data);

    } catch (error) {
        console.error('Ошибка Understat API:', error.message);
        res.status(500).json({ 
            error: 'Ошибка при запросе к Understat',
            details: error.message 
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Прокси запущен на порту ${PORT}`);
});
