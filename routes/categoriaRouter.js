const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// GET /api/categorias/con-conteo
router.get('/con-conteo', categoriaController.getCategoriasConConteo);

router.get('/', categoriaController.getCategorias);
router.get('/:id', categoriaController.getCategoriaById);
router.post('/', categoriaController.createCategoria);
router.put('/:id', categoriaController.updateCategoria);
router.delete('/:id', categoriaController.deleteCategoria);



module.exports = router;
