const fs = require("fs");
const path = require("path");

const anuncioRepository = require("../repositories/anuncioRepository");
const imagenRepository = require("../repositories/imagenRepository");
const subcategoriaRepository = require("../repositories/subcategoriaRepository");

// Devuelve anuncios con nombres de subcategoría y usuario, e imágenes asociadas
exports.getAnuncios = async (req, rep) => {
  try {
    const anuncios = await anuncioRepository.getAnunciosConNombres();
    if (!anuncios || anuncios.length === 0) {
      return rep.status(404).json({ message: "No se encontraron anuncios" });
    }
    return rep.status(200).json(anuncios);
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

  // Validaciones básicas
  if (!usuarioId || isNaN(usuarioId))
    return rep
      .status(400)
      .json({ message: "usuarioId es obligatorio y debe ser numérico" });
  if (!titulo || typeof titulo !== "string" || !titulo.trim())
    return rep
      .status(400)
      .json({
        message: "El título es obligatorio y debe ser un string no vacío",
      });
  if (!descripcion || typeof descripcion !== "string" || !descripcion.trim())
    return rep
      .status(400)
      .json({
        message: "La descripción es obligatoria y debe ser un string no vacío",
      });
  if (precio === undefined || isNaN(precio))
    return rep
      .status(400)
      .json({ message: "El precio es obligatorio y debe ser numérico" });
  if (!categoriaId || isNaN(categoriaId))
    return rep
      .status(400)
      .json({ message: "categoriaId es obligatorio y debe ser numérico" });
  if (!subcategoriaId || isNaN(subcategoriaId))
    return rep
      .status(400)
      .json({ message: "subcategoriaId es obligatorio y debe ser numérico" });
  if (!estado || typeof estado !== "string" || !estado.trim())
    return rep
      .status(400)
      .json({
        message: "El estado es obligatorio y debe ser un string no vacío",
      });
  if (
    !estado_publicacion ||
    typeof estado_publicacion !== "string" ||
    !estado_publicacion.trim()
  )
    return rep
      .status(400)
      .json({
        message:
          "El estado_publicacion es obligatorio y debe ser un string no vacío",
      });
  if (!departamentoId || isNaN(departamentoId))
    return rep
      .status(400)
      .json({ message: "departamentoId es obligatorio y debe ser numérico" });
  if (!ciudadId || isNaN(ciudadId))
    return rep
      .status(400)
      .json({ message: "ciudadId es obligatorio y debe ser numérico" });

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
    const categoriaNombre = await subcategoriaRepository.getSubcategoriaById(
      anuncios.categoriaId
    );
    const subcategoria = await subcategoriaRepository.getSubcategoriaById(
      anuncios.subcategoriaId
    );

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
    const files = req.files || [];

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

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Convertir ruta a formato web universal
      const rutaWeb = file.path.replace(/\\/g, "/");
      const imagenId = await imagenRepository.createImage(
        file.filename,
        rutaWeb
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

exports.deleteAnuncioConImagenes = async (req, rep) => {
  const anuncioId = req.params.anuncioId;
  try {
    const imagenIds = await anuncioRepository.getImagenesIdsByAnuncio(
      anuncioId
    );

    await anuncioRepository.deleteAnuncioImagenes(anuncioId);

    for (const imagenId of imagenIds) {
      const imagen = await imagenRepository.getImagenesById(imagenId);
      if (imagen && imagen[0]) {
        try {
          fs.unlinkSync(path.resolve(imagen[0].ruta_archivo));
        } catch (error) {
          console.error(error);
        }
      }
      await imagenRepository.deleteImagenById(imagenId);
    }

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
    imagenes_a_eliminar,
  } = req.body;

  if (!anuncioId || isNaN(anuncioId) || Number(anuncioId) <= 0) {
    return rep
      .status(400)
      .json({
        message:
          "El ID de anuncio es requerido y debe ser un número válido y positivo.",
      });
  }
  if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
    return rep.status(400).json({ message: "El título es obligatorio." });
  }
  if (!descripcion || typeof descripcion !== "string" || !descripcion.trim()) {
    return rep.status(400).json({ message: "La descripción es obligatoria." });
  }
  if (!precio || isNaN(precio) || Number(precio) < 0) {
    return rep
      .status(400)
      .json({
        message: "El precio es obligatorio y debe ser un número válido.",
      });
  }
  if (!categoriaId || isNaN(categoriaId)) {
    return rep
      .status(400)
      .json({ message: "La categoría es obligatoria y debe ser un número." });
  }
  if (!subcategoriaId || isNaN(subcategoriaId)) {
    return rep
      .status(400)
      .json({
        message: "La subcategoría es obligatoria y debe ser un número.",
      });
  }
  if (!estado || typeof estado !== "string" || !estado.trim()) {
    return rep.status(400).json({ message: "El estado es obligatorio." });
  }
  if (
    !estado_publicacion ||
    typeof estado_publicacion !== "string" ||
    !estado_publicacion.trim()
  ) {
    return rep
      .status(400)
      .json({ message: "El estado de publicación es obligatorio." });
  }
  if (!departamentoId || isNaN(departamentoId)) {
    return rep
      .status(400)
      .json({
        message: "El departamento es obligatorio y debe ser un número.",
      });
  }
  if (!ciudadId || isNaN(ciudadId)) {
    return rep
      .status(400)
      .json({ message: "La ciudad es obligatoria y debe ser un número." });
  }

  let imagenesIdaEliminar = imagenes_a_eliminar;
  if (typeof imagenesIdaEliminar === "string") {
    try {
      imagenesIdaEliminar = JSON.parse(imagenesIdaEliminar);
    } catch {
      imagenesIdaEliminar = [];
    }
  }
  if (!Array.isArray(imagenesIdaEliminar)) imagenesIdaEliminar = [];
  imagenesIdaEliminar = imagenesIdaEliminar.filter(
    (id) => !isNaN(id) && Number(id) > 0
  );

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

    if (imagenesIdaEliminar.length > 0) {
      for (const imagenId of imagenesIdaEliminar) {
        await anuncioRepository.deleteAnuncioImagen(anuncioId, imagenId);
        const imagen = await imagenRepository.getImagenesById(imagenId);
        if (imagen && imagen[0]) {
          try {
            fs.unlinkSync(path.resolve(imagen[0].ruta_archivo));
          } catch (err) {}
        }
        await imagenRepository.deleteImagenById(imagenId);
      }
    }

    const files = req.files || [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.mimetype.startsWith("image/")) {
        return rep
          .status(400)
          .json({
            message: `El archivo ${file.originalname} no es una imagen válida.`,
          });
      }
      // Convertir ruta a formato web universal
      const rutaWeb = file.path.replace(/\\/g, "/");
      const imagenId = await imagenRepository.createImage(
        file.filename,
        rutaWeb
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

// Incrementar vistas de un anuncio
exports.incrementarVistas = async (req, rep) => {
  const anuncioId = req.params.anuncioId;
  try {
    const resultado = await anuncioRepository.incrementarVistas(anuncioId);
    if (resultado.affectedRows === 0) {
      return rep.status(404).json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
    }
    return rep.status(200).json({ message: "Vista incrementada correctamente" });
  } catch (error) {
    console.error(error);
    return rep.status(500).json({ message: "Error al incrementar las vistas" });
  }
};

// Obtener anuncios más vistos
exports.getAnunciosMasVistos = async (req, rep) => {
  try {
    const anuncios = await anuncioRepository.getAnunciosMasVistos();
    if (!anuncios || anuncios.length === 0) {
      return rep.status(404).json({ message: "No se encontraron anuncios" });
    }
    return rep.status(200).json(anuncios);
  } catch (error) {
    console.error(error);
    return rep.status(500).json({ message: "Error al obtener los anuncios más vistos" });
  }
};
