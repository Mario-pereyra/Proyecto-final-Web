const express = require("express");
const router = express.Router();
const departamentoController = require("../controllers/departamentoController");


// Departamentos
router.get("/", departamentoController.getDepartamentos);
router.get("/:id", departamentoController.getDepartamentoById);
router.post("/", departamentoController.createDepartamento);
router.put("/:id", departamentoController.updateDepartamento);
router.delete("/:id", departamentoController.deleteDepartamento);

// Ciudades por departamento
router.get("/:departamentoId/ciudades",departamentoController.getCiudadesByDepartamento);

module.exports = router;
