const bcrypt = require('bcrypt');

class MedicoService {
  constructor(medicoRepository) {
    this.medicoRepository = medicoRepository;
  }

  async registrarMedico(medicoData, files) {
    const { nombre_completo, correo, contrasena, telefono, fecha_nac, id_especialidad, departamento } = medicoData;

    const pdfFiles = files?.matriculaProfesional;
    const imgFiles = files?.carnetProfesional;

    if (!pdfFiles || pdfFiles.length === 0) {
      throw new Error("Archivo de matrícula faltante");
    }
    if (!imgFiles || imgFiles.length === 0) {
      throw new Error("Archivo de carnet faltante");
    }

    const pdf = pdfFiles[0];
    const img = imgFiles[0];

    const pdfUrl = await this.medicoRepository.uploadMatricula(pdf);
    const imgUrl = await this.medicoRepository.uploadCarnet(img);

    const hashed_contrasena = await bcrypt.hash(contrasena, 10);
    const rol = 'medico';

    const usuario = await this.medicoRepository.insertUsuario({
      nombre_completo,
      correo,
      contrasena: hashed_contrasena,
      rol,
      "teléfono": telefono,
      fecha_nac
    });

    const medico = await this.medicoRepository.insertMedico({
      id_usuario: usuario.id_usuario,
      id_especialidad,
      matricula_profesional: pdfUrl,
      departamento,
      carnet_profesional: imgUrl,
      administrador_id_admin: 1
    });

    return { usuario, medico };
  }

  async verMedicos() {
    return await this.medicoRepository.getMedicos();
  }

  async perfilMedico(idUsuario) {
    const { data, error, status } = await this.medicoRepository.getPerfilMedico(idUsuario);

    if (error) {
      const customError = new Error(error.message);
      customError.status = status || 500;
      customError.code = 'DB_QUERY_ERROR';
      customError.originalError = error;
      throw customError;
    }

    if (!data) {
      const notFoundError = new Error('No se encontró el médico');
      notFoundError.status = 404;
      throw notFoundError;
    }

    const formatearFecha = (fechaString) => {
      if (!fechaString) return null;
      const partes = fechaString.split('T')[0].split('-'); 
      if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
      return fechaString;
    };

    return {
      id: data.id_medico,
      nombre: data.usuario?.nombre_completo || 'Sin nombre',
      fechaNac: formatearFecha(data.usuario?.fecha_nac),
      telefono: data.usuario?.teléfono || 'No registrado',
      correo: data.usuario?.correo || 'Sin correo',
      matricula: data.matricula_profesional || 'N/A',
      departamento: data.departamento || 'N/A',
      carnet: data.carnet_profesional || 'N/A',
      admin: data.administrador?.usuario?.nombre_completo || 'No'
    };
  }

