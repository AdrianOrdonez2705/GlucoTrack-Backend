const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }  });

const auditoriaPaciente = require("../middlewares/auditoria.paciente");

const supabase = require('../../database');
const PacienteRepository = require('../repositories/paciente.repository');
const PacienteService = require('../services/paciente.service');
const PacienteController = require('../controllers/paciente.controller');

const repo = new PacienteRepository(supabase);
const service = new PacienteService(repo);
const controller = new PacienteController(service);

router.get('/perfil/:idPaciente', auditoriaPaciente, controller.perfilPaciente);
router.get('/registros/:idPaciente', auditoriaPaciente, controller.registrosPaciente);

router.post('/registrarGlucosa', auditoriaPaciente, controller.registrarGlucosa);
router.post('/registrarPaciente', upload.fields([
  { name: "foto_perfil", maxCount: 1 }
]), controller.registrarPaciente);

router.put('/actualizarPaciente/:id_usuario', auditoriaPaciente, controller.actualizarPaciente);

router.get('/obtenerDatosEmbarazo/:id_paciente', controller.obtenerSemanasEmbarazoActual);

/*
router.get('/activos',pacientesActivos);
router.get('/solicitantes',pacientesSolicitantes)

router.put('/activar/:idPaciente',activarPaciente)*/

module.exports = router;