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
