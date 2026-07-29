const express = require('express');
const axios = require('axios');

const app = express();

// 1. CORS (разрешаем запросы с любых доменов, чтобы фронтенд работал)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ===== TheSportsDB (НОВЫЙ ЭНДПОИНТ) =====
app.get('/api/sportsdb/:home/:away', async (req, res) => {
    try {
        // Берем параметры как из пути, так и из query строки (для гибкости)
        const home = req.params.home || req.query.home;
        const away = req.params.away || req.query.away;

        if (!home || !away) {
            return res.status(400).json({ error: 'Не указаны команды (home и away)' });
        }

        // ВАЖНО: Исправлено http на https
        const url = `https://www.thesportsdb.com/api/v1/json/3/eventspast.php?t=${home}&s=${away}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        res.json(response.data);
    } catch (error) {
        console.error('Ошибка TheSportsDB:', error.message);
        res.status(500).json({ 
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

        // ВАЖНО: Исправлено http на https
        const url = `https://understat.com/league/${league}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 15000
        });

        const html = response.data;
        // Парсим данные из скрипта
        const match = html.match(/var datesData=(\s*\{.*?\}\s*);/s);

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

// ===== Health check (Проверка здоровья) =====
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Прокси работает!',
        port: process.env.PORT || 3000
    });
});

// ===== Запуск сервера =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Прокси запущен на порту ${PORT}`);
});
