const fs   = require('fs');
const path = require('path');
const app  = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`✅  API listening on :${port}`);
});

// -----------------------------------------------------------------------------
//  OPTIONAL SEEDING FROM db.json
// -----------------------------------------------------------------------------
if (process.env.SEED_FROM_DB === 'true') {
  try {
    const seedPath = path.join(__dirname, 'db.json');
    const data     = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

    if (Array.isArray(data.todos)) {
      data.todos.forEach(t => app.locals.todos.push(t));
      console.log(`🌱  Seeded ${data.todos.length} todos from db.json`);
    }
  } catch (err) {
    console.warn('⚠️  Could not seed todos →', err.message);
  }
}

// -----------------------------------------------------------------------------
//  START
// -----------------------------------------------------------------------------
app.listen(PORT, () => console.log(`✅  API listening on http://localhost:${PORT}`));
