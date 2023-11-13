const express = require('express');
const fs = require('fs');
const multer = require('multer');
const upload = multer();
const app = express();
const port = 8000;

app.use(multer().none());
app.use(express.json());
app.use(express.static('static'));

const notes = [];

app.get('/', (req, res) => {
  res.send('Сервіс запущено. Вітаємо!');
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(__dirname + '/static/UploadForm.html');
});

app.get('/notes', (req, res) => {
  res.json(notes);
});

app.get('/notes/:note_name', (req, res) => {
  const note_name = req.params.note_name;
  const findnote = notes.find(note => note.note_name === note_name);

  if (findnote) {
    res.send({ note_name: note_name, note: findnote.note });
  } else {
    res.status(404).send('Not Found');
  }
});

app.post('/upload', (req, res) => {
  const note_name = req.body.note_name;
  const note = req.body.note;

  const existing = notes.find(note => note.note_name === note_name);

  if (existing) {
    res.status(400).send("Bad Request");
  } else {
    notes.push({ note_name: note_name, note: note });

    // Зберігаємо оновлені нотатки у форматі JSON
    fs.writeFileSync('notes.json', JSON.stringify(notes), 'utf8');

    res.status(201).send("OK");
  }
});

app.put('/notes/:note_name', (req, res) => {
  const note_name = req.params.note_name;
  const note = req.body.note;
  const noteIndex = notes.findIndex(note => note.note_name === note_name);

  if (noteIndex !== -1) {
    notes[noteIndex].note = note;
    fs.writeFileSync('notes.json', JSON.stringify(notes), 'utf8');
    res.status(200).send("OK");
  } else {
    res.status(404).json("Not Found");
  }
});

app.delete('/notes/:note_name', (req, res) => {
  const note_name = req.params.note_name;
  const noteIndex = notes.findIndex(note => note.note_name === note_name);

  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
    fs.writeFileSync('notes.json', JSON.stringify(notes), 'utf8');
    res.status(200).send('OK');
  } else {
    res.status(404).send('Not Found');
  }
});

app.listen(port, () => {
  console.log(`Сервер працює на порту ${port}`);
});
