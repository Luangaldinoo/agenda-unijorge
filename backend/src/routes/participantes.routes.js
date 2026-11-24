const { Router } = require('express');
const controller = require('../controllers/participanteController');

// mergeParams: herda :eventoId da rota pai (/eventos/:eventoId/participantes).
const router = Router({ mergeParams: true });

router.get('/', controller.listar);
router.post('/', controller.criar);
router.get('/:id', controller.buscar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

module.exports = router;
