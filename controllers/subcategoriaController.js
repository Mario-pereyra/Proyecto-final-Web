const subcategoriaRepository = require("../repositories/subcategoriaRepository");

exports.getSubcategorias = async (req, res) => {
  try {
    const subcategorias = await subcategoriaRepository.getSubcategorias();
    res.status(200).json(subcategorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las subcategorías" });
  }
};

exports.getSubcategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategoria = await subcategoriaRepository.getSubcategoriaById(id);
    if (!subcategoria) {
      return res.status(404).json({ message: "Subcategoría no encontrada" });
    }
    res.status(200).json(subcategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la subcategoría" });
  }
};

exports.createSubcategoria = async (req, res) => {
  try {
    const { nombre, categoriaId } = req.body;
    if (!nombre || !categoriaId) return res.status(400).json({ message: "Nombre y categoriaId son obligatorios" });
    const nuevaSubcategoria = await subcategoriaRepository.createSubcategoria(nombre, categoriaId);
    if (!nuevaSubcategoria) {
      return res.status(500).json({ message: "No se pudo crear la subcategoría" });
    }
    res.status(201).json(nuevaSubcategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la subcategoría" });
  }
};

exports.updateSubcategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoriaId } = req.body;
    if (!nombre || !categoriaId) return res.status(400).json({ message: "Nombre y categoriaId son obligatorios" });
    const updated = await subcategoriaRepository.updateSubcategoria(id, nombre, categoriaId);
    if (!updated) {
      return res.status(404).json({ message: "Subcategoría no encontrada" });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la subcategoría" });
  }
};

exports.deleteSubcategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await subcategoriaRepository.deleteSubcategoria(id);
    if (!deleted) {
      return res.status(404).json({ message: "Subcategoría no encontrada" });
    }
    res.status(200).json({ message: "Subcategoría eliminada", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la subcategoría" });
  }
};

exports.getSubcategoriasByCategoria = async (req, res) => {
  const categoriaId = req.params.categoriaId;
  try {
    const subcategorias = await subcategoriaRepository.getSubcategoriasByCategoria(categoriaId);
    res.status(200).json(subcategorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las subcategorías" });
  }
};
