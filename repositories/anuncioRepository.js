const dbconnection = require("../db/mysqlConecction");
let connection = null;

const getConnection = async () => {
  if (connection === null) {
    connection = await dbconnection();
  }
  return connection;
};

exports.getAnuncios = async () => {
  const connection = await getConnection();
  const [getAnunciosResultados] = await connection.query(
    "SELECT* FROM anuncios "
  );
  if (!getAnunciosResultados || getAnunciosResultados.length === 0) {
    return null;
  }
  return getAnunciosResultados;
};

exports.getAnuncioById = async (anuncioId) => {
  const connection = await getConnection();

  const [getAnuncioByIdResultado] = await connection.query(
    "SELECT* FROM anuncios WHERE anuncioId = ?",
    [anuncioId]
  );
  if (!getAnuncioByIdResultado || getAnuncioByIdResultado.length === 0) {
    return null;
  }
  return getAnuncioByIdResultado;
};

exports.createAnuncio = async (
  usuarioId,
  titulo,
  descripcion,
  precio,
  categoriaId,
  subcategoriaId,
  estado,
  estado_publicacion,
  departamentoId,
  ciudadId,
  zona,
  vistas,
  valoracion
) => {
  const connection = await getConnection();
  const [createAnuncioResultado] = await connection.query(
    "INSERT INTO anuncios (usuarioId, titulo, descripcion, precio, categoriaId, subcategoriaId, estado, estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      usuarioId,
      titulo,
      descripcion,
      precio,
      categoriaId,
      subcategoriaId,
      estado,
      estado_publicacion,
      departamentoId,
      ciudadId,
      zona,
      vistas,
      valoracion,
    ]
  );
  if (!createAnuncioResultado || createAnuncioResultado.length === 0) {
    return null;
  }
  return createAnuncioResultado;
};

exports.updateAnuncio = async (
  anuncioId,
  titulo,
  descripcion,
  precio,
  categoriaId,
  subcategoriaId,
  estado,
  estado_publicacion,
  departamentoId,
  ciudadId,
  zona,
  vistas,
  valoracion
) => {
  const connection = await getConnection();
  const [updateAnuncioResultado] = await connection.query(
    "UPDATE anuncios SET titulo = ?, descripcion = ?, precio = ?, categoriaId = ?, subcategoriaId = ?, estado = ?, estado_publicacion = ?, departamentoId = ?, ciudadId = ?, zona = ?, vistas = ?, valoracion = ? WHERE anuncioId = ?",
    [
      titulo,
      descripcion,
      precio,
      categoriaId,
      subcategoriaId,
      estado,
      estado_publicacion,
      departamentoId,
      ciudadId,
      zona,
      vistas,
      valoracion,
      anuncioId,
    ]
  );
  if (!updateAnuncioResultado || updateAnuncioResultado.length === 0) {
    return null;
  }
  return updateAnuncioResultado;
};

exports.deleteAnuncio = async (anuncioId) => {
  const connection = await getConnection();

  const [deleteAnuncioResultado] = await connection.query(
    "DELETE FROM anuncios WHERE anuncioId = ?  ",
    [anuncioId]
  );
  if (!deleteAnuncioResultado || deleteAnuncioResultado.length === 0) {
    return null;
  }
  return deleteAnuncioResultado;
};
exports.asociarImagen = async (anuncioId, imagenId, es_principal, orden) => {
  const connection = await getConnection();
  await connection.query(
    "INSERT INTO anuncio_imagenes (anuncioId, imagenId, es_principal, orden) VALUES (?, ?, ?, ?)",
    [anuncioId, imagenId, es_principal ? 1 : 0, orden]
  );
};

exports.getAnunciosConImagenes = async () => {
  const connection = await getConnection();
  // Trae todos los anuncios
  const [anuncios] = await connection.query("SELECT * FROM anuncios");
  if (!anuncios || anuncios.length === 0) return [];
  // Trae todas las imágenes asociadas
  const [imagenes] = await connection.query(
    `SELECT ai.anuncioId, i.imagenId, i.nombre_archivo, i.ruta_archivo, ai.es_principal, ai.orden
         FROM anuncio_imagenes ai
         JOIN imagenes i ON ai.imagenId = i.imagenId`
  );
  // Asocia imágenes a cada anuncio
  anuncios.forEach((anuncio) => {
    anuncio.imagenes = imagenes.filter(
      (img) => img.anuncioId === anuncio.anuncioId
    );
  });
  return anuncios;
};

