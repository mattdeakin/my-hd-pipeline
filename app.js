// Simple Express API with token-auth + in-memory CRUD “todos”
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- 0️⃣  Very-light authentication ---------------------------- */
const API_KEY = process.env.API_KEY || 'secret123';   // set in Jenkins if you like
app.use((req, res, next) => {
  if (req.path === '/' || req.headers.authorization === `Bearer ${API_KEY}`) {
    return next();
  }
  return res.sendStatus(401);
});

/* ---------- 1️⃣  JSON body-parser ------------------------------------ */
app.use(express.json());

/* ---------- 2️⃣  In-memory “todos” store ----------------------------- */
let nextId = 1;
const todos = [];

/* CREATE */
app.post('/todos', (req, res) => {
  const todo = { id: nextId++, text: req.body.text || '', done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

/* READ list */
app.get('/todos', (_req, res) => res.json(todos));

/* READ one */
app.get('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id == req.params.id);
  return todo ? res.json(todo) : res.sendStatus(404);
});

/* UPDATE */
app.put('/todos/:id', (req, res) => {
  const idx = todos.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.sendStatus(404);
  todos[idx] = { ...todos[idx], ...req.body };
  res.json(todos[idx]);
});

/* DELETE */
app.delete('/todos/:id', (req, res) => {
  const idx = todos.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.sendStatus(404);
  todos.splice(idx, 1);
  res.sendStatus(204);
});

/* ---------- 3️⃣  Original hello route -------------------------------- */
app.get('/', (_req, res) => res.json({ message: 'Hello, HD world!' }));

/* ---------- 4️⃣  Export for tests; server listens in server.js -------- */
module.exports = app;
