const anuncioRepository = require('../repositories/anuncioRepository')

exports.getAnuncios = async (req, rep) => {
    
    try {
        const getAnunciosResultados = await anuncioRepository.getAnuncios()
        if(getAnunciosResultados.affectedRows > 0){
            return rep.status(201).json(getAnunciosResultados)
        }
        if(getAnunciosResultados.length === 0 || !getAnunciosResultados){
            return rep.status(401).json({message:"No se encontarron anuncio o no existen"})
        }
    } catch (error) {
        console.error(error)
        return rep.status(500).json({message: "Error al obtener todos los anuncios"})
    }


}
exports.getAnuncioById = async (req, rep) => {
    const anuncioId = req.params.anuncioId
    try {
        const getAnuncioByIdResultado = await anuncioRepository.getAnuncioById(anuncioId)
        if(getAnuncioByIdResultado.affectedRows >0){
            return rep.status(201).json(getAnuncioByIdResultado)
        }
        if(getAnuncioByIdResultado.length === 0 || !getAnuncioByIdResultado){
            return rep.status(401).json({message:`No se encontro el anuncio con el anuncio con el id ${anuncioId}`})
        }
    } catch (error) {
        console.error(error)
        return rep.status(500).json({message: "Error el anuncio "})
    }
}
exports.createAnuncio = async (req, rep) => {
    try {
        const createAnuncioResultado = await anuncioRepository.createAnuncio

    } catch (error) {
        console.error(error)
        return rep.status(500).json({message: "Error al crear el anuncio "})
    }
}
exports.updateAnuncio = async (req, rep) => {
    try {
        const updateAnuncioResultado = await anuncioRepository.updateAnuncio
    } catch (error) {
        console.error(error)
        return rep.status(500).json({message: "Error al actualizar el anuncio "})
    }
}
exports.deleteAnuncio = async (req, rep) => {
    const anuncioId = req.params.anuncioId
    try {
        const deleteAnuncioResultado = await anuncioRepository.deleteAnuncio(anuncioId)
        if(deleteAnuncioResultado.affectedRows > 0){
            return rep.status(201).json({message:`Se elimino con exito el anuncio con el id ${anuncioId} `})
        }
        if(deleteAnuncioResultado.affectedRows === 0){
            return rep.status(201).json({message:`Anuncio no encontrado no se elimino el anuncio con el id ${anuncioId} `})
        }
    } catch (error) {
        console.error(error)
        return rep.status(500).json({message: "Error al eliminar el anuncio "})
    }
}