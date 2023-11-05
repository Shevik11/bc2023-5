const express = require('express');
// const fs = require('fs');
const fs = require('fs').promises;
const app = express();
const port = 8000;

app.use(express.json()); // Для парсингу JSON
app.use(express.urlencoded({ extended: true })); // Для розширеного парсингу об'єктів запиту
app.use(express.static('static')); // Вказуємо, що файли з папки 'static' мають бути доступні

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/static/UploadForm.html'); // Повертаємо файл UploadForm.html
// });

app.get('/', (req, res) => {
  res.send('Сервіс запущено. Вітаємо!');
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(__dirname + '/static/UploadForm.html'); // Повертаємо файл UploadForm.html
});

  // Оновлений GET-запит для отримання нотаток
  app.get('/notes', async (req, res) => {
    try {
        const data = await fs.readFile('notes.json', 'utf8');
        const notes = JSON.parse(data);
        res.json(notes); // Повертаємо нотатки у форматі JSON
    } catch (error) {
        // Обробка помилки, якщо файл notes.json не існує або містить некоректний JSON
        console.error('Помилка при отриманні нотаток:', error);
        res.status(500).json([]);
    }
});

app.get('/notes/:noteName', async (req, res) => {
  const noteName = req.params.noteName; // отримує значення параметру

  if (noteName.trim() === '') { // Перевіряємо, чи не порожній параметр
      res.status(400).send('Введіть назву нотатки.'); // Bad request
      return;
  }

  try {
      const data = await fs.readFile('notes.json', 'utf8'); 
      const notes = JSON.parse(data); 
      const note = notes.find((n) => n.note_name === noteName); // Знаходимо нотатку за назвою
      
      if (note) {
        res.send(note.note);
      } else {
        res.status(404).send('Not found'); 
      }
    } catch (error) {
        console.error('Помилка при читанні notes.json:', error);
        res.status(500).send('Помилка сервера'); // Internal Server Error
    }
});


// Оновлений posT-запит для створення нотатки Notename
app.post('/upload', async (req, res) => {
  // Отримано дані з тіла запиту
  const noteName = req.body.note_name; 
  const noteText = req.body.note;

  try {
    // Зчитуємо існуючі нотатки з файлу
    const data = await fs.readFile('notes.json', 'utf8');
    const notes = JSON.parse(data);

    if (notes.some((note) => note.note_name === noteName)) { // Перевіряємо, чи не існує нотатка з такою назвою
      res.status(400).send('Така назва вже є');2
    } else {
      const newNote = { note_name: noteName, note: noteText }; // Створюється
      notes.push(newNote); // Додаємо до масиву

      // Зберігаємо оновлені нотатки у форматі JSON
      await fs.writeFile('notes.json', JSON.stringify(notes), 'utf8'); // перетворенння обєкта в рядок і додавання у файл
      res.status(201).send('Створено');
    }
  } catch (error) {
    console.error('Помилка при завантаженні нотаток:', error);
    res.status(500).send('Помилка сервера'); // Internal Server Error
  }
});


app.put('/notes/:noteName', async (req, res) => {
  const noteName = req.params.noteName; // отримує дані з параметру
  const noteText = req.body.note; // отримує дані з тіла запиту

  if (noteName.trim() === '') { // Перевіряємо, чи не порожній параметр
    res.status(400).send('Будь ласка, введіть назву нотатки.');
    return;
  }

  try {
      // Зчитуємо існуючі нотатки з файлу
    const data = await fs.readFile('notes.json', 'utf8');
    const notes = JSON.parse(data);
    const noteIndex = notes.findIndex((n) => n.note_name === noteName); // визначає індекс нотатки за введеним іменем

    if (noteIndex !== -1) { // Перевіряємо, чи існує нотатка з такою назвою
      notes[noteIndex].note = noteText; // Оновлюємо нотатку

      // Зберігаємо оновлені нотатки у форматі JSON
      await fs.writeFile('notes.json', JSON.stringify(notes), 'utf8');
      res.status(200).send('Все добре'); // ОК
    } else {
      res.status(404).send('Не знайдено'); 
    }
  } catch (error) {
    console.error('Помилка при оновленні нотаток:', error);
    res.status(500).send('Помилка сервера'); // Internal Server Error
  }
});


app.delete('/notes/:noteName', async (req, res) => {
  const noteName = req.params.noteName; // отримує дані з параметру

  try {
    // Зчитуємо існуючі нотатки з файлу
    const data = await fs.readFile('notes.json', 'utf8');
    const notes = JSON.parse(data);
    const noteIndex = notes.findIndex((n) => n.note_name === noteName); // визначає індекс нотатки за введеним іменем

    if (noteIndex !== -1) { // Перевіряємо, чи існує нотатка з такою назвою
      notes.splice(noteIndex, 1); // видалення цієї нотатки

      // Зберігаємо оновлені нотатки у форматі JSON
      await fs.writeFile('notes.json', JSON.stringify(notes), 'utf8'); // перетворення обєкта в рядок і додавання у файл
      res.status(200).send('Все добре');
    } else {
      res.status(404).send('Не знайдено');
    }
  } catch (error) {
    console.error('Помилка при видаленні нотатки:', error);
    res.status(500).send('Помилка сервера'); // Internal Server Error
  }
});

app.listen(port, () => {
  console.log(`Сервер працює на порту ${port}`);
});