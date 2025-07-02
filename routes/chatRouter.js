const express = require("express");
const router = express.Router();
const mensajeController = require("../controllers/mensajeController");



// Endpoint para iniciar o encontrar una conversación (desde la página del anuncio)
// POST /api/chat/conversacion/iniciar
router.post("/conversacion/iniciar", mensajeController.iniciarConversacion);

// Endpoint para obtener todas las conversaciones de un usuario específico
// GET /api/chat/conversaciones/usuario/:usuarioId
router.get("/conversaciones/usuario/:usuarioId", mensajeController.getConversaciones);

// Endpoint para obtener todos los mensajes de una conversación específica
// GET /api/chat/conversacion/:conversacionId/mensajes?usuarioId=XX
router.get("/conversacion/:conversacionId/mensajes", mensajeController.getMensajes);

// Endpoint para enviar un nuevo mensaje
// POST /api/chat/mensajes
router.post("/mensajes", mensajeController.crearMensaje);

// Endpoint para long polling de mensajes nuevos
// GET /api/chat/conversacion/:conversacionId/poll?usuarioId=XX&lastMessageId=XX
router.get("/conversacion/:conversacionId/poll", mensajeController.longPollMensajes);

module.exports = router;
