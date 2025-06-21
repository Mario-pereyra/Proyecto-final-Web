const express = require('express')
const router = express.Router();

const AnuncioController = require('../controllers/AnuncioController')
// GET /api/anuncios/
router.get('/',AnuncioController.getAnuncios)
// GET /api/anuncios/1
router.get('/:anuncioId',AnuncioController.getAnuncioById)
// POST /api/anuncios/
router.post('/',AnuncioController.createAnuncio)
// PUT /api/anuncios/
router.put('/:anuncioId',AnuncioController.updateAnuncio)
// DELETE /api/anuncios/1
router.delete('/:anuncioId',AnuncioController.deleteAnuncio)


module.exports = router;