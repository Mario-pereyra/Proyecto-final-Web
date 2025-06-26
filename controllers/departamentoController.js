const departamentoRepository = require("../repositories/departamentoRepository");

exports.getDepartamentos = async (req, res) => {
  try {
    const departamentos = await departamentoRepository.getDepartamentos();
    res.status(200).json(departamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los departamentos" });
  }
};

exports.getCiudadesByDepartamento = async (req, res) => {
  const departamentoId = req.params.departamentoId;
  try {
    const ciudades = await departamentoRepository.getCiudadesByDepartamento(
      departamentoId
    );
    res.status(200).json(ciudades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las ciudades" });
  }
};
exports.getDepartamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const departamento = await departamentoRepository.getDepartamentoById(id);
    if (!departamento) {
      return res.status(404).json({ message: "Departamento no encontrado" });
    }
    res.status(200).json(departamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el departamento" });
  }
};

exports.createDepartamento = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });
    const nuevoDepartamento = await departamentoRepository.createDepartamento(nombre);
    if (!nuevoDepartamento) {
      return res.status(500).json({ message: "No se pudo crear el departamento" });
    }
    res.status(201).json(nuevoDepartamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el departamento" });
  }
};

exports.updateDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });
    const updated = await departamentoRepository.updateDepartamento(id, nombre);
    if (!updated) {
      return res.status(404).json({ message: "Departamento no encontrado" });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el departamento" });
  }
};

exports.deleteDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await departamentoRepository.deleteDepartamento(id);
    if (!deleted) {
      return res.status(404).json({ message: "Departamento no encontrado" });
    }
    res.status(200).json({ message: "Departamento eliminado", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el departamento" });
  }
};
