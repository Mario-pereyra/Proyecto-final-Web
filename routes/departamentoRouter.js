const express = require("express");
const router = express.Router();
const departamentoController = require("../controllers/departamentoController");

// GET /api/departamentos
router.get("/", departamentoController.getDepartamentos);
// GET /api/departamentos/:departamentoId/ciudades
router.get(
  "/:departamentoId/ciudades",
  departamentoController.getCiudadesByDepartamento
);

module.exports = router;
