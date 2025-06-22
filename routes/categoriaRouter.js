const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// GET /api/categorias
router.get('/', categoriaController.getCategorias);
// GET /api/categorias/:categoriaId/subcategorias
router.get('/:categoriaId/subcategorias', categoriaController.getSubcategoriasByCategoria);

module.exports = router;
