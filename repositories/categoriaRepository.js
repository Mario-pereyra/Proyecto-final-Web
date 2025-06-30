const dbconnection = require("../db/mysqlConecction");
let connection = null;

const getConnection = async () => {
  if (connection === null) {
    connection = await dbconnection();
  }
  return connection;
};

exports.getCategorias = async () => {
  const connection = await getConnection();
  const [categorias] = await connection.query("SELECT * FROM categorias");
  return categorias;
};

exports.getCategoriaById = async (id) => {
  const connection = await getConnection();
  const [categoria] = await connection.query("SELECT * FROM categorias WHERE categoriaId = ?", [id]);
  return categoria[0];
};

exports.createCategoria = async (nombre) => {
  const connection = await getConnection();
  const [result] = await connection.query("INSERT INTO categorias (nombre) VALUES (?)", [nombre]);
  return { id: result.insertId, nombre };
};

exports.updateCategoria = async (id, nombre) => {
  const connection = await getConnection();
  await connection.query("UPDATE categorias SET nombre = ? WHERE categoriaId = ?", [nombre, id]);
  return { id, nombre };
};

exports.deleteCategoria = async (id) => {
  const connection = await getConnection();
  await connection.query("DELETE FROM categorias WHERE categoriaId = ?", [id]);
  return { id };
};

exports.getCategoriasConConteo = async () => {
  const connection = await getConnection();
  const [categorias] = await connection.query(`
    SELECT 
      c.categoriaId,
      c.nombre,
      COUNT(a.anuncioId) as totalAnuncios
    FROM categorias c
    LEFT JOIN anuncios a ON c.categoriaId = a.categoriaId 
      AND a.estado_publicacion = 'activo'
    GROUP BY c.categoriaId, c.nombre
    ORDER BY totalAnuncios DESC, c.nombre ASC
  `);
  
  return categorias;
};

