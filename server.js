const express = require('express');
const axios = require('axios');

const app = express();

// Разрешаем CORS (чтобы фронтенд мог подключаться)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Простой кэш в памяти, чтобы не долбить TheSportsDB каждый раз
const cache = {};

// ===== TheSportsDB =====
app.get('/api/sportsdb/:home/:away', async (req, res) => {
    try {
        const home = req.params.home || req.query.home;
        const away = req.params.away || req.query.away;
        const cacheKey = `${home}-${away}`;

        if (!home || !away) {
            return res.status(400).json({ error: 'Не указаны команды (home и away)' });
        }

        // Если данные есть в кэше (и им меньше 5 минут), отдаём их сразу
        if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < 300000)) {
            return res.json(cache[cacheKey].data);
        }

        const url = `https://www.thesportsdb.com/api/v1/json/3/eventspast.php?t=${home}&s=${away}`;

        const response = await axios.get(url, {
            headers: {
                // Маскируемся под реальный браузер, чтобы обойти защиту 429
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.thesportsdb.com/'
            },
            timeout: 20000
        });

        // Сохраняем в кэш
        cache[cacheKey] = {
            data: response.data,
            timestamp: Date.now()
        };

        res.json(response.data);
    } catch (error) {
        console.error('Ошибка TheSportsDB:', error.message);
        // Если 429, пишем понятное сообщение пользователю
        const status = error.response ? error.response.status : 500;
        const message = status === 429 
            ? 'Слишком много запросов к TheSportsDB. Пожалуйста, подождите минуту и попробуйте снова.' 
            : error.message;
            
        res.status(status).json({ 
            error: 'Ошибка при запросе к TheSportsDB',
            details: message
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        const html = response.data;
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
