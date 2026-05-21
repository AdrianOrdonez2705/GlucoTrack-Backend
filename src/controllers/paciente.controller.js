class PacienteController {
  constructor(pacienteService) {
    this.pacienteService = pacienteService;
  }

  registrarPaciente = async (req, res) => {
    try {
      console.log("FILES LLEGAN:", req.files);
      console.log("BODY LLEGA:", req.body);
      
      const teléfono = req.body["teléfono"] || req.body["telÃ©fono"];
      const data = { ...req.body, teléfono };
      const file = req.files?.foto_perfil ? req.files.foto_perfil[0] : null;

      const result = await this.pacienteService.registrarPaciente(data, file);

      return res.status(200).json({
        message: 'Usuario y paciente registrados correctamente',
        usuario_insertado: result.usuario_insertado,
        paciente: result.paciente
      });
    } catch (error) {
      console.error("Error al insertar datos: ", error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  };

  perfilPaciente = async (req, res) => {
    try {
      const pacienteFormateado = await this.pacienteService.perfilPaciente(req.params.idPaciente);
      
      console.log({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'EXITOSO',
        paciente_id: req.params.idPaciente
      });

      return res.status(200).json(pacienteFormateado);
    } catch (error) {
      if (error.status) {
        if (error.details) {
          console.error({
            fecha: new Date().toISOString(),
            metodo: req.method,
            ip: req.ip,
            resultado: 'FALLIDO',
            motivo: error.details.message,
            codigo_supabase: error.details.code
          });
        }
        return res.status(error.status).json({ error: error.message, code: error.code });
      }
      console.error({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'CRÍTICO',
        motivo: error.message,
        stack: error.stack
      });
      return res.status(500).json({ error: 'Error interno del servidor', code: 'INTERNAL_SERVER_ERROR' });
    }
  };

  registrosPaciente = async (req, res) => {
    try {
      const registrosFormateados = await this.pacienteService.registrosPaciente(req.params.idPaciente);
      
      if (registrosFormateados.length === 0) {
        console.log({
          fecha: new Date().toISOString(),
          metodo: req.method,
          resultado: 'EXITOSO',
          mensaje: 'No hay registros de glucosa para este paciente.'
        });
      } else {
        console.log({
          fecha: new Date().toISOString(),
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          paciente_id: req.params.idPaciente,
          registros_obtenidos: registrosFormateados.length
        });
      }

      return res.status(200).json(registrosFormateados);
    } catch (error) {
      if (error.status) {
        if (error.details) {
          console.error({
            fecha: new Date().toISOString(),
            metodo: req.method,
            ip: req.ip,
            resultado: 'FALLIDO',
            motivo: error.details.message,
            codigo_supabase: error.details.code
          });
        }
        return res.status(error.status).json({ error: error.message, code: error.code });
      }
      console.error({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'CRÍTICO',
        motivo: error.message,
        stack: error.stack
      });
      return res.status(500).json({ error: 'Error interno del servidor', code: 'INTERNAL_SERVER_ERROR' });
    }
  };

  registrarGlucosa = async (req, res) => {
    try {
      const result = await this.pacienteService.registrarGlucosa(req.body);
      
      return res.status(200).json({
        message: "Registro insertado correctamente",
        id_registro: result.registro_glucosa.id || result.registro_glucosa.id_registro,
        registro_glucosa: result.registro_glucosa
      });
    } catch (error) {
      console.error("Error al insertar los datos: ", error.message || error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || 'Error al insertar los datos' });
    }
  };

  actualizarPaciente = async (req, res) => {
    try {
      const result = await this.pacienteService.actualizarPaciente(req.params.id_usuario, req.body);
      return res.json(result);
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Error al actualizar paciente', details: error });
    }
  };

  obtenerSemanasEmbarazoActual = async (req, res) => {
    try {
      const result = await this.pacienteService.obtenerSemanasEmbarazoActual(req.params.id_paciente);
      return res.json(result);
    } catch (error) {
      console.error("Error al obtener semanas de embarazo:", error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.status(500).json({ error: "Error al obtener semanas de embarazo" });
    }
  };
}

module.exports = PacienteController;