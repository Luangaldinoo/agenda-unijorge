const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

// Em produção/desenvolvimento o banco fica em backend/data/agenda.sqlite.
// Nos testes usamos DB_STORAGE=':memory:' para cada execução começar limpa.
const storage = process.env.DB_STORAGE || path.join(__dirname, '..', '..', 'data', 'agenda.sqlite');

if (storage !== ':memory:') {
  fs.mkdirSync(path.dirname(storage), { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

module.exports = sequelize;
