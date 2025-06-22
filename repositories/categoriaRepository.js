const dbconnection = require('../db/mysqlConecction');
let connection = null;

const getConnection = async () => {
    if (connection === null) {
        connection = await dbconnection();
    }
    return connection;
};

exports.getCategorias = async () => {
    const connection = await getConnection();
    const [categorias] = await connection.query('SELECT * FROM categorias');
    return categorias;
};

exports.getSubcategoriasByCategoria = async (categoriaId) => {
    const connection = await getConnection();
    const [subcategorias] = await connection.query('SELECT * FROM subcategorias WHERE categoriaId = ?', [categoriaId]);
    return subcategorias;
};
