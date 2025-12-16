const express = require('express');
const router = express.Router();
const multer = require('multer');

// ✅ Definir storage en memoria


const { registrarMedico,verMedicos,medicosActivos,medicosSolicitantes,activarMedico, 
    perfilMedico, verPacientes, alertasActivas, alertasResueltas,retroalimentacionAlerta,
  registrarGlucosaMedico} = require('../controllers/medico.controller');
const auditoriaMedico=require("../middlewares/auditoria.medico")
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post('/registrar', upload.fields([
  { name: "matriculaProfesional", maxCount: 1 },
  { name: "carnetProfesional", maxCount: 1 },
]), registrarMedico);

router.post('/responder/alerta',auditoriaMedico,retroalimentacionAlerta);
router.post('/registrar/glucosa',auditoriaMedico,registrarGlucosaMedico)
router.get('/perfil/:idUsuario',auditoriaMedico,perfilMedico);
router.get('/ver', verMedicos);
router.get('/misPacientes/:idMedico',auditoriaMedico,verPacientes);
router.get('/alertasActivas/:idMedico',auditoriaMedico,alertasActivas);
router.get('/alertasResueltas/:idMedico',auditoriaMedico,alertasResueltas);



module.exports = router;
