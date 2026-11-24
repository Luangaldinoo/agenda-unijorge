const { Evento, sequelize } = require('../models');
const AppError = require('../middlewares/AppError');
const { pick } = require('./utils');

const CAMPOS = ['titulo', 'descricao', 'local', 'data'];

// Total de participantes calculado no banco, sem carregar a lista inteira.
const totalParticipantes = [
  sequelize.literal('(SELECT COUNT(*) FROM participantes WHERE participantes.eventoId = Evento.id)'),
  'totalParticipantes',
];

async function buscarOuFalhar(id) {
  const evento = await Evento.findByPk(id, {
    attributes: { include: [totalParticipantes] },
  });
  if (!evento) throw new AppError(404, 'Evento não encontrado');
  return evento;
}

async function listar() {
  return Evento.findAll({
    attributes: { include: [totalParticipantes] },
    order: [['data', 'ASC'], ['id', 'ASC']],
  });
}

async function criar(dados) {
  const evento = await Evento.create(pick(dados, CAMPOS));
  return buscarOuFalhar(evento.id);
}

async function atualizar(id, dados) {
  const evento = await buscarOuFalhar(id);
  const valores = pick(dados, CAMPOS);
  // PUT substitui o recurso: campo ausente volta a nulo, o que faz a validação de obrigatórios valer na edição.
  evento.set({
    titulo: valores.titulo ?? null,
    descricao: valores.descricao ?? null,
    local: valores.local ?? null,
    data: valores.data ?? null,
  });
  await evento.save();
  return buscarOuFalhar(id);
}

async function excluir(id) {
  const evento = await buscarOuFalhar(id);
  // Os participantes do evento são removidos junto (relacionamento com CASCADE).
  await evento.destroy();
}

module.exports = { listar, buscarOuFalhar, criar, atualizar, excluir };
