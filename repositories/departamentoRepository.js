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
  const [ciudades] = await connection.query(
    "SELECT * FROM ciudades WHERE departamentoId = ?",
    [departamentoId]
  );
  return ciudades;
};
