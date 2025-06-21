require('dotenv').config();

const express = require('express');

const port = process.env.PORT || 3001

const app = express();
app.use(express.json());
app.use(express.static('public'));

const usuarioRouter = require('./routes/usuarioRouter')
const AnuncioRouter = require('./routes/AnuncioRouter')
app.use('/api/usuario',usuarioRouter)
app.use('/api/anuncios',AnuncioRouter)

app.listen(port, () => {
    console.log(`El servidor corre en el puerto ${port}`); //cargar variable de entorno
});

