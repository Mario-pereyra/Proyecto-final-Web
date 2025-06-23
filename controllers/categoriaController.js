

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
    if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });
    const nuevaCategoria = await categoriaRepository.createCategoria(nombre);
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
    if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });
    const updated = await categoriaRepository.updateCategoria(id, nombre);
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la categoría" });
  }
};

exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    await categoriaRepository.deleteCategoria(id);
    res.status(200).json({ message: "Categoría eliminada", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la categoría" });
  }
};

