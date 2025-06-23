require('dotenv').config();

const express = require('express');

const port = process.env.PORT || 3001

const app = express();
app.use(express.json());
app.use(express.static('public'));

const usuarioRouter = require('./routes/usuarioRouter')
const AnuncioRouter = require('./routes/AnuncioRouter')
const imagenRouter = require('./routes/imagenRouter')
const categoriaRouter = require('./routes/categoriaRouter')
const departamentoRouter = require('./routes/departamentoRouter')
const chatRouter = require('./routes/chatRouter')

app.use('/api/usuario',usuarioRouter)
app.use('/api/anuncios',AnuncioRouter)
app.use('/api/imagenes',imagenRouter)
app.use('/api/categorias', categoriaRouter)
app.use('/api/departamentos', departamentoRouter)
app.use('/api/chat', chatRouter)

app.listen(port, () => {
    console.log(`El servidor corre en el puerto ${port}`); 
});

