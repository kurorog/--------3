const express = require('express');
const app = express();
const port = 8080;

// Отдача статических файлов из папки public
app.use(express.static('public'));



app.listen(port, () => {
  console.log(`Сервер интерфейса пользователя запущен на http://localhost:${port}`);
});
