const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// 1. РАЗРЕШЕНИЕ CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-apisports-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 2. API - ПОИСК КОМАНДЫ
app.get('/api/football/teams', async (req, res) => {
  const search = req.query.search;
  if (!search) return res.status(400).json({ error: 'Параметр search обязателен' });

  try {
    const response = await fetch(`https://v3.football.api-sports.io/teams?search=${encodeURIComponent(search)}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': 'api-40a548b23a46b859463c5bf4d4698aa1'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Ошибка поиска команды:', error);
    res.status(500).json({ error: 'Ошибка запроса к API-Football' });
  }
});

// 3. API - H2H (ОЧНЫЕ ВСТРЕЧИ)
app.get('/api/football/fixtures/headtohead', async (req, res) => {
  const h2h = req.query.h2h;
  const last = req.query.last || 10;
  if (!h2h) return res.status(400).json({ error: 'Параметр h2h обязателен' });

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${h2h}&last=${last}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': 'api-40a548b23a46b859463c5bf4d4698aa1'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Ошибка H2H:', error);
    res.status(500).json({ error: 'Ошибка запроса H2H к API-Football' });
  }
});

// 4. API - ПРОВЕРКА ЗДОРОВЬЯ (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Сервер и API работают!' });
});

// ==========================================
// 5. РАЗДАЧА ФРОНТЕНДА (ИЗМЕНЕНИЕ №1 - используем __dirname)
// ==========================================
const pathToPublic = path.join(__dirname, 'public');
console.log('📂 Сервер ищет папку по пути:', pathToPublic); // Эта строка появится в логах Render
app.use(express.static(pathToPublic));

// ==========================================
// 6. FALLBACK (ИЗМЕНЕНИЕ №2 - явный путь к файлу)
// ==========================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 7. ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
  console.log(`✅ Сервер и API запущены на порту: ${PORT}`);
});
