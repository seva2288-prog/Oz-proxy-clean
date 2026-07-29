const express = require('express');
const app = express();

// Порт для Render
const PORT = process.env.PORT || 10000;

// ==========================================
// БЛОК 1. РАЗРЕШЕНИЕ ЗАПРОСОВ (CORS) - защита от блокировок
// ==========================================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешаем всем
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Если браузер шлет предварительный запрос OPTIONS - сразу отвечаем ОК
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// БЛОК 2. ОБРАБОТКА КОРНЕВОГО ПУТИ (чтобы не падал и не было ошибки Cannot GET /)
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <h1>Сервер работает! ✅</h1>
    <p>Ошибок в коде нет.</p>
  `);
});

// ==========================================
// БЛОК 3. ВАШЕ API (Принимает ЛЮБЫЕ методы: и GET, и POST)
// ==========================================
// Здесь мы используем .all, чтобы сервер не падал, если фронтенд шлет POST
app.all('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Сервер здоров и работает!',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// БЛОК 4. ЗАПУСК
// ==========================================
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту: ${PORT}`);
});
