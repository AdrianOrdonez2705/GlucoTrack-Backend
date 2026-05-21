const express = require('express');
const router = express.Router();

const supabase = require('../../database');
const RegistroRepository = require('../repositories/registro.repository');
const RegistroService = require('../services/registro.service');
const RegistroController = require('../controllers/registro.controller');
const auditoriaPaciente = require("../middlewares/auditoria.paciente");

// Inicialización de Dependencias (DI simple)
const registroRepository = new RegistroRepository(supabase);
const registroService = new RegistroService(registroRepository);
const registroController = new RegistroController(registroService);

router.get('/datosGlucosa/:idUsuario', registroController.datosParaGlucosa);

router.post('/registrarAlerta', auditoriaPaciente, registroController.registrarAlerta);

module.exports = router;