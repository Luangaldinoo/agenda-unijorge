const createApp = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3333;

async function iniciar() {
  await sequelize.sync();
  createApp().listen(PORT, () => {
    console.log(`API da Agenda UniJorge rodando em http://localhost:${PORT}/api`);
  });
}

iniciar().catch((erro) => {
  console.error('Falha ao iniciar a API:', erro);
  process.exit(1);
});
