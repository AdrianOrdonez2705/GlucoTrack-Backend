class MedicoController {
  constructor(medicoService) {
    this.medicoService = medicoService;
  }

  registrarMedico = async (req, res) => {
    try {
      const result = await this.medicoService.registrarMedico(req.body, req.files);
      res.status(200).json({ 
        mensaje: "Médico registrado correctamente", 
        usuario: result.usuario, 
        medico: result.medico 
      });
    } catch (error) {
      console.error("❌ Error en registrarMedico:", error);
      if (error.message === "Archivo de matrícula faltante" || error.message === "Archivo de carnet faltante") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  verMedicos = async (req, res) => {
    try {
      const data = await this.medicoService.verMedicos();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error al obtener médicos:', error.message);
      res.status(500).json({ error: 'Error al obtener médicos' });
    }
  };

  perfilMedico = async (req, res) => {
    try {
      const idUsuario = parseInt(req.params.idUsuario);
      if (isNaN(idUsuario)) {
        return res.status(400).json({ error: 'El ID de usuario debe ser un número válido' });
      }

      const medicoFormateado = await this.medicoService.perfilMedico(idUsuario);

      console.log({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'EXITOSO',
        medico_id: medicoFormateado.id
      });

      return res.status(200).json(medicoFormateado);

    } catch (err) {
      if (err.status === 404) {
        console.log({
          fecha: new Date().toISOString(),
          resultado: 'NO ENCONTRADO',
          mensaje: err.message
        });
        return res.status(404).json({ message: err.message });
      }

      if (err.code === 'DB_QUERY_ERROR') {
        console.error({
          fecha: new Date().toISOString(),
          metodo: req.method,
          ip: req.ip,
          resultado: 'FALLIDO',
          motivo: err.message,
          codigo_supabase: err.originalError?.code
        });
        return res.status(err.status || 500).json({ error: 'Error al consultar el perfil del médico', code: 'DB_QUERY_ERROR' });
      }

      console.error({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'CRÍTICO',
        motivo: err.message,
        stack: err.stack
      });

      return res.status(500).json({ error: 'Error interno del servidor', code: 'INTERNAL_SERVER_ERROR' });
    }
  };

  verPacientes = async (req, res) => {
    try {
      const idMedico = parseInt(req.params.idMedico);
      if (isNaN(idMedico)) {
        return res.status(400).json({ error: 'El ID del médico debe ser un número válido' });
      }

      const pacientesFormateados = await this.medicoService.verPacientes(idMedico);

      console.log({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'EXITOSO',
        medico_id: idMedico,
        pacientes_encontrados: pacientesFormateados.length
      });

      return res.status(200).json(pacientesFormateados);

    } catch (err) {
      if (err.code === 'DB_QUERY_ERROR') {
        console.error({
          fecha: new Date().toISOString(),
          metodo: req.method,
          ip: req.ip,
          resultado: 'FALLIDO',
          motivo: err.message,
          codigo_supabase: err.originalError?.code
        });
        return res.status(err.status || 500).json({ error: 'Error al consultar pacientes', code: 'DB_QUERY_ERROR' });
      }

      console.error({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'CRÍTICO',
        motivo: err.message,
        stack: err.stack
      });
      return res.status(500).json({ error: 'Error interno del servidor', code: 'INTERNAL_SERVER_ERROR' });
    }
  };

  alertasActivas = async (req, res) => {
    try {
      const idMedico = parseInt(req.params.idMedico);
      if (isNaN(idMedico)) {
        return res.status(400).json({ error: 'El ID del médico debe ser un número válido' });
      }

      const alertasFormateadas = await this.medicoService.alertasActivas(idMedico);

      if (alertasFormateadas.length === 0) {
        console.log({
          fecha: new Date().toISOString(),
          metodo: req.method,
          resultado: 'EXITOSO',
          mensaje: 'No hay alertas activas para este médico.'
        });
      } else {
        console.log({
          fecha: new Date().toISOString(),
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          medico_id: idMedico,
          alertas_encontradas: alertasFormateadas.length
        });
      }

      return res.status(200).json(alertasFormateadas);

    } catch (err) {
      if (err.code === 'DB_QUERY_ERROR') {
        console.error({
          fecha: new Date().toISOString(),
          metodo: req.method,
          ip: req.ip,
          resultado: 'FALLIDO',
          motivo: err.message,
          codigo_supabase: err.originalError?.code
        });
        return res.status(err.status || 500).json({ error: 'Error al consultar las alertas', code: 'DB_QUERY_ERROR' });
      }

      console.error({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'CRÍTICO',
        motivo: err.message,
        stack: err.stack
      });
      return res.status(500).json({ error: 'Error interno del servidor', code: 'INTERNAL_SERVER_ERROR' });
    }
  };

  alertasResueltas = async (req, res) => {
    try {
      const idMedico = parseInt(req.params.idMedico);
      if (isNaN(idMedico)) {
        return res.status(400).json({ error: 'El ID del médico debe ser un número válido' });
      }

      const alertasFormateadas = await this.medicoService.alertasResueltas(idMedico);

      if (alertasFormateadas.length === 0) {
        console.log({
          fecha: new Date().toISOString(),
          metodo: req.method,
          resultado: 'EXITOSO',
          mensaje: 'No hay alertas resueltas para este médico.'
        });
      } else {
        console.log({
          fecha: new Date().toISOString(),
          metodo: req.method,
          ip: req.ip,
          resultado: 'EXITOSO',
          medico_id: idMedico,
          alertas_encontradas: alertasFormateadas.length
        });
      }

      return res.status(200).json(alertasFormateadas);

    } catch (err) {
      if (err.code === 'DB_QUERY_ERROR') {
        console.error({
          fecha: new Date().toISOString(),
          metodo: req.method,
          ip: req.ip,
          resultado: 'FALLIDO',
          motivo: err.message,
          codigo_supabase: err.originalError?.code
        });
        return res.status(err.status || 500).json({ error: 'Error al consultar las alertas resueltas', code: 'DB_QUERY_ERROR' });
      }

      console.error({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'CRÍTICO',
        motivo: err.message,
        stack: err.stack
      });
      return res.status(500).json({ error: 'Error interno del servidor', code: 'INTERNAL_SERVER_ERROR' });
    }
  };

  retroalimentacionAlerta = async (req, res) => {
    try {
      const result = await this.medicoService.retroalimentacionAlerta(req.body);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error al responder alerta:', err.message);
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  };

  registrarGlucosaMedico = async (req, res) => {
    try {
      const result = await this.medicoService.registrarGlucosaMedico(req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error al insertar los datos: ", error.message);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  actualizarMedico = async (req, res) => {
    try {
      const { id_medico } = req.params;
      const result = await this.medicoService.actualizarMedico(id_medico, req.body, req.file);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error al actualizar:', error);
      if (error.status === 404) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({
        message: 'Error al actualizar los datos',
        error: error.message
      });
    }
  };
}

module.exports = MedicoController;
