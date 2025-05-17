// Standard Express skeleton ---------------------------------------------------
const express = require('express');
const { v4: uuid } = require('uuid');

const app   = express();
const PORT  = process.env.PORT || 3000;

// -----------------------------------------------------------------------------
//  MIDDLEWARE
// -----------------------------------------------------------------------------
app.use(express.json());

// very small “bearer token” auth layer
const API_TOKEN = process.env.API_TOKEN || 'secret123';
app.use((req, res, next) => {
  if (req.path === '/health') return next();            // keep /health public
  if (req.headers.authorization !== `Bearer ${API_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
});

// -----------------------------------------------------------------------------
//  IN-MEMORY (optionally seeded) DATABASE
// -----------------------------------------------------------------------------
const todos = [];
app.locals.todos = todos;                               // <-- visible to server.js

// If server.js set SEED_FROM_DB=true we’ll already have seed data
// (it pushes straight into app.locals.todos)
app.get('/health', (_req, res) => res.send('OK'));

// -----------------------------------------------------------------------------
//  ROUTES
// -----------------------------------------------------------------------------
app.get('/',      (_req, res) => res.json({ message: 'Welcome 🚀' }));

app.get('/todos', (_req, res) => res.json(todos));

app.post('/todos', (req, res) => {
  const { title } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });

  const todo = { id: uuid(), title, completed: false };
  todos.push(todo);
  return res.status(201).json(todo);
});

app.delete('/todos/:id', (req, res) => {
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' });

  const [removed] = todos.splice(idx, 1);
  return res.json(removed);
});

// -----------------------------------------------------------------------------
//  EXPORT
// -----------------------------------------------------------------------------
module.exports = app;
