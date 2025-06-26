const anunciosGuardadosRepository = require('../repositories/anunciosGuardadosRepository');

exports.getAnunciosGuardadosPorUsuario = async (req, res) => {
  const usuarioId = req.params.usuarioId;
  if (!usuarioId || isNaN(usuarioId)) {
    return res.status(400).json({ message: 'UsuarioId inválido' });
  }
  try {
    const anuncios = await anunciosGuardadosRepository.getAnunciosGuardadosPorUsuario(usuarioId);
    return res.status(200).json(anuncios);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener anuncios guardados' });
  }
};

exports.guardarAnuncio = async (req, res) => {
  const { usuarioId, anuncioId } = req.body;
  if (!usuarioId || !anuncioId || isNaN(usuarioId) || isNaN(anuncioId)) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }
  try {
    const result = await anunciosGuardadosRepository.guardarAnuncio(usuarioId, anuncioId);
    if (result) {
      return res.status(201).json({ message: 'Anuncio guardado correctamente' });
    } else {
      return res.status(409).json({ message: 'El anuncio ya estaba guardado o no se pudo guardar' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al guardar anuncio' });
  }
};

exports.eliminarAnuncioGuardado = async (req, res) => {
  const { usuarioId, anuncioId } = req.body;
  if (!usuarioId || !anuncioId || isNaN(usuarioId) || isNaN(anuncioId)) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }
  try {
    const result = await anunciosGuardadosRepository.eliminarAnuncioGuardado(usuarioId, anuncioId);
    if (result) {
      return res.status(200).json({ message: 'Anuncio eliminado de guardados' });
    } else {
      return res.status(404).json({ message: 'No se encontró el anuncio guardado' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar anuncio guardado' });
  }
};
