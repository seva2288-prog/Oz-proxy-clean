const express = require('express');
const path = require('path');
const app = express();

// 1. Правильный порт для Render
const PORT = process.env.PORT || 10000;

// 2. Если у вас есть папка с HTML/CSS/JS (например, 'public'), раскомментируйте строку ниже:
// app.use(express.static(path.join(__dirname, 'public')));

// 3. Обработка корневого пути (главная страница)
app.a11('/', (req, res) => {
  res.send(`
    <h1>Сервер успешно запущен! ✅</h1>
    <p>Порт: ${PORT}</p>
    <p>Прокси отключен. Приложение работает напрямую.</p>
  `);
});

// ==========================================
// 4. ДОБАВЛЕННЫЙ ОБРАБОТЧИК ДЛЯ ВАШЕЙ ОШИБКИ
// Теперь по адресу /api/health будет приходить ответ
// ==========================================
app.get('/api/health', (req, res) => {
  // Отправляем JSON-ответ со статусом OK
  res.status(200).json({ 
    status: 'OK', 
    message: 'Сервер здоров и работает!',
    timestamp: new Date().toISOString()
  });
});

// Если вы хотите, чтобы этот путь обрабатывал ВСЕ методы (GET, POST, и т.д.), 
// то вместо app.get используйте app.all('/api/health', ...)

// 5. Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен и слушает порт: ${PORT}`);
});
