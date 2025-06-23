
const dbconnection = require("../db/mysqlConecction");
let connection = null;

const getConnection = async () => {
  if (connection === null) {
    connection = await dbconnection();
  }
  return connection;
};

exports.getDepartamentos = async () => {
  const connection = await getConnection();
  const [departamentos] = await connection.query("SELECT * FROM departamentos");
  return departamentos;
};

exports.getCiudadesByDepartamento = async (departamentoId) => {
  const connection = await getConnection();
  const [ciudades] = await connection.query("SELECT * FROM ciudades WHERE departamentoId = ?",[departamentoId]);
  return ciudades;
};


exports.getDepartamentoById = async (id) => {
  const connection = await getConnection();
  const [departamento] = await connection.query("SELECT * FROM departamentos WHERE departamentoId = ?", [id]);
  return departamento[0];
};

exports.createDepartamento = async (nombre) => {
  const connection = await getConnection();
  const [result] = await connection.query("INSERT INTO departamentos (nombre) VALUES (?)", [nombre]);
  return { id: result.insertId, nombre };
};


exports.updateDepartamento = async (id, nombre) => {
  const connection = await getConnection();
  await connection.query("UPDATE departamentos SET nombre = ? WHERE departamentoId = ?", [nombre, id]);
  return { id, nombre };
};


exports.deleteDepartamento = async (id) => {
  const connection = await getConnection();
  await connection.query("DELETE FROM departamentos WHERE departamentoId = ?", [id]);
  return { id };
};

