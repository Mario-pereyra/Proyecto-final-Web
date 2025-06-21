const express = require('express')
const router = express.Router();

const AnuncioController = require('../controllers/AnuncioController')

router.get('/',AnuncioController.getAnuncios)

router.get('/:anuncioId',AnuncioController.getAnuncioById)

router.post('/',AnuncioController.createAnuncio)

router.put('/',AnuncioController.updateAnuncio)

router.delete('/:anuncioId',AnuncioController.deleteAnuncio)


module.exports = router;