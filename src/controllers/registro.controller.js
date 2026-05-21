class RegistroController {
  constructor(registroService) {
    this.registroService = registroService;
  }

  datosParaGlucosa = async (req, res) => {
    try {
      const idPaciente = parseInt(req.params.idUsuario); // O req.params.idPaciente según tu ruta
      if (isNaN(idPaciente)) {
        return res.status(400).json({ error: 'El ID del paciente debe ser un número válido' });
      }

      const result = await this.registroService.getDatosParaGlucosa(idPaciente);

      if (result.error) {
        console.error({
          fecha: new Date().toISOString(),
          metodo: req.method,
          ip: req.ip,
          resultado: 'FALLIDO',
          motivo: result.error.message,
          codigo_supabase: result.error.code
        });
        return res.status(result.status || 500).json({ error: 'Error al consultar los datos del paciente', code: result.code });
      }

      if (result.notFound) {
        console.log({
          fecha: new Date().toISOString(),
          resultado: 'NO ENCONTRADO',
          mensaje: `No se encontró un paciente con el id: ${idPaciente}`
        });
        return res.status(404).json({ message: 'No se encontraron datos para este paciente' });
      }

      console.log({
        fecha: new Date().toISOString(),
        metodo: req.method,
        ip: req.ip,
        resultado: 'EXITOSO',
        paciente_id: result.data.id_paciente
      });

      return res.status(200).json(result.data);

    } catch (err) {
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

  registrarAlerta = async (req, res) => {
    const { id_tipo_alerta, id_registro, id_medico, fecha_alerta } = req.body;

    if (!id_tipo_alerta || !id_registro || !id_medico || !fecha_alerta) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
      const alertaInsertada = await this.registroService.registrarAlertaAndEmail({
        id_tipo_alerta,
        id_registro,
        id_medico,
        fecha_alerta
      });

      res.status(200).json({
        message: 'Alerta registrada y correo enviado correctamente',
        alerta: alertaInsertada
      });

    } catch (err) {
      console.error('Error al insertar alerta:', err.message);
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = RegistroController;
