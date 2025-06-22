const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');

// --- Definición de Endpoints para el Chat ---

// Endpoint para iniciar o encontrar una conversación (desde la página del anuncio)
// POST /api/chat/conversations/start
router.post('/conversacion/iniciar', mensajeController.iniciarConversacion);

// Endpoint para obtener todas las conversaciones de un usuario específico
// GET /api/chat/conversations/user/:usuarioId
router.get('/conversaciones/usuario/:usuarioId', mensajeController.getConversaciones);

// Endpoint para obtener todos los mensajes de una conversación específica
// GET /api/chat/conversations/:conversacionId/messages?usuarioId=XX
router.get('/conversacion/:conversacionId/mensajes', mensajeController.getMensajes);

// Endpoint para enviar un nuevo mensaje
// POST /api/chat/messages
router.post('/mensajes', mensajeController.createMensaje);


module.exports = router;