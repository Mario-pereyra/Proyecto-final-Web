const express = require('express');
const router = express.Router();
const anunciosGuardadosController = require('../controllers/anunciosGuardadosController');

// GET /api/anuncios_guardados/:usuarioId
router.get('/:usuarioId', anunciosGuardadosController.getAnunciosGuardadosPorUsuario);

// POST /api/anuncios_guardados
router.post('/', anunciosGuardadosController.guardarAnuncio);

// DELETE /api/anuncios_guardados
router.delete('/', anunciosGuardadosController.eliminarAnuncioGuardado);

module.exports = router;
