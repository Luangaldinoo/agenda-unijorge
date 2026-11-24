const AppError = require('./AppError');

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message });
  }

  // Violações de validação do Sequelize -> 400 com detalhes por campo.
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const vistos = new Set();
    const detalhes = [];
    for (const item of err.errors) {
      if (vistos.has(item.path)) continue; // uma mensagem por campo
      vistos.add(item.path);
      detalhes.push({ campo: item.path, mensagem: item.message });
    }
    return res.status(400).json({ erro: 'Dados inválidos', detalhes });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = { errorHandler, rotaNaoEncontrada };
