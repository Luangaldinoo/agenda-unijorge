const express = require('express');
const cors = require('cors');
const eventosRoutes = require('./routes/eventos.routes');
const { errorHandler, rotaNaoEncontrada } = require('./middlewares/errorHandler');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
  app.use(express.json());

  app.get('/api/saude', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/eventos', eventosRoutes);

  app.use(rotaNaoEncontrada);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
