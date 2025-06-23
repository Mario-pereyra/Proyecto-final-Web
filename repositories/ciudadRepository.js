const dbconnection = require("../db/mysqlConecction");
let connection = null;

const getConnection = async () => {
  if (connection === null) {
    connection = await dbconnection();
  }
  return connection;
};

exports.getCiudades = async () => {
  const connection = await getConnection();
  const [ciudades] = await connection.query("SELECT * FROM ciudades");
  return ciudades;
};


exports.getCiudadById = async (id) => {
  const connection = await getConnection();
  const [ciudad] = await connection.query("SELECT * FROM ciudades WHERE ciudadId = ?", [id]);
  return ciudad[0];
};

exports.createCiudad = async (nombre, departamentoId) => {
  const connection = await getConnection();
  const [result] = await connection.query(
    "INSERT INTO ciudades (nombre, departamentoId) VALUES (?, ?)",
    [nombre, departamentoId]
  );
  return { ciudadId: result.insertId, nombre, departamentoId };
};


exports.updateCiudad = async (id, nombre, departamentoId) => {
  const connection = await getConnection();
  await connection.query(
    "UPDATE ciudades SET nombre = ?, departamentoId = ? WHERE ciudadId = ?",
    [nombre, departamentoId, id]
  );
  return { ciudadId: id, nombre, departamentoId };
};


exports.deleteCiudad = async (id) => {
  const connection = await getConnection();
  await connection.query("DELETE FROM ciudades WHERE ciudadId = ?", [id]);
  return { ciudadId: id };
};
