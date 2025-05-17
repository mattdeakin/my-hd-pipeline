const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => res.json({ message: 'Hello, HD world!' }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀  API running on port ${PORT}`));
}

module.exports = app;
