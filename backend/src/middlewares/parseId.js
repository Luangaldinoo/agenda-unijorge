const AppError = require('./AppError');

// Converte o parâmetro de rota em inteiro positivo; qualquer outra coisa é "não encontrado".
function parseId(valor, nome = 'Recurso') {
  if (!/^\d+$/.test(String(valor))) {
    throw new AppError(404, `${nome} não encontrado`);
  }
  return Number(valor);
}

module.exports = parseId;
