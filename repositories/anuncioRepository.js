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
  const [getAnunciosResultados] = await connection.query(`
    SELECT 
      a.*, 
      c.nombre AS categoriaNombre,
      s.nombre AS subcategoriaNombre,
      COALESCE(u.nombre_completo, 'Usuario desconocido') AS usuarioNombre
    FROM anuncios a
    LEFT JOIN categorias c ON a.categoriaId = c.categoriaId
    LEFT JOIN subcategorias s ON a.subcategoriaId = s.subcategoriaId
    LEFT JOIN usuarios u ON a.usuarioId = u.usuarioId
  `);
  if (!getAnunciosResultados || getAnunciosResultados.length === 0) {
    return null;
  }
  return getAnunciosResultados;
};

exports.getAnuncioById = async (anuncioId) => {
  const connection = await getConnection();

  const [getAnuncioByIdResultado] = await connection.query(
    `
    SELECT 
      a.*, 
      c.nombre AS categoriaNombre,
      s.nombre AS subcategoriaNombre,
      COALESCE(u.nombre_completo, 'Usuario desconocido') AS usuarioNombre
    FROM anuncios a
    LEFT JOIN categorias c ON a.categoriaId = c.categoriaId
    LEFT JOIN subcategorias s ON a.subcategoriaId = s.subcategoriaId
    LEFT JOIN usuarios u ON a.usuarioId = u.usuarioId
    WHERE a.anuncioId = ?
  `,
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

  const [anuncios] = await connection.query(`
    SELECT 
      a.*, 
      c.nombre AS categoriaNombre,
      s.nombre AS subcategoriaNombre,
      COALESCE(u.nombre_completo, 'Usuario desconocido') AS usuarioNombre
    FROM anuncios a
    LEFT JOIN categorias c ON a.categoriaId = c.categoriaId
    LEFT JOIN subcategorias s ON a.subcategoriaId = s.subcategoriaId
    LEFT JOIN usuarios u ON a.usuarioId = u.usuarioId
  `);
  if (!anuncios || anuncios.length === 0) {
    return [];
  }

  const [imagenes] = await connection.query(
    `SELECT ai.anuncioId, i.imagenId, i.nombre_archivo, i.ruta_archivo, ai.es_principal, ai.orden
         FROM anuncio_imagenes ai
         JOIN imagenes i ON ai.imagenId = i.imagenId`
  );

  anuncios.forEach((anuncio) => {
    anuncio.imagenes = imagenes.filter(
      (img) => img.anuncioId === anuncio.anuncioId
    );
  });
  return anuncios;
};

exports.getAnuncioConImagenesById = async (anuncioId) => {
  const connection = await getConnection();
  const [anuncioRows] = await connection.query(
    `
    SELECT 
      a.*, 
      c.nombre AS categoriaNombre,
      s.nombre AS subcategoriaNombre,
      COALESCE(u.nombre_completo, 'Usuario desconocido') AS usuarioNombre
    FROM anuncios a
    LEFT JOIN categorias c ON a.categoriaId = c.categoriaId
    LEFT JOIN subcategorias s ON a.subcategoriaId = s.subcategoriaId
    LEFT JOIN usuarios u ON a.usuarioId = u.usuarioId
    WHERE a.anuncioId = ?
  `,
    [anuncioId]
  );
  if (!anuncioRows || anuncioRows.length === 0) return null;
  const anuncio = anuncioRows[0];

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

exports.deleteAnuncioImagen = async (anuncioId, imagenId) => {
  const connection = await getConnection();
  await connection.query(
    "DELETE FROM anuncio_imagenes WHERE anuncioId = ? AND imagenId = ?",
    [anuncioId, imagenId]
  );
};

exports.updateEstadoPublicacion = async (anuncioId, estado_publicacion) => {
  const connection = await getConnection();
  const [result] = await connection.query(
    "UPDATE anuncios SET estado_publicacion = ? WHERE anuncioId = ?",
    [estado_publicacion, anuncioId]
  );
  return result;
};

exports.getImagenesIdsByAnuncio = async (anuncioId) => {
  const connection = await getConnection();
  const [rows] = await connection.query(
    "SELECT imagenId FROM anuncio_imagenes WHERE anuncioId = ?",
    [anuncioId]
  );
  return rows.map((row) => row.imagenId);
};

exports.deleteAnuncioImagenes = async (anuncioId) => {
  const connection = await getConnection();
  await connection.query("DELETE FROM anuncio_imagenes WHERE anuncioId = ?", [
    anuncioId,
  ]);
};

exports.buscar = async (filtros) => {
  const conn = await getConnection();  let sql = `
        SELECT 
            a.anuncioId, a.titulo, a.precio, a.estado,
            c.nombre AS ciudad,
            d.nombre AS departamento,
            cat.nombre AS categoria,
            subcat.nombre AS subcategoriaNombre,
            COALESCE(u.nombre_completo, 'Usuario desconocido') AS usuarioNombre,
            (SELECT i.ruta_archivo FROM anuncio_imagenes ai JOIN imagenes i ON ai.imagenId = i.imagenId WHERE ai.anuncioId = a.anuncioId AND ai.es_principal = 1 LIMIT 1) AS imagen_principal
        FROM anuncios a
        JOIN ciudades c ON a.ciudadId = c.ciudadId
        JOIN departamentos d ON a.departamentoId = d.departamentoId
        JOIN categorias cat ON a.categoriaId = cat.categoriaId
        JOIN subcategorias subcat ON a.subcategoriaId = subcat.subcategoriaId
        LEFT JOIN usuarios u ON a.usuarioId = u.usuarioId
    `;

  const whereClauses = ["a.estado_publicacion = ?"];
  const params = ["activo"];
  // Filtro por categoría (nombre o ID)
  if (filtros.categoria) {
    whereClauses.push("cat.nombre = ?");
    params.push(filtros.categoria);
  }
  if (filtros.categoriaId) {
    whereClauses.push("a.categoriaId = ?");
    params.push(filtros.categoriaId);
  }

  // Filtro por subcategoría (nombre o ID)
  if (filtros.subcategoria) {
    whereClauses.push("subcat.nombre = ?");
    params.push(filtros.subcategoria);
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
    whereClauses.push("(a.titulo LIKE ? OR a.descripcion LIKE ?)");
    params.push(`%${filtros.busquedaTexto}%`, `%${filtros.busquedaTexto}%`);
  }

  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }
  sql += " ORDER BY a.fecha_creacion DESC";

  console.log("Query SQL:", sql);
  console.log("Parámetros:", params);

  const [rows] = await conn.query(sql, params);
  return rows;
};

// Devuelve anuncios con nombres de subcategoría y usuario, e imágenes asociadas
exports.getAnunciosConNombres = async () => {
  const connection = await getConnection();
  const [anuncios] = await connection.query(`
    SELECT 
      a.*, 
      s.nombre AS subcategoriaNombre, 
      c.nombre AS categoriaNombre,
      COALESCE(u.nombre_completo, 'Usuario desconocido') AS usuarioNombre
    FROM anuncios a
    LEFT JOIN subcategorias s ON a.subcategoriaId = s.subcategoriaId
    LEFT JOIN categorias c ON a.categoriaId = c.categoriaId
    LEFT JOIN usuarios u ON a.usuarioId = u.usuarioId
    WHERE a.estado_publicacion = 'activo'
    ORDER BY a.fecha_creacion DESC
  `);

  console.log("Anuncios obtenidos:", anuncios.length);
  if (anuncios.length > 0) {
    console.log("Primer anuncio:", {
      titulo: anuncios[0].titulo,
      subcategoriaNombre: anuncios[0].subcategoriaNombre,
      usuarioNombre: anuncios[0].usuarioNombre,
    });
  }

  if (!anuncios || anuncios.length === 0) {
    return [];
  }

  // Obtener imágenes asociadas
  const [imagenes] = await connection.query(
    `SELECT ai.anuncioId, i.imagenId, i.nombre_archivo, i.ruta_archivo, ai.es_principal, ai.orden
     FROM anuncio_imagenes ai
     JOIN imagenes i ON ai.imagenId = i.imagenId
     ORDER BY ai.es_principal DESC, ai.orden ASC`
  );

  anuncios.forEach((anuncio) => {
    anuncio.imagenes = imagenes.filter(
      (img) => img.anuncioId === anuncio.anuncioId
    );
  });

  return anuncios;
};
