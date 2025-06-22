const dbConnection = require('../db/mysqlConecction');
let connection = null;

const getConnection = async () => {
    if (connection === null) {
        connection = await dbConnection();
    }
    return connection;
};

// ... la función findOrCreateConversation se mantiene igual que antes ...
exports.findOrCreateConversation = async (anuncioId, compradorId, vendedorId) => {
    const conn = await getConnection();
    let [conversations] = await conn.query(
        'SELECT conversacionId FROM conversaciones WHERE anuncioId = ? AND compradorId = ?',
        [anuncioId, compradorId]
    );

    if (conversations.length > 0) {
        return conversations[0].conversacionId;
    } else {
        const [result] = await conn.query(
            'INSERT INTO conversaciones (anuncioId, compradorId, vendedorId) VALUES (?, ?, ?)',
            [anuncioId, compradorId, vendedorId]
        );
        return result.insertId;
    }
};

// ... la función getConversationsByUserId se mantiene igual que antes ...
exports.getConversationsByUserId = async (usuarioId) => {
    const conn = await getConnection();
    const [rows] = await conn.query(
        `SELECT 
            c.conversacionId, c.anuncioId, c.compradorId, c.vendedorId, c.fecha_ultimo_mensaje,
            a.titulo AS anuncioTitulo,
            (SELECT url FROM anuncio_imagenes WHERE anuncioId = c.anuncioId ORDER BY orden LIMIT 1) AS anuncioImagen,
            u_comprador.nombre_completo AS compradorNombre,
            u_vendedor.nombre_completo AS vendedorNombre,
            (SELECT contenido FROM mensajes WHERE conversacionId = c.conversacionId ORDER BY fecha_envio DESC LIMIT 1) AS ultimoMensaje
         FROM conversaciones c
         JOIN anuncios a ON c.anuncioId = a.anuncioId
         JOIN usuarios u_comprador ON c.compradorId = u_comprador.usuarioId
         JOIN usuarios u_vendedor ON c.vendedorId = u_vendedor.usuarioId
         WHERE c.compradorId = ? OR c.vendedorId = ?
         ORDER BY c.fecha_ultimo_mensaje DESC`,
        [usuarioId, usuarioId]
    );
    return rows;
};


// ... la función getMessagesByConversationId se mantiene igual que antes ...
exports.getMessagesByConversationId = async (conversacionId) => {
    const conn = await getConnection();
    const [rows] = await conn.query(
        'SELECT mensajeId, conversacionId, emisorId, contenido, fecha_envio, leido FROM mensajes WHERE conversacionId = ? ORDER BY fecha_envio ASC',
        [conversacionId]
    );
    return rows;
};

/**
 * Inserta un nuevo mensaje en la base de datos y actualiza la fecha del último mensaje en la conversación.
 * Usa validaciones 'if' en lugar de transacciones.
 * @param {number} conversacionId - ID de la conversación.
 * @param {number} emisorId - ID del usuario que envía el mensaje.
 * @param {string} contenido - El texto del mensaje.
 * @returns {Promise<object|null>} - El resultado de la inserción o null si algo falla.
 */
exports.createMessage = async (conversacionId, emisorId, contenido) => {
    const conn = await getConnection();

    // 1. Insertamos el nuevo mensaje
    const [insertResult] = await conn.query(
        'INSERT INTO mensajes (conversacionId, emisorId, contenido, leido) VALUES (?, ?, ?, 0)',
        [conversacionId, emisorId, contenido]
    );

    // Verificamos si la inserción fue exitosa. `affectedRows` nos dice si se creó una nueva fila.
    if (!insertResult || insertResult.affectedRows === 0) {
        console.error("Fallo al insertar el mensaje.");
        return null; // La inserción falló, detenemos el proceso.
    }

    // 2. Actualizamos la tabla de conversaciones con la nueva fecha
    const [updateResult] = await conn.query(
        'UPDATE conversaciones SET fecha_ultimo_mensaje = CURRENT_TIMESTAMP WHERE conversacionId = ?',
        [conversacionId]
    );

    // Verificamos si la actualización fue exitosa.
    if (!updateResult || updateResult.affectedRows === 0) {
        console.error("Fallo al actualizar la fecha de la conversación.");
        // Opcional: Podríamos intentar borrar el mensaje insertado para mantener la consistencia,
        // pero por ahora, simplemente notificamos el fallo.
        return null;
    }
    
    // Si ambas operaciones fueron exitosas, devolvemos el resultado de la inserción.
    return insertResult;
};

// ... la función markMessagesAsRead se mantiene igual que antes ...
exports.markMessagesAsRead = async (conversacionId, usuarioReceptorId) => {
    const conn = await getConnection();
    await conn.query(
      'UPDATE mensajes SET leido = 1 WHERE conversacionId = ? AND emisorId != ? AND leido = 0',
      [conversacionId, usuarioReceptorId]
    );
};