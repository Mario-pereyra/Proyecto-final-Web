const dbConnection = require("../db/mysqlConecction");
let connection = null;

const getConnection = async () => {
  if (connection === null) {
    connection = await dbConnection();
  }
  return connection;
};

exports.encontrarOCrearConversacion = async (anuncioId,compradorId,vendedorId) => {
  const conn = await getConnection();
  let [conversaciones] = await conn.query(
    "SELECT conversacionId FROM conversaciones WHERE anuncioId = ? AND compradorId = ?",
    [anuncioId, compradorId]
  );
  if (conversaciones.length > 0) {
    return conversaciones[0].conversacionId;
  } else {
    const [resultado] = await conn.query("INSERT INTO conversaciones (anuncioId, compradorId, vendedorId) VALUES (?, ?, ?)",
      [anuncioId, compradorId, vendedorId]
    );
    return resultado.insertId;
  }
};

exports.getConversacionesPorUsuarioId = async (usuarioId) => {
  const conn = await getConnection();
  const [filas] = await conn.query(
    `SELECT 
            c.conversacionId, 
            c.anuncioId,
            c.compradorId,
            c.vendedorId,
            c.fecha_ultimo_mensaje,
            a.titulo AS anuncioTitulo,
            (SELECT i.ruta_archivo FROM anuncio_imagenes ai JOIN imagenes i ON ai.imagenId = i.imagenId WHERE ai.anuncioId = c.anuncioId ORDER BY ai.es_principal DESC, ai.orden ASC LIMIT 1) AS anuncioImagen,
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
  return filas;
};

exports.getMensajesPorConversacionId = async (conversacionId) => {
  const conn = await getConnection();
  const [filas] = await conn.query("SELECT mensajeId, conversacionId, emisorId, contenido, fecha_envio, leido FROM mensajes WHERE conversacionId = ? ORDER BY fecha_envio ASC",[conversacionId]);
  return filas;
};


exports.crearMensaje = async (conversacionId, emisorId, contenido) => {
  const conn = await getConnection();
  const [resultadoInsert] = await conn.query("INSERT INTO mensajes (conversacionId, emisorId, contenido, leido) VALUES (?, ?, ?, 0)",[conversacionId, emisorId, contenido]);
  if (!resultadoInsert || resultadoInsert.affectedRows === 0) {
    console.error("Fallo al insertar el mensaje.");
    return null;
  }
  const [resultadoUpdate] = await conn.query("UPDATE conversaciones SET fecha_ultimo_mensaje = CURRENT_TIMESTAMP WHERE conversacionId = ?",[conversacionId]);
  if (!resultadoUpdate || resultadoUpdate.affectedRows === 0) {
    console.error("Fallo al actualizar la fecha de la conversación.");
    return null;
  }
  return resultadoInsert;
};

exports.marcarMensajesComoLeidos = async (conversacionId, usuarioReceptorId) => {
  const conn = await getConnection();
  await conn.query("UPDATE mensajes SET leido = 1 WHERE conversacionId = ? AND emisorId != ? AND leido = 0",
    [conversacionId, usuarioReceptorId]
  );
};
