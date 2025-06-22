const categoriaRepository = require('../repositories/categoriaRepository');

exports.getCategorias = async (req, res) => {
    try {
        const categorias = await categoriaRepository.getCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las categorías' });
    }
};

exports.getSubcategoriasByCategoria = async (req, res) => {
    const categoriaId = req.params.categoriaId;
    try {
        const subcategorias = await categoriaRepository.getSubcategoriasByCategoria(categoriaId);
        res.status(200).json(subcategorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las subcategorías' });
    }
};
