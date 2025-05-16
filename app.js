const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => res.json({ message: 'Hello, HD world!' }));

// 👉 Only start the listener when this file is executed, not when it’s required.
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀  API running on port ${PORT}`));
}

module.exports = app;
