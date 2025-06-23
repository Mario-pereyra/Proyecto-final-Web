const dbconnection = require("../db/mysqlConecction");
let connection = null;

const getConnection = async () => {
  if (connection === null) {
    connection = await dbconnection();
  }
  return connection;
};

exports.getSubcategorias = async () => {
  const connection = await getConnection();
  const [subcategorias] = await connection.query("SELECT * FROM subcategorias");
  return subcategorias;
};


exports.getSubcategoriaById = async (id) => {
  const connection = await getConnection();
  const [subcategoria] = await connection.query("SELECT * FROM subcategorias WHERE subcategoriaId = ?", [id]);
  return subcategoria[0];
};

exports.getSubcategoriasByCategoria = async (categoriaId) => {
  const connection = await getConnection();
  const [subcategorias] = await connection.query("SELECT * FROM subcategorias WHERE categoriaId = ?", [categoriaId]);
  return subcategorias;
};

exports.createSubcategoria = async (nombre, categoriaId) => {
  const connection = await getConnection();
  const [result] = await connection.query(
    "INSERT INTO subcategorias (nombre, categoriaId) VALUES (?, ?)",
    [nombre, categoriaId]
  );
  return { subcategoriaId: result.insertId, nombre, categoriaId };
};


exports.updateSubcategoria = async (id, nombre, categoriaId) => {
  const connection = await getConnection();
  await connection.query(
    "UPDATE subcategorias SET nombre = ?, categoriaId = ? WHERE subcategoriaId = ?",
    [nombre, categoriaId, id]
  );
  return { subcategoriaId: id, nombre, categoriaId };
};


exports.deleteSubcategoria = async (id) => {
  const connection = await getConnection();
  await connection.query("DELETE FROM subcategorias WHERE subcategoriaId = ?", [id]);
  return { subcategoriaId: id };
};
