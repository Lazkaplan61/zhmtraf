// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new Database('forum.db');
db.prepare(`CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  board TEXT,
  name TEXT,
  content TEXT,
  createdAt TEXT
)`).run();
db.prepare(`CREATE TABLE IF NOT EXISTS replies (
  id TEXT PRIMARY KEY,
  postId TEXT,
  name TEXT,
  content TEXT,
  createdAt TEXT
)`).run();

app.get('/api/posts', (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY createdAt DESC').all();
  for (const p of posts) {
    p.replies = db.prepare('SELECT * FROM replies WHERE postId = ? ORDER BY createdAt ASC').all(p.id);
  }
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const { id, board, name, content, createdAt } = req.body;
  if (!id || !content) {
    return res.status(400).json({ error: 'Eksik veri' });
  }
  db.prepare('INSERT INTO posts (id, board, name, content, createdAt) VALUES (?,?,?,?,?)')
    .run(id, board || 'genel', name || 'Anon', content, createdAt || new Date().toISOString());
  res.json({ ok: true });
});

app.post('/api/replies', (req, res) => {
  const { id, postId, name, content, createdAt } = req.body;
  if (!id || !postId || !content) {
    return res.status(400).json({ error: 'Eksik veri' });
  }
  db.prepare('INSERT INTO replies (id, postId, name, content, createdAt) VALUES (?,?,?,?,?)')
    .run(id, postId, name || 'Anon', content, createdAt || new Date().toISOString());
  res.json({ ok: true });
});

// Rapor için örnek endpoint
app.post('/api/report', (req, res) => {
  // Gerçek sistemde: DB ya da log kaydı, moderatöre bildirim vs.
  console.log('Report alınan içerik:', req.body);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server çalışıyor: http://localhost:${PORT}`));