  async verPacientes(idMedico) {
    const { data, error, status } = await this.medicoRepository.getPacientes(idMedico);

    if (error) {
      const customError = new Error(error.message);
      customError.status = status || 500;
      customError.code = 'DB_QUERY_ERROR';
      customError.originalError = error;
      throw customError;
    }

    if (!data || data.length === 0) {
      return [];
    }

    const formatearFecha = (fechaString) => {
      if (!fechaString) return null;
      const partes = fechaString.split('T')[0].split('-'); 
      if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
      return fechaString;
    };

    const formatearHora = (horaString) => {
      if (!horaString) return null;
      return horaString.substring(0, 5); 
    };

    return data.map(p => {
      const afeccionesList = p.paciente_enfermedad 
        ? p.paciente_enfermedad.map(pe => ({
            afeccion: pe.enfermedades_base?.nombre_enfermedad || 'Desconocida'
          }))
        : [];

      const tratamientosList = p.tratamiento_enfermedad
        ? p.tratamiento_enfermedad.map(te => ({
            titulo: te.tratamientos?.nombre_tratamiento || 'Sin título',
            desc: te.tratamientos?.descripcion || '',
            dosis: te.dosis ? String(te.dosis) : null
          }))
        : [];

      const rawRegistros = p.registro_glucosa || [];
      const historialMap = {};

      rawRegistros.forEach(reg => {
        const fechaFormateada = formatearFecha(reg.fecha);
        
        if (!historialMap[reg.fecha]) {
          historialMap[reg.fecha] = {
            fechaFormateada: fechaFormateada,
            fechaRaw: reg.fecha, 
            registros: []
          };
        }

        const alertaData = Array.isArray(reg.alertas) ? reg.alertas[0] : reg.alertas;
        let alertaFormat = null;

        if (alertaData) {
          const tipoAlerta = Array.isArray(alertaData.tipo_alerta) ? alertaData.tipo_alerta[0] : alertaData.tipo_alerta;
          const retro = Array.isArray(alertaData.retroalimentacion) ? alertaData.retroalimentacion[0] : alertaData.retroalimentacion;

          alertaFormat = {
            nivel: tipoAlerta?.tipo || null,
            observacion: reg.observaciones || null,
            mensaje: retro?.mensaje || null
          };
        }

        historialMap[reg.fecha].registros.push({
          fecha: fechaFormateada,
          hora: formatearHora(reg.hora),
          momento: reg.momento_dia?.momento || null,
          glucosa: reg.nivel_glucosa ? String(reg.nivel_glucosa) : null,
          alerta: alertaFormat
        });
      });

      const historialAgrupado = Object.values(historialMap)
        .sort((a, b) => new Date(b.fechaRaw) - new Date(a.fechaRaw)) 
        .map(grupo => {
          grupo.registros.sort((a, b) => a.hora.localeCompare(b.hora));
          return {
            fecha: grupo.fechaFormateada,
            registros: grupo.registros
          };
        });

      return {
        id: p.id_paciente,
        nombre: p.usuario?.nombre_completo || 'Sin nombre',
        ci: p.usuario?.id_usuario ? String(p.usuario.id_usuario) : null, 
        fechaNac: formatearFecha(p.usuario?.fecha_nac),
        genero: p.genero || null,
        peso: p.peso ? String(p.peso) : null,
        altura: p.altura ? String(p.altura) : null,
        actividadFisica: p.nivel_actividad_fisica?.descripcion || null,
        telefono: p.usuario?.teléfono || 'No registrado',
        correo: p.usuario?.correo || 'No registrado',
        numero_emergencia: p.numero_emergencia || null,
        nombre_emergencia: p.nombre_emergencia || null,
        foto_perfil: p.foto_perfil || null,
        afecciones: afeccionesList,
        tratamientos: tratamientosList,
        historial: historialAgrupado 
      };
    });
  }

  async alertasActivas(idMedico) {
    const { data, error, status } = await this.medicoRepository.getAlertasActivas(idMedico);

    if (error) {
      const customError = new Error(error.message);
      customError.status = status || 500;
      customError.code = 'DB_QUERY_ERROR';
      customError.originalError = error;
      throw customError;
    }

    if (!data || data.length === 0) {
      return [];
    }

    const formatearHora = (horaString) => {
      if (!horaString) return null;
      return horaString.substring(0, 5); 
    };

    return data.map(a => ({
      id: a.id_alerta,
      nivel: a.tipo_alerta?.tipo || 'Desconocido',
      idpaciente: a.registro_glucosa?.paciente?.id_paciente,
      paciente: a.registro_glucosa?.paciente?.usuario?.nombre_completo || 'Sin nombre',
      fecha: a.registro_glucosa?.fecha, 
      hora: formatearHora(a.registro_glucosa?.hora),
      glucosa: a.registro_glucosa?.nivel_glucosa ? Number(a.registro_glucosa.nivel_glucosa) : null,
      momento: a.registro_glucosa?.momento_dia?.momento || '',
      observaciones: a.registro_glucosa?.observaciones || ''
    }));
  }

