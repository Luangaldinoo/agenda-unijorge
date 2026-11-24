const { Router } = require('express');
const controller = require('../controllers/eventoController');
const participantesRoutes = require('./participantes.routes');

const router = Router();

router.get('/', controller.listar);
router.post('/', controller.criar);
router.get('/:id', controller.buscar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

// Participantes são um sub-recurso do evento.
router.use('/:eventoId/participantes', participantesRoutes);

module.exports = router;
