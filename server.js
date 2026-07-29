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

// ===== TheSportsDB (с поддержкой лиг) =====
app.get('/api/sportsdb/:id/:season', async (req, res) => {
    try {
        const id = req.params.id || req.query.id;
        const season = req.params.season || req.query.season;

        if (!id || !season) {
            return res.status(400).json({ error: 'Укажите ID лиги и сезон (например: 4328/2024-2025)' });
        }

        // Ищем по ID лиги, это работает 100%
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

// ===== xG (Understat) =====
app.get('/api/xg/:league', async (req, res) => {
    try {
        const league = req.params.league || req.query.league;

        if (!league) {
            return res.status(400).json({ error: 'Не указана лига' });
        }

        const url = `https://understat.com/league/${league}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        const html = response.data;
        
        // ⚠️ ГЛАВНОЕ ИЗМЕНЕНИЕ: Ищем datesDataNew, а не datesData
        const match = html.match(/var datesDataNew=(\s*\{.*?\}\s*);/s);

        if (!match) {
            return res.status(404).json({ error: 'Не удалось найти данные о xG на странице' });
        }

        try {
            const parsedData = JSON.parse(match[1]);
            res.json(parsedData);
        } catch (parseError) {
            return res.status(500).json({ error: 'Ошибка парсинга JSON данных xG' });
        }

    } catch (error) {
        console.error('Ошибка Understat:', error.message);
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