  async alertasResueltas(idMedico) {
    const { data, error, status } = await this.medicoRepository.getAlertasResueltas(idMedico);

    if (error) {
      const customError = new Error(error.message);
      customError.status = status || 500;
      customError.code = 'DB_QUERY_ERROR';
      customError.originalError = error;
      throw customError;
    }

    if (!data || data.length === 0) {
      return [];
    }

    const formatearHora = (horaString) => {
      if (!horaString) return null;
      return horaString.substring(0, 5); 
    };

    return data.map(a => {
      const retro = Array.isArray(a.retroalimentacion) ? a.retroalimentacion[0] : a.retroalimentacion;

      return {
        id: a.id_alerta,
        nivel: a.tipo_alerta?.tipo || 'Desconocido',
        idpaciente: a.registro_glucosa?.paciente?.id_paciente || a.registro_glucosa?.id_paciente,
        paciente: a.registro_glucosa?.paciente?.usuario?.nombre_completo || '',
        fecha: a.registro_glucosa?.fecha,
        hora: formatearHora(a.registro_glucosa?.hora),
        glucosa: a.registro_glucosa?.nivel_glucosa ? Number(a.registro_glucosa.nivel_glucosa) : null,
        momento: a.registro_glucosa?.momento_dia?.momento || '',
        observaciones: a.registro_glucosa?.observaciones || '',
        mensaje: retro?.mensaje || ''
      };
    });
  }

  async retroalimentacionAlerta(retroData) {
    const { id_medico, fecha_registro, mensaje, alertas_id_alerta } = retroData;

    if (!id_medico || !fecha_registro || !mensaje || !alertas_id_alerta) {
      const error = new Error('Todos los campos son requeridos');
      error.status = 400;
      throw error;
    }

    const retro = await this.medicoRepository.insertRetroalimentacion({
      id_medico,
      fecha_registro,
      mensaje,
      alertas_id_alerta
    });

    const alertaUpdate = await this.medicoRepository.updateAlerta(alertas_id_alerta, { estado: false });

    return {
      message: 'Alerta respondida y actualizada correctamente',
      retroalimentacion: retro,
      alerta_actualizada: alertaUpdate
    };
  }

  async registrarGlucosaMedico(glucosaData) {
    const {
      fecha,
      hora,
      id_medico,
      id_momento,
      id_paciente,
      nivel_glucosa,
      observaciones
    } = glucosaData;

    if (!fecha || !hora || !id_medico || !id_momento || !id_paciente || !nivel_glucosa) {
      const error = new Error("Todos los campos (menos observaciones) deben estar llenados");
      error.status = 400;
      throw error;
    }

    const registro_glucosa = await this.medicoRepository.insertRegistroGlucosa({
      id_paciente,
      id_medico,
      id_momento,
      fecha,
      hora,
      nivel_glucosa,
      observaciones
    });

    return {
      message: "Registro insertado correctamente",
      id_registro: registro_glucosa.id, 
      registro_glucosa
    };
  }

  async actualizarMedico(idMedico, updateData, carnetFile) {
    const { telefono, correo, departamento } = updateData;

    const { data: medico, error: medicoFetchError } = await this.medicoRepository.getMedicoById(idMedico);

    if (medicoFetchError || !medico) {
      const error = new Error('Médico no encontrado');
      error.status = 404;
      throw error;
    }

    const { id_usuario } = medico;

    const usuarioUpdates = {};
    if (telefono !== undefined) usuarioUpdates["teléfono"] = telefono;
    if (correo !== undefined) usuarioUpdates.correo = correo;

    const medicoUpdates = {};
    if (departamento !== undefined) medicoUpdates.departamento = departamento;

    if (carnetFile) {
      const fileName = `carnet-${id_usuario}-${Date.now()}.${carnetFile.originalname.split('.').pop()}`;
      const carnetUrl = await this.medicoRepository.uploadCarnet(carnetFile, fileName);
      medicoUpdates.carnet_profesional = carnetUrl;
    }

    if (Object.keys(usuarioUpdates).length > 0) {
      await this.medicoRepository.updateUsuario(id_usuario, usuarioUpdates);
    }

    if (Object.keys(medicoUpdates).length > 0) {
      await this.medicoRepository.updateMedico(idMedico, medicoUpdates);
    }

    return {
      message: 'Datos actualizados correctamente',
      carnet_url: medicoUpdates.carnet_profesional || 'No se actualizó el carnet'
    };
  }
}

module.exports = MedicoService;
