const express = require("express");
const router = express.Router();
const ciudadController = require("../controllers/ciudadController");


router.get("/", ciudadController.getCiudades);
router.get("/:id", ciudadController.getCiudadById);
router.post("/", ciudadController.createCiudad);
router.put("/:id", ciudadController.updateCiudad);
router.delete("/:id", ciudadController.deleteCiudad);

module.exports = router;
