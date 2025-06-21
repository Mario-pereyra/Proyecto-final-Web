const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController')


// GET /api/usuario /
router.get('/',usuarioController.getUsuarios);
//GET /api/usuario /1
router.get('/:usuarioId',usuarioController.getUsuarioById);
//POST /api/usuario/
router.post('/',usuarioController.createUsuario);
//DELETE /api/usuario/1
router.delete('/:usuarioId',usuarioController.deleteUsuario);
//UPDATE /api/usuario/1
router.put('/',usuarioController.updateUsuario)



router.post('/login',usuarioController.login)
module.exports = router;