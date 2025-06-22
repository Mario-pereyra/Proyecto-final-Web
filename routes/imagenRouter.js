const express = require('express');
const router = express.Router();
const multer = require('multer');
const path   = require('path')

const anuncioController = require('../controllers/AnuncioController');

// const imagenController = require('../controllers/imagenController');

// const uploadDirectory = process.env.UPLOADS_PATH

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDirectory); // Carpeta donde se guardarán las imágenes
//     },
//     filename: (req, file, cb) => {
//         // Renombra el archivo para evitar conflictos
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
// });



// const upload = multer({ storage: storage });


// GET /api/imagenes/:imagenId




module.exports = router;