const express = require('express');
const router = express.Router();
const multer = require('multer');

const supabase = require('../../database');
const MedicoRepository = require('../repositories/medico.repository');
const MedicoService = require('../services/medico.service');
const MedicoController = require('../controllers/medico.controller');

const repo = new MedicoRepository(supabase);
const service = new MedicoService(repo);
const controller = new MedicoController(service);

const auditoriaMedico = require("../middlewares/auditoria.medico");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/registrar', upload.fields([
  { name: "matriculaProfesional", maxCount: 1 },
  { name: "carnetProfesional", maxCount: 1 },
]), controller.registrarMedico);

router.post('/responder/alerta', auditoriaMedico, controller.retroalimentacionAlerta);
router.post('/registrar/glucosa', auditoriaMedico, controller.registrarGlucosaMedico);
router.get('/perfil/:idUsuario', auditoriaMedico, controller.perfilMedico);
router.get('/ver', controller.verMedicos);
router.get('/misPacientes/:idMedico', auditoriaMedico, controller.verPacientes);
router.get('/alertasActivas/:idMedico', auditoriaMedico, controller.alertasActivas);
router.get('/alertasResueltas/:idMedico', auditoriaMedico, controller.alertasResueltas);
router.put('/actualizar/:id_medico', auditoriaMedico, upload.single('carnet'), controller.actualizarMedico);

module.exports = router;
