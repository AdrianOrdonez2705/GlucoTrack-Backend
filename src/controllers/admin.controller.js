class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  _handleError(res, req, error, actionMessage) {
    const rutaOriginal = req.originalUrl || req.path;
    
    if (error.status && error.status >= 400 && error.status < 500) {
      return res.status(error.status).json({ 
        error: error.message || 'Error de cliente', 
        code: error.code || undefined 
      });
    }

    if (error.dbCode) {
      console.error({
        fecha: new Date().toISOString(),
        endpoint: rutaOriginal,
        metodo: req.method,
        ip: req.ip,
        resultado: 'FALLIDO',
        motivo: error.message,
        codigo_supabase: error.dbCode,
        detalles: error.details
      });
      return res.status(error.status || 500).json({ 
        error: error.message || actionMessage, 
        code: error.code || 'DB_QUERY_ERROR' 
      });
    }

    console.error({
      fecha: new Date().toISOString(),
      endpoint: rutaOriginal,
      metodo: req.method,
      ip: req.ip,
      resultado: 'CRÍTICO',
      motivo: error.message,
      stack: error.stack 
    });
    return res.status(error.status || 500).json({ 
      error: error.status === 500 ? 'Error interno inesperado del servidor' : (error.message || 'Error interno del servidor'),
      code: error.status === 500 ? 'INTERNAL_SERVER_ERROR' : undefined,
      detalles: error.status !== 500 ? error.message : undefined
    });
  }

  medicosActivos = async (req, res) => {
    try {
      const data = await this.adminService.obtenerMedicosActivos();
      const rutaOriginal = req.originalUrl || '/api/medicos-activos';
      if (data.length === 0) {
        console.log({
          fecha: new Date().toISOString(),
          endpoint: rutaOriginal,
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          mensaje: 'Consulta ejecutada, pero no hay médicos activos.'
        });
      } else {
        console.log({
          fecha: new Date().toISOString(),
          endpoint: rutaOriginal,
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          registros_obtenidos: data.length
        });
      }
      return res.status(200).json(data);
    } catch (error) {
      this._handleError(res, req, error, 'Error al consultar los médicos');
    }
  };

  medicosSolicitantes = async (req, res) => {
    try {
      const data = await this.adminService.obtenerMedicosSolicitantes();
      const rutaOriginal = req.originalUrl || '/api/medicos-solicitantes';
      if (data.length === 0) {
        console.log({
          fecha: new Date().toISOString(),
          endpoint: rutaOriginal,
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          mensaje: 'Consulta ejecutada, pero no hay médicos solicitantes pendientes.'
        });
      } else {
        console.log({
          fecha: new Date().toISOString(),
          endpoint: rutaOriginal,
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          registros_obtenidos: data.length
        });
      }
      return res.status(200).json(data);
    } catch (error) {
      this._handleError(res, req, error, 'Error al consultar los médicos solicitantes');
    }
  };

  activarMedico = async (req, res) => {
    try {
      const { idMedico } = req.params;
      const { idAdmin } = req.body;
      console.log('BODY:', req.body);
      console.log('PARAMS:', req.params);
      const resultado = await this.adminService.activarMedico(idMedico, idAdmin);
      return res.json(resultado);
    } catch (error) {
      if (!error.status) error.status = 500;
      return res.status(error.status).json({ 
        error: error.status === 500 ? 'Error del servidor' : error.message, 
        detalles: error.status === 500 ? error.message : undefined 
      });
    }
  };

  pacientesActivos = async (req, res) => {
    try {
      const data = await this.adminService.obtenerPacientesActivos();
      const rutaOriginal = req.originalUrl || '/api/pacientes-activos';
      if (data.length === 0) {
        console.log({
          fecha: new Date().toISOString(),
          endpoint: rutaOriginal,
          metodo: req.method,
          resultado: 'EXITOSO',
          mensaje: 'No hay pacientes activos.'
        });
      } else {
        console.log({
          fecha: new Date().toISOString(),
          endpoint: rutaOriginal,
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          registros_obtenidos: data.length
        });
      }
      return res.status(200).json(data);
    } catch (error) {
      this._handleError(res, req, error, 'Error al consultar los pacientes');
    }
  };

  pacientesSolicitantes = async (req, res) => {
    try {
      const data = await this.adminService.obtenerPacientesSolicitantes();
      const rutaOriginal = req.originalUrl || '/api/pacientes-solicitantes';
      if (data.length === 0) {
        console.log({
          fecha: new Date().toISOString(),
          endpoint: rutaOriginal,
          metodo: req.method,
          resultado: 'EXITOSO',
          mensaje: 'No hay pacientes solicitantes pendientes.'
        });
      } else {
        console.log({
          fecha: new Date().toISOString(),
          endpoint: rutaOriginal,
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          registros_obtenidos: data.length
        });
      }
      return res.status(200).json(data);
    } catch (error) {
      this._handleError(res, req, error, 'Error al consultar los pacientes solicitantes');
    }
  };

  activarPaciente = async (req, res) => {
    try {
      const { idPaciente } = req.params;
      const { idAdmin } = req.body;
      const resultado = await this.adminService.activarPaciente(idPaciente, idAdmin);
      return res.json(resultado);
    } catch (error) {
      if (!error.status) error.status = 500;
      return res.status(error.status).json({ 
        error: error.status === 500 ? 'Error del servidor' : error.message, 
        detalles: error.status === 500 ? error.message : undefined 
      });
    }
  };

  perfilAdmin = async (req, res) => {
    try {
      const idUsuario = parseInt(req.params.idUsuario);
      const data = await this.adminService.obtenerPerfilAdmin(idUsuario);
      console.log({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'EXITOSO',
        admin_id: data.id
      });
      return res.status(200).json(data);
    } catch (error) {
      if (error.status === 404) {
        console.log({
          fecha: new Date().toISOString(),
          resultado: 'NO ENCONTRADO',
          mensaje: `No se encontró un administrador con el id_usuario: ${req.params.idUsuario}`
        });
        return res.status(404).json({ message: error.message });
      }
      this._handleError(res, req, error, 'Error al consultar el perfil del administrador');
    }
  };

  agregarAdmin = async (req, res) => {
    try {
      const resultado = await this.adminService.agregarAdmin(req.body);
      return res.status(200).json(resultado);
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({ error: error.message });
      }
      console.error("Error al insertar los datos: ", error.message);
      return res.status(500).json({ error: error.message });
    }
  };

  obtenerAdmins = async (req, res) => {
    try {
      const idAdmin = parseInt(req.params.idAdmin);
      const data = await this.adminService.obtenerAdminsVisibles(idAdmin);
      if (data.length === 0) {
        console.log({
          fecha: new Date().toISOString(),
          metodo: req.method,
          resultado: 'EXITOSO',
          mensaje: 'Consulta ejecutada, pero no hay otros administradores visibles.'
        });
      } else {
        console.log({
          fecha: new Date().toISOString(),
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          registros_obtenidos: data.length
        });
      }
      return res.status(200).json(data);
    } catch (error) {
      this._handleError(res, req, error, 'Error al consultar los administradores visibles');
    }
  };
}

module.exports = AdminController;