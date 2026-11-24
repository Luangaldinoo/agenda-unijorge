// Copia apenas as chaves permitidas (evita mass assignment, ex.: tentar trocar eventoId pelo body).
function pick(origem, chaves) {
  const resultado = {};
  for (const chave of chaves) {
    if (origem && Object.prototype.hasOwnProperty.call(origem, chave)) {
      resultado[chave] = origem[chave];
    }
  }
  return resultado;
}

module.exports = { pick };
