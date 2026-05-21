const express = require('express');
const router = express.Router();

const supabase = require('../../database');
const GeneralRepository = require('../repositories/general.repository');
const GeneralService = require('../services/general.service');
const GeneralController = require('../controllers/general.controller');

// Inicialización de Dependencias (DI simple)
const generalRepository = new GeneralRepository(supabase);
const generalService = new GeneralService(generalRepository);
const generalController = new GeneralController(generalService);

router.get('/momentos', generalController.verMomentos);
router.get('/niveles', generalController.verNiveles);
router.get('/enfermedades', generalController.verEnfermedades);
router.get('/tratamientos', generalController.verTratamientos);
router.get('/especialidades', generalController.verEspecialidades);
router.get('/auditoria', generalController.verAuditoria);

module.exports = router;