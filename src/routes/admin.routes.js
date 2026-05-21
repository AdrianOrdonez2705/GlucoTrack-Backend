const express = require('express');
const router = express.Router();

const supabase = require('../../database');
const AdminRepository = require('../repositories/admin.repository');
const AdminService = require('../services/admin.service');
const AdminController = require('../controllers/admin.controller');

const repo = new AdminRepository(supabase);
const service = new AdminService(repo);
const controller = new AdminController(service);

const auditoriaAdmin = require("../middlewares/auditoria.admin");

router.post('/agregar', auditoriaAdmin, controller.agregarAdmin);

router.get('/pacientes/activos', controller.pacientesActivos);
router.get('/pacientes/solicitantes', controller.pacientesSolicitantes);
router.get('/obtenerAdmins/:idAdmin', auditoriaAdmin, controller.obtenerAdmins);
router.put('/paciente/activar/:idPaciente', auditoriaAdmin, controller.activarPaciente);


router.get('/medicos/activos', controller.medicosActivos);
router.get('/medicos/solicitantes', controller.medicosSolicitantes);
router.get('/perfilAdmin/:idUsuario', auditoriaAdmin, controller.perfilAdmin);
router.put('/medico/activar/:idMedico', auditoriaAdmin, controller.activarMedico);

module.exports = router;
