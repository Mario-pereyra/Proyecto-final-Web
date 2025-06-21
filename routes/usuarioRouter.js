const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController')


// GET /api/usuario /
router.get('/',usuarioController.getUsuarios);
//GET /api/usuario /1
router.get('/:usuarioId',usuarioController.getUsuarioById);
//POST /api/usuarios/
router.post('/',usuarioController.createUsuario);
//DELETE /api/usuario/1
router.delete('/:usuarioId',usuarioController.deleteUsuario);
//UPDATE /api/usuario/1
router.put('/:usuarioId',usuarioController.updateUsuario)


// POST /api/usuario/login
router.post('/login',usuarioController.login)
//PSOT /api/usuario/login
router.post('/registro',usuarioController.registro)

module.exports = router;