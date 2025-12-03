const express = require('express');
const router = express.Router();
const multer=require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }  });

const {perfilPaciente,registrosPaciente,registrarGlucosa,registrarPaciente}=require('../controllers/paciente.controller');
router.get('/perfil/:idPaciente',perfilPaciente);
router.get('/registros/:idPaciente',registrosPaciente);

router.post('/registrarGlucosa',registrarGlucosa);
router.post('/registrarPaciente', upload.fields([
  { name: "foto_perfil", maxCount: 1 }
]),registrarPaciente);
/*
router.get('/activos',pacientesActivos);
router.get('/solicitantes',pacientesSolicitantes)

router.put('/activar/:idPaciente',activarPaciente)*/

module.exports=router;