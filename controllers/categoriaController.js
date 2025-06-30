const categoriaRepository = require("../repositories/categoriaRepository");

exports.getCategorias = async (req, res) => {
  try {
    const categorias = await categoriaRepository.getCategorias();
    res.status(200).json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
};

exports.getSubcategoriasByCategoria = async (req, res) => {
  const categoriaId = req.params.categoriaId;
  try {
    const subcategorias = await categoriaRepository.getSubcategoriasByCategoria(
      categoriaId
    );
    res.status(200).json(subcategorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las subcategorías" });
  }
};

exports.getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaRepository.getCategoriaById(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la categoría" });
  }
};

exports.createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio y debe ser un string no vacío" });
    }
    const nuevaCategoria = await categoriaRepository.createCategoria(nombre);
    if (!nuevaCategoria) {
      return res.status(500).json({ message: "No se pudo crear la categoría" });
    }
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la categoría" });
  }
};

exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio y debe ser un string no vacío" });
    }
    const updated = await categoriaRepository.updateCategoria(id, nombre);
    if (!updated) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la categoría" });
  }
};

exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await categoriaRepository.deleteCategoria(id);
    if (!deleted) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.status(200).json({ message: "Categoría eliminada", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la categoría" });
  }
};

exports.getCategoriasConConteo = async (req, res) => {
  try {
    const categorias = await categoriaRepository.getCategoriasConConteo();
    return res.status(200).json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías con conteo:', error);
    return res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

