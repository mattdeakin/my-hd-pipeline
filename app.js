// app.js
const express = require('express');
const fs       = require('fs');
const path     = require('path');

const API_KEY   = process.env.API_KEY   || 'secret123';
const DATA_FILE = process.env.DATA_FILE || 'db.json';

const app   = express();
app.use(express.json());

/**
 * Simple API-key middleware
 * –  lets “/” through without a key (so the container can start)
 * –  every other route needs             Bearer <API_KEY>
 */
app.use((req, res, next) => {
  if (req.path === '/' ||
      req.headers.authorization === `Bearer ${API_KEY}`) {
    return next();
  }
  res.status(401).json({ error : 'unauthorised' });
});

/* ---- health-check ---- */
app.get('/health', (_, res) => res.sendStatus(200));

/* ---- in-memory todos ----------------- */
let todos = [];

/*  Load seed data if it exists – keeps the
    container stateless and idempotent      */
try {
  const raw = fs.readFileSync(path.resolve(DATA_FILE), 'utf8');
  const parsed = JSON.parse(raw);
  todos = Array.isArray(parsed) ? parsed : parsed.todos || [];
} catch {
  // first run; ignore
}

/*  GET /todos  ->  full list  */
app.get('/todos', (_, res) => res.json(todos));

/*  POST /todos  ->  { title }  */
app.post('/todos', (req, res) => {
  const { title = '' } = req.body;
  if (!title.trim()) {
    return res.status(400).json({ error : 'title required' });
  }
  const todo = { id : String(Date.now()), title, completed : false };
  todos.push(todo);
  res.status(201).json(todo);
});

/*  PATCH /todos/:id  ->  toggle completed  */
app.patch('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).end();
  todo.completed = !todo.completed;
  res.json(todo);
});

/*  DELETE /todos/:id  */
app.delete('/todos/:id', (req, res) => {
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  todos.splice(idx, 1);
  res.status(204).end();
});

module.exports = app;
