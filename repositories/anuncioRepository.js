// Obtiene los IDs de las imágenes asociadas a un anuncio
exports.getImagenesIdsByAnuncio = async (anuncioId) => {
    const connection = await getConnection();
    const [rows] = await connection.query(
        'SELECT imagenId FROM anuncio_imagenes WHERE anuncioId = ?', [anuncioId]
    );
    return rows.map(row => row.imagenId);
};

// Elimina los registros de anuncio_imagenes asociados a un anuncio
exports.deleteAnuncioImagenes = async (anuncioId) => {
    const connection = await getConnection();
    await connection.query('DELETE FROM anuncio_imagenes WHERE anuncioId = ?', [anuncioId]);
};


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
    if (!getAnunciosResultados || getAnunciosResultados.length === 0) {
        return null

    }
    return getAnunciosResultados
}

exports.getAnuncioById = async (anuncioId) => {
    const connection = await getConnection();

    const [getAnuncioByIdResultado] = await connection.query('SELECT* FROM anuncios WHERE anuncioId = ?', [anuncioId])
    if (!getAnuncioByIdResultado || getAnuncioByIdResultado.length === 0) {
        return null

    }
    return getAnuncioByIdResultado
}



exports.createAnuncio = async (usuarioId, titulo, descripcion,
    precio, categoriaId, subcategoriaId, estado, estado_publicacion, departamentoId,
    ciudadId, zona, vistas, valoracion) => {
    const connection = await getConnection();
    const [createAnuncioResultado] = await connection.query(
        'INSERT INTO anuncios (usuarioId, titulo, descripcion, precio, categoriaId, subcategoriaId, estado, estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [usuarioId, titulo, descripcion, precio, categoriaId, subcategoriaId, estado, estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion]
    );
    if (!createAnuncioResultado || createAnuncioResultado.length === 0) {
        return null;
    }
    return createAnuncioResultado;
}



exports.updateAnuncio = async (anuncioId, titulo, descripcion,
    precio, categoriaId, subcategoriaId, estado, estado_publicacion, departamentoId,
    ciudadId, zona, vistas, valoracion) => {
    const connection = await getConnection();
    const [updateAnuncioResultado] = await connection.query(
        'UPDATE anuncios SET titulo = ?, descripcion = ?, precio = ?, categoriaId = ?, subcategoriaId = ?, estado = ?, estado_publicacion = ?, departamentoId = ?, ciudadId = ?, zona = ?, vistas = ?, valoracion = ? WHERE anuncioId = ?',
        [titulo, descripcion, precio, categoriaId, subcategoriaId, estado, estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion, anuncioId]
    );
    if (!updateAnuncioResultado || updateAnuncioResultado.length === 0) {
        return null;
    }
    return updateAnuncioResultado;
}

exports.deleteAnuncio = async (anuncioId) => {
    const connection = await getConnection();

    const [deleteAnuncioResultado] = await connection.query('DELETE FROM anuncios WHERE anuncioId = ?  ', [anuncioId])
    if (!deleteAnuncioResultado || deleteAnuncioResultado.length === 0) {
        return null
    }
    return deleteAnuncioResultado
}
exports.asociarImagen = async (anuncioId, imagenId, es_principal, orden) => {
  const connection = await getConnection();
  await connection.query(
    'INSERT INTO anuncio_imagenes (anuncioId, imagenId, es_principal, orden) VALUES (?, ?, ?, ?)',
    [anuncioId, imagenId, es_principal ? 1 : 0, orden]
  );
};

exports.getAnunciosConImagenes = async () => {
    const connection = await getConnection();
    // Trae todos los anuncios
    const [anuncios] = await connection.query('SELECT * FROM anuncios');
    if (!anuncios || anuncios.length === 0) return [];
    // Trae todas las imágenes asociadas
    const [imagenes] = await connection.query(
        `SELECT ai.anuncioId, i.imagenId, i.nombre_archivo, i.ruta_archivo, ai.es_principal, ai.orden
         FROM anuncio_imagenes ai
         JOIN imagenes i ON ai.imagenId = i.imagenId`
    );
    // Asocia imágenes a cada anuncio
    anuncios.forEach(anuncio => {
        anuncio.imagenes = imagenes.filter(img => img.anuncioId === anuncio.anuncioId);
    });
    return anuncios;
};

exports.getAnuncioConImagenesById = async (anuncioId) => {
    const connection = await getConnection();
    // Trae el anuncio
    const [anuncioRows] = await connection.query('SELECT * FROM anuncios WHERE anuncioId = ?', [anuncioId]);
    if (!anuncioRows || anuncioRows.length === 0) return null;
    const anuncio = anuncioRows[0];
    // Trae las imágenes asociadas
    const [imagenes] = await connection.query(
        `SELECT i.imagenId, i.nombre_archivo, i.ruta_archivo, ai.es_principal, ai.orden
         FROM anuncio_imagenes ai
         JOIN imagenes i ON ai.imagenId = i.imagenId
         WHERE ai.anuncioId = ?
         ORDER BY ai.orden ASC`, [anuncioId]
    );
    anuncio.imagenes = imagenes;
    return anuncio;
};