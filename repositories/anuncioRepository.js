const dbconnection = require('../db/mysqlConecction')
let connection = null

const getConnection = async () => {
    if (connection === null) {
        connection = await dbconnection();;
    }
    return connection
}

exports.getAnuncios = async () => {
    const connection = await getConnection();
    const [getAnunciosResultados] = await connection.query('SELECT* FROM anuncios ')
    if (!getAnunciosResultados || getAnunciosResultados.length > 0) {
        return null

    }
    return getAnunciosResultados
}

exports.getAnuncioById = async (anuncioId) => {
    const connection = await getConnection();

    const [getAnuncioByIdResultado] = await connection.query('SELECT* FROM anuncios WHERE anunciosId = ?', [anuncioId])
    if (!getAnuncioByIdResultado || getAnuncioByIdResultado.length === 0) {
        return null

    }
    return getAnuncioByIdResultado
}

exports.createAnuncio = async ( titulo, descripcion,
    precio, categoriaId, estado, estado_publicacion, departamentoId,
    ciudadId, zona, vistas, valoracion) => {
    const connection = await getConnection();

    const [createAnuncioResultado] = await connection.query('INSERT INTO anuncios (titulo,descripcion,precio,categoriaId,estado,estado_publicacion,departamentoId,ciudadId,zona,vistas,valoracion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [titulo, descripcion, precio, categoriaId, estado, estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion])
    if (!createAnuncioResultado || createAnuncioResultado.length === 0) {
        return null
    }
    return createAnuncioResultado
}

exports.updateAnuncio = async (anuncioId, titulo, descripcion,
    precio, categoriaId, estado, estado_publicacion, departamentoId,
    ciudadId, zona, vistas, valoracion) => {
    const connection = await getConnection();

    const [updateAnuncioResultado] = await connection.query('UPDATE anuncios SET titulo = ?,descripcion = ?,precio = ?,categoriaId = ?,estado = ?,estado_publicacion = ?,departamentoId = ?,ciudadId = ?,zona = ?,vistas = ?,valoracion = ? WHERE anuncioId = ?',
        [titulo, descripcion, precio, categoriaId, estado, estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion, anuncioId])
    if (!updateAnuncioResultado || updateAnuncioResultado.length === 0) {
        return null
    }
    return updateAnuncioResultado
}

exports.deleteAnuncio = async (anuncioId) => {
    const connection = await getConnection();

    const [deleteAnuncioResultado] = await connection.query('DELETE FROM anuncios WHERE anuncioId = ?  ', [anuncioId])
    if (!deleteAnuncioResultado || deleteAnuncioResultado.length === 0) {
        return null
    }
    return deleteAnuncioResultado
}