const express = require('express');
const fs = require('fs');
const multer = require('multer');
const app = express();
const port = 8000;


app.use(multer().none()) // обробляє запити без вкладених файлів
app.use(express.json()); // Для парсингу JSON
app.use(express.static('static')); // Вказуємо, що файли з папки 'static' мають бути доступні

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/static/UploadForm.html'); // Повертаємо файл UploadForm.html
// });
const notes = [];
app.get('/', (req, res) => {
  res.send('Сервіс запущено. Вітаємо!');
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(__dirname + '/static/UploadForm.html'); // Повертаємо файл UploadForm.html
});

  // Оновлений GET-запит для отримання нотаток
  app.get('/notes', (req, res) => {
    res.json(notes);
});

app.get('/notes/:note_name', (req, res) => {
  const note_name = req.params.note_name; // отримує значення параметру

      const findnote = notes.find(note => note.note_name === note_name); // Знаходимо нотатку за назвою
      
      if (findnote) {
        res.send({note_name: note_name, note: findnote.note});
      } else {
        res.status(404).send('німа'); 
      }
    } );


// Оновлений posT-запит для створення нотатки Notename
app.post('/upload', (req, res) => {
  // Отримано дані з тіла запиту
  const note_name = req.body.note_name; 
  const note = req.body.note;

  const exiting = notes.find(note => note.note_name === note_name);

  if (exiting) {
    res.status(400).send("Файл з такою назвою вже є");
  } else{
    notes.push({note_name: note_name, note: note});
    res.status(201).send("Нотатка успішно створена");
  }
});


app.put('/notes/:note_name',(req, res) => {
  const note_name = req.params.note_name; // отримує дані з параметру
  const note = req.body.note; // отримує дані з тіла запиту
    const noteIndex = notes.findIndex(note => note.note_name === note_name); // визначає індекс нотатки за введеним іменем

    if (noteIndex !== -1) { // Перевіряємо, чи існує нотатка з такою назвою
      notes[noteIndex].note = note; // Оновлюємо нотатку
      fs.writeFileSync('notes.json', JSON.stringify(notes), 'utf8')
      res.json({note_name: note_name,note: notes[noteIndex].note});
      res.status(200).send("Оновлено");
      
    }        
    else { 
      res.status(404).json("німа");}});

app.delete('/notes/:note_name',(req, res) => {
  const note_name = req.params.note_name; // отримує дані з параметру

  const noteIndex = notes.findIndex(note => note.note_name === note_name); // визначає індекс нотатки за введеним іменем

    if (noteIndex !== -1) { // Перевіряємо, чи існує нотатка з такою назвою
      notes.splice(noteIndex, 1); // видалення цієї нотатки

      // Зберігаємо оновлені нотатки у форматі JSON
      fs.writeFileSync('notes.json', JSON.stringify(notes), 'utf8'); // перетворення обєкта в рядок і додавання у файл
      res.status(200).send('Все добре');
    } else {
      res.status(404).send('німа');
    }
  } );

app.listen(port, () => {
  console.log(`Сервер працює на порту ${port}`);
});
