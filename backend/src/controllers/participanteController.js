const participanteService = require('../services/participanteService');
const parseId = require('../middlewares/parseId');

// Todas as rotas vivem em /eventos/:eventoId/participantes: o evento é sempre o contexto.
const eventoDa = (req) => parseId(req.params.eventoId, 'Evento');
const participanteDa = (req) => parseId(req.params.id, 'Participante');

module.exports = {
  async listar(req, res) {
    res.json(await participanteService.listar(eventoDa(req)));
  },
  async buscar(req, res) {
    res.json(await participanteService.buscarOuFalhar(eventoDa(req), participanteDa(req)));
  },
  async criar(req, res) {
    res.status(201).json(await participanteService.criar(eventoDa(req), req.body));
  },
  async atualizar(req, res) {
    res.json(await participanteService.atualizar(eventoDa(req), participanteDa(req), req.body));
  },
  async excluir(req, res) {
    await participanteService.excluir(eventoDa(req), participanteDa(req));
    res.status(204).end();
  },
};
