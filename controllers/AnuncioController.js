// Actualiza un anuncio y sus imágenes (agrega, elimina y mantiene las imágenes)
exports.updateAnuncioConImagenes = async (req, rep) => {
  const anuncioId = req.params.anuncioId;
  const {
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
    imagenes_a_eliminar, // array de IDs de imágenes a eliminar
  } = req.body;

  try {
    // 1. Actualizar datos del anuncio
    const updateAnuncioResultado = await anuncioRepository.updateAnuncio(
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
    );
    if (!updateAnuncioResultado || updateAnuncioResultado.affectedRows === 0) {
      return rep
        .status(404)
        .json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
    }

    // 2. Eliminar imágenes si corresponde
    if (Array.isArray(imagenes_a_eliminar)) {
      for (const imagenId of imagenes_a_eliminar) {
        // Eliminar asociación anuncio-imagen
        await anuncioRepository.deleteAnuncioImagen(anuncioId, imagenId);
        // Eliminar archivo físico y registro de imagen
        const imagen = await imagenRepository.getImagenesById(imagenId);
        if (imagen && imagen[0]) {
          try {
            fs.unlinkSync(path.resolve(imagen[0].ruta_archivo));
          } catch (err) {}
        }
        await imagenRepository.deleteImagenById(imagenId);
      }
    }

    // 3. Agregar nuevas imágenes si se subieron
    const files = req.files || [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imagenId = await imagenRepository.createImage(
        file.filename,
        file.path
      );
      await anuncioRepository.asociarImagen(anuncioId, imagenId, i === 0, i); // es_principal, orden
    }

    return rep
      .status(200)
      .json({ message: "Anuncio e imágenes actualizados correctamente" });
  } catch (error) {
    console.error(error);
    return rep
      .status(500)
      .json({ message: "Error al actualizar el anuncio y sus imágenes" });
  }
};

const fs = require("fs");
const path = require("path");

const anuncioRepository = require("../repositories/anuncioRepository");
const imagenRepository = require("../repositories/imagenRepository");

exports.getAnuncios = async (req, rep) => {
  try {
    const getAnunciosResultados = await anuncioRepository.getAnuncios();
    if (!getAnunciosResultados || getAnunciosResultados.length === 0) {
      return rep.status(404).json({ message: "No se encontraron anuncios" });
    }
    return rep.status(200).json(getAnunciosResultados);
  } catch (error) {
    console.error(error);
    return rep
      .status(500)
      .json({ message: "Error al obtener todos los anuncios" });
  }
};
exports.getAnuncioById = async (req, rep) => {
  const anuncioId = req.params.anuncioId;
  try {
    const getAnunciosByIdResultado = await anuncioRepository.getAnuncioById(
      anuncioId
    );
    if (!getAnunciosByIdResultado || getAnunciosByIdResultado.length === 0) {
      return rep
        .status(404)
        .json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
    }
    return rep.status(200).json(getAnunciosByIdResultado[0]);
  } catch (error) {
    console.error(error);
    return rep.status(500).json({ message: "Error al obtener el anuncio" });
  }
};
exports.createAnuncio = async (req, rep) => {
  const usuarioId = req.body.usuarioId;
  const titulo = req.body.titulo;
  const descripcion = req.body.descripcion;
  const precio = req.body.precio;
  const categoriaId = req.body.categoriaId;
  const subcategoriaId = req.body.subcategoriaId;
  const estado = req.body.estado;
  const estado_publicacion = req.body.estado_publicacion;
  const departamentoId = req.body.departamentoId;
  const ciudadId = req.body.ciudadId;
  const zona = req.body.zona;
  const vistas = req.body.vistas;
  const valoracion = req.body.valoracion;

  try {
    const createAnuncioResultado = await anuncioRepository.createAnuncio(
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
    );
    if (!createAnuncioResultado || !createAnuncioResultado.insertId) {
      return rep.status(400).json({ message: "No se pudo crear el anuncio" });
    }
    return rep.status(201).json({
      message: "Anuncio creado exitosamente",
      anuncioId: createAnuncioResultado.insertId,
    });
  } catch (error) {
    console.error(error);
    return rep.status(500).json({ message: "Error al crear el anuncio" });
  }
};

