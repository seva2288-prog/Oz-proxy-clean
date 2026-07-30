const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// 1. CORS (Разрешаем запросы с любых устройств)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-apisports-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 2. ЕДИНЫЙ ПРОКСИ-ОБРАБОТЧИК ДЛЯ ВСЕХ ЗАПРОСОВ К API
// Любой запрос, начинающийся с /api/, будет отправлен в API-Football
app.get('/api/*', async (req, res) => {
  // Собираем полный путь запроса (например: /teams, /fixtures/headtohead)
  const apiPath = req.path.replace('/api', ''); 
  
  // Передаем все параметры (например, ?search=Real%20Madrid)
  const queryString = req.url.includes('?') ? req.url.split('?')[1] : ''; 

  // ВАЖНО: Ваш ключ API (он у вас правильный)
  const API_KEY = '40a548b23a46b859463c5bf4d4698aa1';

  const url = `https://v3.football.api-sports.io${apiPath}${queryString ? '?' + queryString : ''}`;

  console.log('🔄 Прокси запрос к:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Ошибка прокси:', error.message);
    res.status(500).json({ error: 'Ошибка при запросе к API-Football через прокси' });
  }
});

// 3. РАЗДАЧА ФРОНТЕНДА (Ваш index.html)
app.use(express.static(path.join(__dirname, './')));

// 4. FALLBACK (Если путь не найден, отдаем index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 5. ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
  console.log(`✅ Сервер и Прокси запущены на порту: ${PORT}`);
});
