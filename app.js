/* ------------------------------------------------------------------
 *  Simple Express API  – SIT753 7.3 HD task
 * ------------------------------------------------------------------ */

const express = require('express');
const app     = express();
const PORT    = process.env.PORT || 3000;

/* ---------- 0️⃣  Minimal token auth -------------------------------- */
const API_KEY = process.env.API_KEY || 'secret123';
app.use((req, res, next) => {
  // Allow unauthenticated access to the root health-check only
  if (req.path === '/' || req.headers.authorization === `Bearer ${API_KEY}`) {
    return next();
  }
  return res.sendStatus(401);
});

/* ---------- 1️⃣  JSON body parser ---------------------------------- */
app.use(express.json());

/* ---------- 2️⃣  In-memory CRUD “todos” ---------------------------- */
let nextId = 1;
const todos = [];

/* CREATE ------------------------------------------------------------ */
app.post('/todos', (req, res) => {
  const todo = { id: nextId++, text: req.body.text || '', done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

/* READ list --------------------------------------------------------- */
app.get('/todos', (_req, res) => res.json(todos));

/* READ one ---------------------------------------------------------- */
app.get('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id == req.params.id);
  return todo ? res.json(todo) : res.sendStatus(404);
});

/* UPDATE ------------------------------------------------------------ */
app.put('/todos/:id', (req, res) => {
  const idx = todos.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.sendStatus(404);
  todos[idx] = { ...todos[idx], ...req.body };
  res.json(todos[idx]);
});

/* DELETE ------------------------------------------------------------ */
app.delete('/todos/:id', (req, res) => {
  const idx = todos.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.sendStatus(404);
  todos.splice(idx, 1);
  res.sendStatus(204);
});

/* ---------- 3️⃣  Health-check root -------------------------------- */
app.get('/', (_req, res) => {
  res.type('text').send('HD-API-OK');        // ← Smoke-test looks for this
});

/* ---------- 4️⃣  Export for Jest; server starts in server.js ------- */
module.exports = app;