exports.updateAnuncio = async (req, rep) => {
  const anuncioId = req.params.anuncioId;
  const {
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
  } = req.body;

  try {
    const updateAnuncioResultado = await anuncioRepository.updateAnuncio(
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
    );
    if (!updateAnuncioResultado || updateAnuncioResultado.affectedRows === 0) {
      return rep
        .status(404)
        .json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
    }
    return rep
      .status(200)
      .json({ message: "Anuncio actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    return rep.status(500).json({ message: "Error al actualizar el anuncio" });
  }
};
exports.deleteAnuncio = async (req, rep) => {
  const anuncioId = req.params.anuncioId;
  try {
    const deleteAnuncioResultado = await anuncioRepository.deleteAnuncio(
      anuncioId
    );
    if (!deleteAnuncioResultado || deleteAnuncioResultado.affectedRows === 0) {
      return rep
        .status(404)
        .json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
    }
    return rep
      .status(200)
      .json({
        message: `Se eliminó con éxito el anuncio con el id ${anuncioId}`,
      });
  } catch (error) {
    console.error(error);
    return rep.status(500).json({ message: "Error al eliminar el anuncio" });
  }
};

exports.getAnunciosConImagenes = async (req, res) => {
  try {
    const anuncios = await anuncioRepository.getAnunciosConImagenes();
    return res.status(200).json(anuncios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener los anuncios" });
  }
};

exports.getAnuncioConImagenesById = async (req, res) => {
  const anuncioId = req.params.anuncioId;
  try {
    const anuncio = await anuncioRepository.getAnuncioConImagenesById(
      anuncioId
    );
    if (!anuncio) {
      return res.status(404).json({ message: "No se encontró el anuncio" });
    }
    return res.status(200).json(anuncio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el anuncio" });
  }
};

exports.createAnuncioConImagenes = async (req, res) => {
  try {
    // 1. Extraer datos del body
    const {
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
    } = req.body;

    // 2. Crear el anuncio (ajusta los campos según tu base de datos)
    const anuncioResult = await anuncioRepository.createAnuncio(
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
    );
    const anuncioId = anuncioResult.insertId;

    // 3. Guardar imágenes y asociarlas
    const files = req.files || [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imagenId = await imagenRepository.createImage(
        file.filename,
        file.path
      );
      await anuncioRepository.asociarImagen(anuncioId, imagenId, i === 0, i); // es_principal, orden
    }

    res
      .status(201)
      .json({ message: "Anuncio creado correctamente", anuncioId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el anuncio" });
  }
};

// Elimina un anuncio y todas sus imágenes asociadas (registros y archivos)
exports.deleteAnuncioConImagenes = async (req, rep) => {
  const anuncioId = req.params.anuncioId;
  try {
    // 1. Obtener los IDs de las imágenes asociadas
    const imagenIds = await anuncioRepository.getImagenesIdsByAnuncio(
      anuncioId
    );

    // 2. Eliminar los registros de anuncio_imagenes
    await anuncioRepository.deleteAnuncioImagenes(anuncioId);

    // 3. Eliminar los registros de imágenes y archivos físicos
    for (const imagenId of imagenIds) {
      // Obtener info de la imagen
      const imagen = await imagenRepository.getImagenesById(imagenId);
      if (imagen && imagen[0]) {
        // Eliminar archivo físico
        try {
          fs.unlinkSync(path.resolve(imagen[0].ruta_archivo));
        } catch (err) {
          // Si el archivo no existe, continuar
        }
      }
      // Eliminar registro de la imagen
      await imagenRepository.deleteImagenById(imagenId);
    }

    // 4. Eliminar el anuncio
    const deleteAnuncioResultado = await anuncioRepository.deleteAnuncio(
      anuncioId
    );
    if (!deleteAnuncioResultado || deleteAnuncioResultado.affectedRows === 0) {
      return rep
        .status(404)
        .json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
    }
    return rep
      .status(200)
      .json({
        message: `Se eliminó con éxito el anuncio y sus imágenes asociadas`,
      });
  } catch (error) {
    console.error(error);
    return rep
      .status(500)
      .json({ message: "Error al eliminar el anuncio y sus imágenes" });
  }
};

exports.buscarAnuncios = async (req, res) => {
  try {
    // req.query contendrá los filtros, ej: { category: 'laptops-y-computadoras' }
    const filtros = req.query;

    const anuncios = await anuncioRepository.buscar(filtros);

    res.status(200).json(anuncios);
  } catch (error) {
    console.error("Error en buscarAnuncios:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al buscar anuncios." });
  }
};

exports.updateEstadoPublicacion = async (req, rep) => {
  const anuncioId = req.params.anuncioId;
  const estado_publicacion = req.body.estado_publicacion;
  const estadosValidos = ["activo", "inactivo", "vendido"];
  if (!estadosValidos.includes(estado_publicacion)) {
    return rep
      .status(400)
      .json({
        message:
          "Estado de publicación no válido. Opciones: activo, inactivo, vendido.",
      });
  }
  try {
    const updateEstadoResultado =
      await anuncioRepository.updateEstadoPublicacion(
        anuncioId,
        estado_publicacion
      );
    if (!updateEstadoResultado || updateEstadoResultado.affectedRows === 0) {
      return rep
        .status(404)
        .json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
    }
    return rep
      .status(200)
      .json({
        message: `Estado de publicación actualizado a '${estado_publicacion}'`,
      });
  } catch (error) {
    console.error(error);
    return rep
      .status(500)
      .json({ message: "Error al actualizar el estado de publicación" });
  }
};
