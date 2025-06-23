const mensajeRepository = require("../repositories/mensajeRepository");

exports.getConversaciones = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    if (!usuarioId) {
      return res.status(400).json({ message: "El ID de usuario es requerido." });
    }
    if (isNaN(usuarioId) || Number(usuarioId) <= 0) {
      return res.status(400).json({ message: "El ID de usuario debe ser un número válido y positivo." });
    }

    const conversaciones = await mensajeRepository.getConversacionesPorUsuarioId(usuarioId);
    
    if (!conversaciones || conversaciones.length === 0) {
      return res.status(200).json({ message: "No se encontraron conversaciones", conversaciones: [] });
    }
    res.status(200).json({ conversaciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor al obtener las conversaciones.", });
  }
};


exports.getMensajes = async (req, res) => {
  try {
    const { conversacionId } = req.params;
    const { usuarioId } = req.query; // El ID del usuario se pasará como query param (ej: ?usuarioId=15)

    if (!conversacionId) {
      return res.status(400).json({
        message: "El ID de conversación es requerido.",
      });
    }
    if (isNaN(conversacionId) || Number(conversacionId) <= 0) {
      return res.status(400).json({ message: "El ID de conversación debe ser un número válido y positivo." });
    }

    // Si usuarioId está presente y es válido, marcar como leídos
    if (usuarioId && !isNaN(usuarioId) && Number(usuarioId) > 0) {
      await mensajeRepository.marcarMensajesComoLeidos(conversacionId, usuarioId);
    }

    const mensajes = await mensajeRepository.getMensajesPorConversacionId(conversacionId);
    res.status(200).json(mensajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor al obtener los mensajes." });
  }
};


exports.crearMensaje = async (req, res) => {
  const { conversacionId, emisorId, contenido } = req.body;
  try {

    if (isNaN(conversacionId) || Number(conversacionId) <= 0) {
      return res.status(400).json({ message: "El ID de conversación debe ser un número válido y positivo." });
    }
    if (isNaN(emisorId) || Number(emisorId) <= 0) {
      return res.status(400).json({ message: "El ID del emisor debe ser un número válido y positivo." });
    }
    if (typeof contenido !== 'string' || contenido.trim().length === 0) {
      return res.status(400).json({ message: "El contenido del mensaje no puede estar vacío." });
    }
    if (contenido.length > 1000) {
      return res.status(400).json({ message: "El contenido del mensaje no puede superar los 1000 caracteres." });
    }

    const resultado = await mensajeRepository.crearMensaje(conversacionId, emisorId, contenido);
    if (!resultado) {
      return res.status(500).json({ message: "No se pudo crear el mensaje." });
    }
    res.status(201).json({ message: "Mensaje creado con éxito.", mensajeId: resultado.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor al crear el mensaje." });
  }
};


exports.iniciarConversacion = async (req, res) => {
  const { anuncioId, compradorId, vendedorId } = req.body;
  try {

    if (isNaN(anuncioId) || Number(anuncioId) <= 0) {
      return res.status(400).json({ message: "El ID de anuncio debe ser un número válido y positivo." });
    }
    if (isNaN(compradorId) || Number(compradorId) <= 0) {
      return res.status(400).json({ message: "El ID de comprador  debe ser un número válido y positivo." });
    }
    if (isNaN(vendedorId) || Number(vendedorId) <= 0) {
      return res.status(400).json({ message: "El ID de  vendedor debe ser un número válido y positivo." });
    }
    if (compradorId === vendedorId) {
      return res.status(400).json({ message: "Un usuario no puede iniciar  una conversación consigo mismo." });
    }

    const conversacionId = await mensajeRepository.encontrarOCrearConversacion(anuncioId,compradorId,vendedorId);
    if (!conversacionId) {
      return res.status(500).json({ message: "No se pudo iniciar la conversación." });
    }
    // Devolvemos el ID de la conversación para que el frontend pueda redirigir o cargar el chat.
    res.status(201).json({message: "Conversación iniciada/encontrada con éxito.",conversacionId: conversacionId,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error interno del servidor al iniciar la conversación.",
      });
  }
};
