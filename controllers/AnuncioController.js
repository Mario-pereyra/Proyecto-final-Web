const anuncioRepository = require('../repositories/anuncioRepository')

exports.getAnuncios = async (req, rep) => {
    try {
        const getAnunciosResultados = await anuncioRepository.getAnuncios();
        if (!getAnunciosResultados || getAnunciosResultados.length === 0) {
            return rep.status(404).json({ message: "No se encontraron anuncios" });
        }
        return rep.status(200).json(getAnunciosResultados);
    } catch (error) {
        console.error(error);
        return rep.status(500).json({ message: "Error al obtener todos los anuncios" });
    }
}
exports.getAnuncioById = async (req, rep) => {
    const anuncioId = req.params.anuncioId;
    try {
        const getAnunciosByIdResultado = await anuncioRepository.getAnuncioById(anuncioId);
        if (!getAnunciosByIdResultado || getAnunciosByIdResultado.length === 0) {
            return rep.status(404).json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
        }
        return rep.status(200).json(getAnunciosByIdResultado[0]);
    } catch (error) {
        console.error(error);
        return rep.status(500).json({ message: "Error al obtener el anuncio" });
    }
}
exports.createAnuncio = async (req, rep) => {
    const usuarioId = req.body.usuarioId
    const titulo = req.body.titulo
    const descripcion = req.body.descripcion
    const precio = req.body.precio
    const categoriaId = req.body.categoriaId
    const estado = req.body.estado
    const estado_publicacion = req.body.estado_publicacion
    const departamentoId = req.body.departamentoId
    const ciudadId = req.body.ciudadId
    const zona = req.body.zona
    const vistas = req.body.vistas
    const valoracion = req.body.valoracion

    try {
        const createAnuncioResultado = await anuncioRepository.createAnuncio(
            usuarioId, titulo, descripcion, precio, categoriaId, estado,
            estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion
        );
        if (!createAnuncioResultado || !createAnuncioResultado.insertId) {
            return rep.status(400).json({ message: "No se pudo crear el anuncio" });
        }
        return rep.status(201).json({
            message: "Anuncio creado exitosamente",
            anuncioId: createAnuncioResultado.insertId
        });
    } catch (error) {
        console.error(error);
        return rep.status(500).json({ message: "Error al crear el anuncio" });
    }
}
exports.updateAnuncio = async (req, rep) => {
    const anuncioId = req.params.anuncioId;
    const {

        titulo, descripcion, precio, categoriaId, estado,
        estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion
    } = req.body;

    try {
        const updateAnuncioResultado = await anuncioRepository.updateAnuncio(
            anuncioId, titulo, descripcion, precio, categoriaId, estado,
            estado_publicacion, departamentoId, ciudadId, zona, vistas, valoracion
        );
        if (!updateAnuncioResultado || updateAnuncioResultado.affectedRows === 0) {
            return rep.status(404).json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
        }
        return rep.status(200).json({ message: "Anuncio actualizado exitosamente" });
    } catch (error) {
        console.error(error);
        return rep.status(500).json({ message: "Error al actualizar el anuncio" });
    }
}
exports.deleteAnuncio = async (req, rep) => {
    const anuncioId = req.params.anuncioId;
    try {
        const deleteAnuncioResultado = await anuncioRepository.deleteAnuncio(anuncioId);
        if (!deleteAnuncioResultado || deleteAnuncioResultado.affectedRows === 0) {
            return rep.status(404).json({ message: `No se encontró el anuncio con el id ${anuncioId}` });
        }
        return rep.status(200).json({ message: `Se eliminó con éxito el anuncio con el id ${anuncioId}` });
    } catch (error) {
        console.error(error);
        return rep.status(500).json({ message: "Error al eliminar el anuncio" });
    }
}