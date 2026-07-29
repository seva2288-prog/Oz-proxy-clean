const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// --- 1. НАСТРОЙКА ПОРТА (Самое важное для Render!) ---
// Render сам подставит свой порт в process.env.PORT
const PORT = process.env.PORT || 10000; 

// --- 2. ОБРАБОТКА ГЛАВНОЙ СТРАНИЦЫ (Убираем ошибку Cannot GET /) ---
// Если вы просто заходите на сайт, он покажет это сообщение вместо ошибки
app.get('/', (req, res) => {
  res.send(`
    <h1>Прокси-сервер успешно запущен! 🚀</h1>
    <p>Порт: ${PORT}</p>
    <p>Прокси работает и ждет запросов.</p>
  `);
});

// --- 3. НАСТРОЙКА ПРОКСИ (Если он вам нужен) ---
// Если вы проксируете запросы на другой локальный сервер, укажите его порт ниже.
// Например, если у вас есть сервер на порту 3000, укажите 'http://localhost:3000'
// Если прокси не нужен, просто удалите этот блок кода.

const TARGET_SERVER = 'http://localhost:3000'; // <-- СМОТРИТЕ СЮДА: поменяйте на ваш целевой порт

app.use('/', createProxyMiddleware({
  target: TARGET_SERVER,
  changeOrigin: true,
  // Если путь не найден на целевом сервере, возвращаем 404 вместо ошибки прокси
  onError: (err, req, res) => {
    res.status(500).send('Ошибка подключения к целевому серверу прокси.');
  }
}));

// --- 4. ЗАПУСК СЕРВЕРА ---
app.listen(PORT, () => {
  console.log(`✅ Прокси запущен и слушает порт: ${PORT}`);
  console.log(`🔄 Проксирует запросы на: ${TARGET_SERVER}`);
});
