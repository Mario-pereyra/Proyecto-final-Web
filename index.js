require('dotenv').config();

const express = require('express');

const port = process.env.PORT || 3001

const app = express();
app.use(express.json());
app.use(express.static('public'));

const usuarioRouter = require('./routes/usuarioRouter')

app.use('/api/usuario',usuarioRouter)

app.listen(port, () => {
    console.log(`El servidor corre en el puerto ${port}`); //cargar variable de entorno
});

