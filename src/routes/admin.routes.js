const express = require('express');
const router = express.Router();

const {pacientesActivos, pacientesSolicitantes,activarPaciente,medicosActivos,medicosSolicitantes, activarMedico,
    perfilAdmin,agregarAdmin,obtenerAdmins}=require('../controllers/admin.controller');

router.post('/agregar',agregarAdmin);

router.get('/pacientes/activos',pacientesActivos);
router.get('/pacientes/solicitantes',pacientesSolicitantes)
router.get('/obtenerAdmins/:idAdmin',obtenerAdmins);
router.put('/paciente/activar/:idPaciente',activarPaciente)


router.get('/medicos/activos', medicosActivos);
router.get('/medicos/solicitantes',medicosSolicitantes);
router.get('/perfilAdmin/:idUsuario',perfilAdmin)
router.put('/medico/activar/:idMedico', activarMedico);


module.exports = router;

