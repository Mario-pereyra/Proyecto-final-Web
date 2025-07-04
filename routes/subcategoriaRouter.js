const express = require('express');
const router = express.Router();
const subcategoriaController = require('../controllers/subcategoriaController');

// GET /api/subcategorias/por-categoria/:categoriaNombre
router.get('/por-categoria/:categoriaNombre', subcategoriaController.getSubcategoriasPorCategoria);

router.get('/', subcategoriaController.getSubcategorias);
router.get('/:id', subcategoriaController.getSubcategoriaById);
router.post('/', subcategoriaController.createSubcategoria);
router.put('/:id', subcategoriaController.updateSubcategoria);
router.delete('/:id', subcategoriaController.deleteSubcategoria);
router.get('/categoria/:categoriaId', subcategoriaController.getSubcategoriasByCategoria);

module.exports = router;
