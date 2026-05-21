const bcrypt = require('bcrypt');

class PacienteService {
  constructor(pacienteRepository) {
    this.pacienteRepository = pacienteRepository;
  }

  async registrarPaciente(data, file) {
    const {
      nombre_completo, correo, contrasena, rol, fecha_nac,
      id_medico, id_actividad, genero, peso, altura,
      enfermedad_id, tratamiento_id, dosis_,
      nombre_emergencia, numero_emergencia,
      embarazada, semanas, teléfono
    } = data;

    if (!file) {
      throw { status: 400, message: "Archivo de perfil faltante" };
    }

    if (!nombre_completo || !correo || !contrasena || !rol || !fecha_nac || !teléfono || !id_medico
        || !id_actividad || !genero || !peso || !altura || !enfermedad_id || !tratamiento_id
        || !dosis_ || !nombre_emergencia || !numero_emergencia) {
      throw { status: 400, message: 'Todos los campos obligatorios deben ser llenados' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Upload image
    const filename = `${Date.now()}_${file.originalname}`;
    const imgUrl = await this.pacienteRepository.uploadProfileImage(filename, file.buffer, file.mimetype);

    const id_medicoInt = parseInt(id_medico);
    const id_actividadInt = parseInt(id_actividad);
    const enfermedad_idInt = parseInt(enfermedad_id);
    const tratamiento_idInt = parseInt(tratamiento_id);
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const embarazadaBool = embarazada === 'true' || embarazada === true;
    const semanasInt = semanas ? parseInt(semanas) : null;

    const usuario_insertado = await this.pacienteRepository.insertUsuario({
      nombre_completo,
      correo,
      contrasena: hashedPassword,
      rol,
      fecha_nac,
      teléfono
    });

    const paciente = await this.pacienteRepository.insertPaciente({
      id_usuario: usuario_insertado.id_usuario,
      id_medico: id_medicoInt,
      id_nivel_actividad: id_actividadInt,
      genero,
      peso: pesoNum,
      altura: alturaNum,
      embarazo: embarazadaBool,
      nombre_emergencia,
      numero_emergencia,
      foto_perfil: imgUrl
    });

    if (embarazadaBool && semanasInt !== null) {
      await this.pacienteRepository.insertSeguimientoEmbarazo({
        id_paciente: paciente.id_paciente,
        fecha_registro: usuario_insertado.fecha_registro,
        semanas_embarazo: semanasInt
      });
    }

    await this.pacienteRepository.insertTratamientoEnfermedad({
      id_paciente: paciente.id_paciente,
      id_tratamiento: tratamiento_idInt,
      dosis: dosis_
    });

    await this.pacienteRepository.insertPacienteEnfermedad({
      id_paciente: paciente.id_paciente,
      id_enfermedad: enfermedad_idInt
    });

    return { usuario_insertado, paciente };
  }

  async perfilPaciente(idPacienteStr) {
    const idPaciente = parseInt(idPacienteStr);
    if (isNaN(idPaciente)) {
      throw { status: 400, message: 'El ID del paciente debe ser un número válido' };
    }

    const { data, error, status } = await this.pacienteRepository.findPerfilById(idPaciente);

    if (error) {
      throw { status: status || 500, message: 'Error al consultar el perfil del paciente', code: 'DB_QUERY_ERROR', details: error };
    }

    if (!data) {
      throw { status: 404, message: 'No se encontró el paciente solicitado' };
    }

    const formatearFecha = (fechaString) => {
      if (!fechaString) return null;
      const partes = fechaString.split('T')[0].split('-'); 
      if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
      return fechaString;
    };

    const afeccionesList = data.paciente_enfermedad 
      ? data.paciente_enfermedad.map(pe => pe.enfermedades_base?.nombre_enfermedad)
      : [];

    const tratamientosList = data.tratamiento_enfermedad
      ? data.tratamiento_enfermedad.map(te => ({
          titulo: te.tratamientos?.nombre_tratamiento || '',
          descripcion: te.tratamientos?.descripcion || '',
          dosis: te.dosis ? String(te.dosis) : null
        }))
      : [];

    let semanasEmbarazoActual = null;
    let fechaRegistroEmbarazo = null;

    if (data.embarazo && data.seguimiento_embarazo && data.seguimiento_embarazo.length > 0) {
      const embarazosOrdenados = [...data.seguimiento_embarazo].sort((a, b) => {
        const aActivo = a.fecha_terminacion === null ? 0 : 1;
        const bActivo = b.fecha_terminacion === null ? 0 : 1;
        
        if (aActivo !== bActivo) return aActivo - bActivo;
        return new Date(b.fecha_registro) - new Date(a.fecha_registro);
      });

      const embarazoPrincipal = embarazosOrdenados[0];
      semanasEmbarazoActual = embarazoPrincipal.semanas_embarazo;
      fechaRegistroEmbarazo = embarazoPrincipal.fecha_registro;
    }

    return {
      nombre: data.usuario?.nombre_completo || 'Sin nombre',
      id: data.usuario?.id_usuario ? String(data.usuario.id_usuario) : null,
      fechaNac: formatearFecha(data.usuario?.fecha_nac),
      genero: data.genero || null,
      altura: data.altura || null,
      peso: data.peso || null,
      telefono: data.usuario?.teléfono || null,
      correo: data.usuario?.correo || null,
      nombre_emergencia: data.nombre_emergencia || null,
      numero_emergencia: data.numero_emergencia || null,
      foto_perfil: data.foto_perfil || null,
      nombre_medico: data.medico?.usuario?.nombre_completo || null,
      fecha_registro: data.usuario?.fecha_registro || null,
      admitidoPor: data.administrador?.usuario?.nombre_completo || null,
      actividadFisica: {
        nivel: data.nivel_actividad_fisica?.descripcion || null,
        descripcion: data.nivel_actividad_fisica?.descripcion || null
      },
      afecciones: afeccionesList,
      tratamientos: tratamientosList,
      embarazo: data.embarazo || false,
      semanas_embarazo: semanasEmbarazoActual,
      registro_embarazo: fechaRegistroEmbarazo
    };
  }

  async registrosPaciente(idPacienteStr) {
    const idPaciente = parseInt(idPacienteStr);
    if (isNaN(idPaciente)) {
      throw { status: 400, message: 'El ID del paciente debe ser un número válido' };
    }

    const { data, error, status } = await this.pacienteRepository.findRegistrosGlucosa(idPaciente);

    if (error) {
      throw { status: status || 500, message: 'Error al consultar los registros del paciente', code: 'DB_QUERY_ERROR', details: error };
    }

    if (!data || data.length === 0) {
      return [];
    }

    const formatearHora = (horaString) => {
      if (!horaString) return null;
      return horaString.substring(0, 5);
    };

    return data.map(r => {
      const alerta = Array.isArray(r.alertas) ? r.alertas[0] : r.alertas;
      const tipoAlerta = alerta ? (Array.isArray(alerta.tipo_alerta) ? alerta.tipo_alerta[0] : alerta.tipo_alerta) : null;
      const retro = alerta ? (Array.isArray(alerta.retroalimentacion) ? alerta.retroalimentacion[0] : alerta.retroalimentacion) : null;

      return {
        id: r.id_registro,
        fecha: r.fecha, 
        hora: formatearHora(r.hora),
        nivelGlucosa: r.nivel_glucosa ? Number(r.nivel_glucosa) : null,
        momentoDia: r.momento_dia?.momento || null,
        quienTomoMuestra: r.medico?.usuario?.nombre_completo || null,
        observaciones: r.observaciones || null,
        idAlerta: alerta?.id_alerta || null,
        tipo_alerta: tipoAlerta?.tipo || null,
        respuesta: retro?.mensaje || null
      };
    });
  }

  async registrarGlucosa(data) {
    const { fecha, hora, id_momento, id_paciente, nivel_glucosa, observaciones } = data;

    if (!fecha || !hora  || !id_momento || !id_paciente || !nivel_glucosa) {
      throw { status: 400, message: "Todos los campos (menos observaciones) deben estar llenados" };
    }

    const registro = await this.pacienteRepository.insertRegistroGlucosa({
      id_paciente, id_momento, fecha, hora, nivel_glucosa, observaciones
    });

    return {
      registro_glucosa: registro
    };
  }

  async actualizarPaciente(id_usuarioStr, data) {
    const id_usuario = parseInt(id_usuarioStr);
    const {
      nombre, altura, peso, telefono, correo, embarazo,
      fecha_terminacion, semanas_embarazo, nombre_emergencia, numero_emergencia
    } = data;

    if (!nombre || altura == null || !peso || !telefono || !correo || !nombre_emergencia || !numero_emergencia) {
      throw { status: 400, message: 'Faltan datos obligatorios' };
    }

    const pacienteData = await this.pacienteRepository.findPacienteByIdUsuario(id_usuario);
    if (!pacienteData) {
      throw { status: 404, message: 'Paciente no encontrado' };
    }
    const id_paciente = pacienteData.id_paciente;

    const usuarioActualizado = await this.pacienteRepository.updateUsuario(id_usuario, {
      nombre_completo: nombre, correo, teléfono: telefono
    });

    const pacienteActualizado = await this.pacienteRepository.updatePaciente(id_usuario, {
      altura, peso: parseFloat(peso),
      embarazo: embarazo !== undefined ? embarazo : undefined,
      nombre_emergencia, numero_emergencia
    });

    if (embarazo === true && semanas_embarazo > 0) {
      await this.pacienteRepository.insertSeguimientoEmbarazo({
        id_paciente,
        fecha_registro: new Date().toISOString().split('T')[0],
        semanas_embarazo,
        fecha_terminacion: null
      });
    } else if (embarazo === false && fecha_terminacion) {
      const seguimientosActivos = await this.pacienteRepository.getSeguimientoActivo(id_paciente);
      if (seguimientosActivos && seguimientosActivos.length > 0) {
        await this.pacienteRepository.updateSeguimientoEmbarazo(
          seguimientosActivos[0].id_seguimiento,
          { fecha_terminacion }
        );
      }
    }

    return { usuario: usuarioActualizado, paciente: pacienteActualizado };
  }

  async obtenerSemanasEmbarazoActual(id_paciente) {
    const dataPaciente = await this.pacienteRepository.findEmbarazoStatus(id_paciente);
    
    if (dataPaciente.embarazo === true) {
      const dataEmbarazo = await this.pacienteRepository.findUltimoSeguimientoActivo(id_paciente);

      if (!dataEmbarazo || dataEmbarazo.length === 0) {
        return { semanas_actuales: null };
      }

      const registro = dataEmbarazo[0];
      const fechaRegistro = new Date(registro.fecha_registro);
      const semanasIniciales = registro.semanas_embarazo;

      const hoy = new Date();
      const diferenciaDias = Math.floor((hoy - fechaRegistro) / (1000 * 60 * 60 * 24));
      const semanasActuales = semanasIniciales + Math.floor(diferenciaDias / 7);

      return { semanas_actuales: semanasActuales };
    } else {
      return { semanas_actuales: null };
    }
  }
}

module.exports = PacienteService;
