require('dotenv').config();

const express = require('express');

const port = process.env.PORT || 3001

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const usuarioRouter = require('./routes/usuarioRouter')
const AnuncioRouter = require('./routes/AnuncioRouter')
const imagenRouter = require('./routes/imagenRouter')
const categoriaRouter = require('./routes/categoriaRouter')
const subcategoriaRouter = require('./routes/subcategoriaRouter')
const departamentoRouter = require('./routes/departamentoRouter')
const chatRouter = require('./routes/chatRouter')

const anunciosGuardadosRouter = require('./routes/anunciosGuardadosRouter')

const ciudadRouter = require('./routes/ciudadRouter')

app.use('/api/usuario',usuarioRouter)
app.use('/api/anuncios',AnuncioRouter)
app.use('/api/imagenes',imagenRouter)
app.use('/api/categorias', categoriaRouter)
app.use('/api/subcategorias', subcategoriaRouter)
app.use('/api/departamentos', departamentoRouter)
app.use('/api/chat', chatRouter)

app.use('/api/ciudades', ciudadRouter)

app.use('/api/anuncios_guardados', anunciosGuardadosRouter)

app.listen(port, () => {
    console.log(`El servidor y la pagina corre en el puerto ${port}`); 
});

