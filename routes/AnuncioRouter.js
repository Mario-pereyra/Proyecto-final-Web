const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const AnuncioController = require("../controllers/AnuncioController");

const uploadDirectory = process.env.UPLOADS_PATH || "uploads/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET /api/anuncios/mas-vistos (debe ir antes de las rutas dinámicas)
router.get("/mas-vistos", AnuncioController.getAnunciosMasVistos);

// GET /api/anuncios/vendedor/:usuarioId
router.get("/vendedor/:usuarioId", AnuncioController.getAnunciosByVendedor);

//GET /api/anuncios/buscar?categoria=Laptops%20y%20Computadoras&precioMax=1000
router.get("/buscar", AnuncioController.buscarAnuncios);

//GET /api/anuncios/con-imagenes
router.get("/con-imagenes", AnuncioController.getAnunciosConImagenes);

// PUT /api/anuncios/:anuncioId/con-imagenes 
router.put("/:anuncioId/con-imagenes", upload.array("images[]", 4), AnuncioController.updateAnuncioConImagenes
);
// PATCH /api/anuncios/:anuncioId/estado-publicacion
router.patch("/:anuncioId/estado-publicacion", AnuncioController.updateEstadoPublicacion
);
// PATCH /api/anuncios/:anuncioId/vendedor/:usuarioId/estado
router.patch("/:anuncioId/vendedor/:usuarioId/estado", AnuncioController.updateEstadoAnuncioVendedor
);
// PATCH /api/anuncios/:anuncioId/incrementar-vistas
router.patch("/:anuncioId/incrementar-vistas", AnuncioController.incrementarVistas);

// GET /api/anuncios/
router.get("/", AnuncioController.getAnunciosConImagenes);
// GET /api/anuncios/1
router.get("/:anuncioId", AnuncioController.getAnuncioById);

//GET /api/anuncios/:anuncioId/con-imagenes
router.get("/:anuncioId/con-imagenes",AnuncioController.getAnuncioConImagenesById);

// PUT /api/anuncios/
router.put("/:anuncioId", AnuncioController.updateAnuncio);
// DELETE /api/anuncios/:anuncioId (elimina anuncio y sus imágenes asociadas)
router.delete("/:anuncioId", AnuncioController.deleteAnuncioConImagenes);
// DELETE /api/anuncios/:anuncioId/vendedor/:usuarioId
router.delete("/:anuncioId/vendedor/:usuarioId", AnuncioController.deleteAnuncioVendedor);

// POST /api/anuncios/ (con imágenes)
router.post("/", upload.array("images[]", 4),AnuncioController.createAnuncioConImagenes);

module.exports = router;
