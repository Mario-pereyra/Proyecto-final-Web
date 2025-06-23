const ciudadRepository = require("../repositories/ciudadRepository");

exports.getCiudades = async (req, res) => {
  try {
    const ciudades = await ciudadRepository.getCiudades();
    res.status(200).json(ciudades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las ciudades" });
  }
};

exports.getCiudadById = async (req, res) => {
  try {
    const { id } = req.params;
    const ciudad = await ciudadRepository.getCiudadById(id);
    if (!ciudad) {
      return res.status(404).json({ message: "Ciudad no encontrada" });
    }
    res.status(200).json(ciudad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la ciudad" });
  }
};

exports.createCiudad = async (req, res) => {
  try {
    const { nombre, departamentoId } = req.body;
    if (!nombre || !departamentoId) {
      return res.status(400).json({ message: "Nombre y departamentoId son obligatorios" });
    }
    const nuevaCiudad = await ciudadRepository.createCiudad(nombre, departamentoId);
    res.status(201).json(nuevaCiudad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la ciudad" });
  }
};

exports.updateCiudad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, departamentoId } = req.body;
    if (!nombre || !departamentoId) {
      return res.status(400).json({ message: "Nombre y departamentoId son obligatorios" });
    }
    const updated = await ciudadRepository.updateCiudad(id, nombre, departamentoId);
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la ciudad" });
  }
};

exports.deleteCiudad = async (req, res) => {
  try {
    const { id } = req.params;
    await ciudadRepository.deleteCiudad(id);
    res.status(200).json({ message: "Ciudad eliminada", ciudadId: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la ciudad" });
  }
};
