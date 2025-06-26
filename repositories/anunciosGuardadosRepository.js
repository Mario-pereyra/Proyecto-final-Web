const dbConnection = require("../db/mysqlConecction");
let connection = null;

const getConnection = async () => {
  if (connection === null) {
    connection = await dbConnection();
  }
  return connection;
};

exports.getAnunciosGuardadosPorUsuario = async (usuarioId) => {
  if (!usuarioId || isNaN(usuarioId)) return [];
  const conn = await getConnection();
  const [rows] = await conn.query(
    "SELECT anuncioId FROM anuncios_guardados WHERE usuarioId = ?",
    [usuarioId]
  );
  return rows.map(row => row.anuncioId);
};

exports.guardarAnuncio = async (usuarioId, anuncioId) => {
  if (!usuarioId || !anuncioId || isNaN(usuarioId) || isNaN(anuncioId)) return null;
  const conn = await getConnection();
  try {
    const [result] = await conn.query(
      "INSERT IGNORE INTO anuncios_guardados (usuarioId, anuncioId) VALUES (?, ?)",
      [usuarioId, anuncioId]
    );
    return result.affectedRows > 0;
  } catch (err) {
    return null;
  }
};

exports.eliminarAnuncioGuardado = async (usuarioId, anuncioId) => {
  if (!usuarioId || !anuncioId || isNaN(usuarioId) || isNaN(anuncioId)) return null;
  const conn = await getConnection();
  const [result] = await conn.query(
    "DELETE FROM anuncios_guardados WHERE usuarioId = ? AND anuncioId = ?",
    [usuarioId, anuncioId]
  );
  return result.affectedRows > 0;
};