exports.getAnuncioConImagenesById = async (anuncioId) => {
  const connection = await getConnection();
  // Trae el anuncio
  const [anuncioRows] = await connection.query(
    "SELECT * FROM anuncios WHERE anuncioId = ?",
    [anuncioId]
  );
  if (!anuncioRows || anuncioRows.length === 0) return null;
  const anuncio = anuncioRows[0];
  // Trae las imágenes asociadas
  const [imagenes] = await connection.query(
    `SELECT i.imagenId, i.nombre_archivo, i.ruta_archivo, ai.es_principal, ai.orden
         FROM anuncio_imagenes ai
         JOIN imagenes i ON ai.imagenId = i.imagenId
         WHERE ai.anuncioId = ?
         ORDER BY ai.orden ASC`,
    [anuncioId]
  );
  anuncio.imagenes = imagenes;
  return anuncio;
};

/**
 * Busca y filtra anuncios basándose en un objeto de filtros.
 * @param {object} filtros - Un objeto que puede contener: { categoria, departamentoId, ciudadId, precioMin, precioMax, busquedaTexto }
 * @returns {Promise<Array>} - Un array de anuncios que coinciden con los filtros.
 */
exports.buscar = async (filtros) => {
  const conn = await getConnection();

  // Base de la consulta SQL
  let sql = `
        SELECT 
            a.anuncioId, a.titulo, a.precio, a.estado,
            c.nombre AS ciudad,
            d.nombre AS departamento,
            cat.nombre AS categoria,
            subcat.nombre AS subcategoria,
            (SELECT i.ruta_archivo FROM anuncio_imagenes ai JOIN imagenes i ON ai.imagenId = i.imagenId WHERE ai.anuncioId = a.anuncioId AND ai.es_principal = 1 LIMIT 1) AS imagen_principal
        FROM anuncios a
        JOIN ciudades c ON a.ciudadId = c.ciudadId
        -- ------ INICIO DE LA CORRECCIÓN ------
        JOIN departamentos d ON a.departamentoId = d.departamentoId -- Corregido: 'departmentoId' a 'departamentoId'
        -- ------ FIN DE LA CORRECCIÓN ------
        JOIN categorias cat ON a.categoriaId = cat.categoriaId
        JOIN subcategorias subcat ON a.subcategoriaId = subcat.subcategoriaId
    `;

  const whereClauses = [];
  const params = [];

  // --- Construcción dinámica de la cláusula WHERE ---

  if (filtros.categoria) {
    whereClauses.push("cat.nombre = ?");
    params.push(filtros.categoria);
  }
  if (filtros.subcategoriaId) {
    whereClauses.push("a.subcategoriaId = ?");
    params.push(filtros.subcategoriaId);
  }
  if (filtros.departamentoId) {
    whereClauses.push("a.departamentoId = ?");
    params.push(filtros.departamentoId);
  }
  if (filtros.ciudadId) {
    whereClauses.push("a.ciudadId = ?");
    params.push(filtros.ciudadId);
  }
  if (filtros.precioMin) {
    whereClauses.push("a.precio >= ?");
    params.push(filtros.precioMin);
  }
  if (filtros.precioMax) {
    whereClauses.push("a.precio <= ?");
    params.push(filtros.precioMax);
  }
  if (filtros.busquedaTexto) {
    whereClauses.push("a.titulo LIKE ?");
    params.push(`%${filtros.busquedaTexto}%`);
  }

  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  sql += " ORDER BY a.fecha_creacion DESC";

  const [rows] = await conn.query(sql, params);
  return rows;
};

// Elimina la asociación de una imagen específica a un anuncio
exports.deleteAnuncioImagen = async (anuncioId, imagenId) => {
  const connection = await getConnection();
  await connection.query(
    "DELETE FROM anuncio_imagenes WHERE anuncioId = ? AND imagenId = ?",
    [anuncioId, imagenId]
  );
};
// Actualiza solo el estado_publicacion de un anuncio
exports.updateEstadoPublicacion = async (anuncioId, estado_publicacion) => {
  const connection = await getConnection();
  const [result] = await connection.query(
    "UPDATE anuncios SET estado_publicacion = ? WHERE anuncioId = ?",
    [estado_publicacion, anuncioId]
  );
  return result;
};
// Obtiene los IDs de las imágenes asociadas a un anuncio
exports.getImagenesIdsByAnuncio = async (anuncioId) => {
  const connection = await getConnection();
  const [rows] = await connection.query(
    "SELECT imagenId FROM anuncio_imagenes WHERE anuncioId = ?",
    [anuncioId]
  );
  return rows.map((row) => row.imagenId);
};

// Elimina los registros de anuncio_imagenes asociados a un anuncio
exports.deleteAnuncioImagenes = async (anuncioId) => {
  const connection = await getConnection();
  await connection.query("DELETE FROM anuncio_imagenes WHERE anuncioId = ?", [
    anuncioId,
  ]);
};
