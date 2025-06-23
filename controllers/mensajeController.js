const mensajeRepository = require("../repositories/mensajeRepository");

/**
 * Obtiene todas las conversaciones de un usuario.
 */
exports.getConversations = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    if (!usuarioId) {
      return res
        .status(400)
        .json({ message: "El ID de usuario es requerido." });
    }

    const conversations = await mensajeRepository.getConversationsByUserId(
      usuarioId
    );

    // Aunque no haya conversaciones, la petición es exitosa. Se devuelve un array vacío.
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error en getConversations:", error);
    res
      .status(500)
      .json({
        message: "Error interno del servidor al obtener las conversaciones.",
      });
  }
};

/**
 * Obtiene los mensajes de una conversación específica.
 * IMPORTANTE: También marca los mensajes como leídos para el usuario que hace la petición.
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversacionId } = req.params;
    const { usuarioId } = req.query; // El ID del usuario se pasará como query param (ej: ?usuarioId=15)

    if (!conversacionId || !usuarioId) {
      return res
        .status(400)
        .json({
          message: "El ID de conversación y el ID de usuario son requeridos.",
        });
    }

    // Primero, marcamos los mensajes como leídos por este usuario.
    // No necesitamos esperar a que termine (await), puede hacerse en segundo plano.
    mensajeRepository.markMessagesAsRead(conversacionId, usuarioId);

    // Luego, obtenemos los mensajes para enviarlos en la respuesta.
    const messages = await mensajeRepository.getMessagesByConversationId(
      conversacionId
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error en getMessages:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al obtener los mensajes." });
  }
};

/**
 * Crea un nuevo mensaje en una conversación.
 */
exports.createMessage = async (req, res) => {
  try {
    const { conversacionId, emisorId, contenido } = req.body;

    // Validaciones básicas
    if (!conversacionId || !emisorId || !contenido) {
      return res
        .status(400)
        .json({
          message:
            "Faltan datos requeridos (conversacionId, emisorId, contenido).",
        });
    }

    const result = await mensajeRepository.createMessage(
      conversacionId,
      emisorId,
      contenido
    );

    if (!result) {
      // Si el repositorio devolvió null, significa que algo falló.
      return res.status(500).json({ message: "No se pudo crear el mensaje." });
    }

    // Devolvemos una respuesta de éxito con el ID del nuevo mensaje.
    res
      .status(201)
      .json({
        message: "Mensaje creado con éxito.",
        mensajeId: result.insertId,
      });
  } catch (error) {
    console.error("Error en createMessage:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear el mensaje." });
  }
};

/**
 * Inicia o encuentra una conversación. Se usa cuando un comprador contacta a un vendedor desde un anuncio.
 */
exports.startConversation = async (req, res) => {
  try {
    const { anuncioId, compradorId, vendedorId } = req.body;

    if (!anuncioId || !compradorId || !vendedorId) {
      return res
        .status(400)
        .json({
          message:
            "Faltan datos requeridos (anuncioId, compradorId, vendedorId).",
        });
    }

    if (compradorId === vendedorId) {
      return res
        .status(400)
        .json({
          message:
            "Un usuario no puede iniciar una conversación consigo mismo.",
        });
    }

    const conversacionId = await mensajeRepository.findOrCreateConversation(
      anuncioId,
      compradorId,
      vendedorId
    );

    if (!conversacionId) {
      return res
        .status(500)
        .json({ message: "No se pudo iniciar la conversación." });
    }

    // Devolvemos el ID de la conversación para que el frontend pueda redirigir o cargar el chat.
    res
      .status(201)
      .json({
        message: "Conversación iniciada/encontrada con éxito.",
        conversacionId: conversacionId,
      });
  } catch (error) {
    console.error("Error en startConversation:", error);
    res
      .status(500)
      .json({
        message: "Error interno del servidor al iniciar la conversación.",
      });
  }
};
