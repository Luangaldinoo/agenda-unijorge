const { Evento, Participante } = require('../models');
const AppError = require('../middlewares/AppError');
const { pick } = require('./utils');

const CAMPOS = ['descricao', 'email', 'telefone', 'formaPagamento'];

async function garantirEvento(eventoId) {
  const evento = await Evento.findByPk(eventoId, { attributes: ['id'] });
  if (!evento) throw new AppError(404, 'Evento não encontrado');
  return evento;
}

// Sempre busca pelo par (id, eventoId): um participante só é acessível pelo evento ao qual pertence.
async function buscarOuFalhar(eventoId, id) {
  await garantirEvento(eventoId);
  const participante = await Participante.findOne({ where: { id, eventoId } });
  if (!participante) throw new AppError(404, 'Participante não encontrado neste evento');
  return participante;
}

async function listar(eventoId) {
  await garantirEvento(eventoId);
  return Participante.findAll({ where: { eventoId }, order: [['id', 'ASC']] });
}

async function criar(eventoId, dados) {
  await garantirEvento(eventoId);
  // eventoId vem da URL, nunca do corpo: o vínculo com o evento é automático.
  return Participante.create({ ...pick(dados, CAMPOS), eventoId });
}

async function atualizar(eventoId, id, dados) {
  const participante = await buscarOuFalhar(eventoId, id);
  const valores = pick(dados, CAMPOS);
  // PUT substitui os dados: campo ausente vira nulo e falha na validação de obrigatórios.
  participante.set({
    descricao: valores.descricao ?? null,
    email: valores.email ?? null,
    telefone: valores.telefone ?? null,
    formaPagamento: valores.formaPagamento ?? null,
  });
  await participante.save();
  return participante;
}

async function excluir(eventoId, id) {
  const participante = await buscarOuFalhar(eventoId, id);
  await participante.destroy();
}

module.exports = { listar, buscarOuFalhar, criar, atualizar, excluir };
