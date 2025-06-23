exports.getImagenes = async () => {
  const connection = await getConnection();
  const [imagenes] = await connection.query("SELECT * FROM imagenes");
  return imagenes;
};
const dbConnection = require("../db/mysqlConecction");

let connection = null;

const getConnection = async () => {
  if (connection === null) {
    connection = await dbConnection();
  }
  return connection;
};

exports.getImagenesById = async (imagenId) => {
  const connection = await getConnection();

  const [imagen] = await connection.query("SELECT* FROM imagenes WHERE imagenId = ?",[imagenId]);
  if (!imagen || imagen.length === 0) {
    return null;
  }
  return imagen;
};

exports.createImage = async (nombre_archivo, ruta_archivo) => {
  const connection = await getConnection();
  const [resultado] = await connection.query("INSERT INTO imagenes (nombre_archivo, ruta_archivo) VALUES (?, ?)",[nombre_archivo, ruta_archivo]);
  if (!resultado) {
    return null;
  }
  return resultado.insertId;
};

exports.updateImagenById = async (imagenId, nombre_archivo, ruta_archivo) => {
  const connection = await getConnection();
  const [resultado] = await connection.query("UPDATE imagenes SET nombre_archivo = ?, ruta_archivo = ? WHERE imagenId = ?",[nombre_archivo, ruta_archivo, imagenId]);
  if (!resultado) {
    return null;
  }
  return resultado;
};

exports.deleteImagenById = async (imagenId) => {
  const connection = await getConnection();
  const resultado = await connection.query("DELETE FROM imagenes WHERE imagenId = ?",[imagenId]);
  if (!resultado) {
    return null;
  }
  return resultado;
};

exports.getRutaImagenPrincipalByAnuncioId = async (anuncioId) => {
  const connection = await getConnection();
  const [rows] = await connection.query(
    "SELECT ruta_archivo FROM imagenes WHERE anuncioId = ? AND es_principal = 1 LIMIT 1",
    [anuncioId]
  );
  if (!rows || rows.length === 0) {
    return null;
  }
  return rows[0].ruta_archivo;
};