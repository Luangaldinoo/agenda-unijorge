const eventoService = require('../services/eventoService');
const parseId = require('../middlewares/parseId');

module.exports = {
  async listar(req, res) {
    res.json(await eventoService.listar());
  },
  async buscar(req, res) {
    res.json(await eventoService.buscarOuFalhar(parseId(req.params.id, 'Evento')));
  },
  async criar(req, res) {
    res.status(201).json(await eventoService.criar(req.body));
  },
  async atualizar(req, res) {
    res.json(await eventoService.atualizar(parseId(req.params.id, 'Evento'), req.body));
  },
  async excluir(req, res) {
    await eventoService.excluir(parseId(req.params.id, 'Evento'));
    res.status(204).end();
  },
};
