const express = require('express');
const path = require('path');
const app = express();

// 1. Правильный порт для Render
const PORT = process.env.PORT || 10000;

// 2. Если у вас есть папка с HTML/CSS/JS (например, 'public'), раскомментируйте строку ниже:
// app.use(express.static(path.join(__dirname, 'public')));

// 3. Обработка корневого пути (убирает ошибку Cannot GET /)
app.get('/', (req, res) => {
  res.send(`
    <h1>Сервер успешно запущен! ✅</h1>
    <p>Порт: ${PORT}</p>
    <p>Прокси отключен. Приложение работает напрямую.</p>
  `);
});

// 4. Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен и слушает порт: ${PORT}`);
});
