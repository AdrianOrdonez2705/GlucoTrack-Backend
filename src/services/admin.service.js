const bcrypt = require('bcrypt');

class AdminService {
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  formatearFecha(fechaString) {
    if (!fechaString) return null;
    const partes = fechaString.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return fechaString;
  }

  async obtenerMedicosActivos() {
    const data = await this.adminRepository.getMedicosByEstadoUsuario(true);
    if (!data || data.length === 0) return [];

    return data.map(m => ({
      id: m.id_medico,
      nombre: m.usuario?.nombre_completo || 'Sin nombre',
      fechaNac: m.usuario?.fecha_nac || null,
      telefono: m.usuario?.teléfono || 'No registrado',
      correo: m.usuario?.correo || 'No registrado',
      matricula: m.matricula_profesional || 'N/A',
      departamento: m.departamento || 'N/A',
      carnet: m.carnet_profesional || 'N/A',
      admitidoPor: m.administrador?.usuario?.nombre_completo || 'Sistema'
    }));
  }

  async obtenerMedicosSolicitantes() {
    const data = await this.adminRepository.getMedicosByEstadoUsuario(false);
    if (!data || data.length === 0) return [];

    return data.map(m => ({
      id: m.id_medico,
      nombre: m.usuario?.nombre_completo || 'Sin nombre',
      fechaNac: m.usuario?.fecha_nac || null,
      telefono: m.usuario?.teléfono || 'No registrado',
      correo: m.usuario?.correo || 'No registrado',
      matricula: m.matricula_profesional || 'N/A',
      departamento: m.departamento || 'N/A',
      carnet: m.carnet_profesional || 'N/A',
      admitidoPor: m.administrador?.usuario?.nombre_completo || 'Pendiente'
    }));
  }

  async activarMedico(idMedico, idAdmin) {
    if (!idAdmin) {
      const err = new Error('No hay administrador');
      err.status = 400;
      throw err;
    }
    const medicoData = await this.adminRepository.getMedicoIdUsuario(idMedico);
    if (!medicoData) {
      const err = new Error('Médico no encontrado');
      err.status = 404;
      throw err;
    }

    await this.adminRepository.updateMedicoAdmin(idMedico, idAdmin);
    await this.adminRepository.updateUsuarioEstado(medicoData.id_usuario, true);
    return { mensaje: 'Usuario activado correctamente' };
  }

  async obtenerPacientesActivos() {
    const data = await this.adminRepository.getPacientesActivos();
    if (!data || data.length === 0) return [];

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

      return {
        id: p.id_paciente,
        nombre: p.usuario?.nombre_completo || 'Sin nombre',
        ci: p.usuario?.correo, 
        fechaNac: this.formatearFecha(p.usuario?.fecha_nac),
        genero: p.genero || null,
        peso: p.peso ? String(p.peso) : null,
        altura: p.altura ? String(p.altura) : null,
        actividadFisica: p.nivel_actividad_fisica?.descripcion || null,
        telefono: p.usuario?.teléfono || 'No registrado',
        correo: p.usuario?.correo || 'No registrado',
        nombre_emergencia: p.nombre_emergencia || null,
        numero_emergencia: p.numero_emergencia || null,
        medico: p.medico?.usuario?.nombre_completo || null,
        foto_perfil: p.foto_perfil || null,
        afecciones: afeccionesList,
        tratamientos: tratamientosList,
        admitidoPor: p.administrador?.usuario?.nombre_completo || 'Sistema'
      };
    });
  }

  async obtenerPacientesSolicitantes() {
    const data = await this.adminRepository.getPacientesSolicitantes();
    if (!data || data.length === 0) return [];

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

      const semanasEmbarazo = Array.isArray(p.seguimiento_embarazo) 
        ? p.seguimiento_embarazo[0]?.semanas_embarazo 
        : p.seguimiento_embarazo?.semanas_embarazo;

      return {
        id: p.id_paciente,
        nombre: p.usuario?.nombre_completo || 'Sin nombre',
        ci: p.usuario?.correo, 
        fechaNac: this.formatearFecha(p.usuario?.fecha_nac),
        genero: p.genero || null,
        peso: p.peso ? String(p.peso) : null,
        altura: p.altura ? String(p.altura) : null,
        actividadFisica: p.nivel_actividad_fisica?.descripcion || null,
        telefono: p.usuario?.teléfono || 'No registrado',
        correo: p.usuario?.correo || 'No registrado',
        nombre_emergencia: p.nombre_emergencia || null,
        numero_emergencia: p.numero_emergencia || null,
        medico: p.medico?.usuario?.nombre_completo || null,
        foto_perfil: p.foto_perfil || null,
        embarazo: p.embarazo || false,
        semanas_embarazo: semanasEmbarazo || null,
        afecciones: afeccionesList,
        tratamientos: tratamientosList,
        admitidoPor: p.administrador?.usuario?.nombre_completo || 'Pendiente'
      };
    });
  }

  async activarPaciente(idPaciente, idAdmin) {
    if (!idAdmin) {
      const err = new Error('No hay administrador');
      err.status = 400;
      throw err;
    }
    const pacienteData = await this.adminRepository.getPacienteIdUsuario(idPaciente);
    if (!pacienteData) {
      const err = new Error('Medico no encontrado'); // Maintaining typo for backwards compatibility
      err.status = 404;
      throw err;
    }

    await this.adminRepository.updatePacienteAdmin(idPaciente, idAdmin);
    const updateData = await this.adminRepository.updateUsuarioEstado(pacienteData.id_usuario, true);
    return { mensaje: 'Usuario activado correctamente', usuario: updateData };
  }

  async obtenerPerfilAdmin(idUsuario) {
    if (isNaN(idUsuario)) {
      const err = new Error('El ID de usuario debe ser un número válido');
      err.status = 400;
      throw err;
    }

    const data = await this.adminRepository.getPerfilAdmin(idUsuario);
    if (!data) {
      const err = new Error('No se encontró el administrador');
      err.status = 404;
      throw err;
    }

    return {
      id: data.id_admin,
      nombre: data.usuario?.nombre_completo || 'Sin nombre',
      correo: data.usuario?.correo || 'Sin correo',
      fechaNac: this.formatearFecha(data.usuario?.fecha_nac),
      telefono: data.usuario?.teléfono || 'No registrado',
      cargo: data.cargo || 'N/A',
      fechaIn: this.formatearFecha(data.fecha_ingreso),
      admitidoPor: data.administrador?.usuario?.nombre_completo || 'No'
    };
  }

  async agregarAdmin(dataInput) {
    const {
      nombre,
      correo,
      contrasena,
      fechaNacimiento,
      telefono,
      cargo,
      fecha_registro,
      administrador_id_admin
    } = dataInput;

    if (!nombre || !correo || !contrasena || !fechaNacimiento || !cargo || !fecha_registro || !telefono || !administrador_id_admin) {
      const err = new Error('Todos los campos deben ser llenados');
      err.status = 400;
      throw err;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    const usuarioData = {
      nombre_completo: nombre,
      correo: correo,
      contrasena: hashedPassword,
      rol: 'administrador',
      fecha_nac: fechaNacimiento,
      teléfono: telefono,
      estado: true,
    };

    const usuarioRes = await this.adminRepository.createUsuario(usuarioData);
    const usuarioInsertado = usuarioRes[0];

    const adminDataInsert = {
      id_usuario: usuarioInsertado.id_usuario,
      cargo: cargo,
      fecha_ingreso: fecha_registro,
      administrador_id_admin: administrador_id_admin
    };

    const adminRes = await this.adminRepository.createAdmin(adminDataInsert);

    return {
      message: 'Usuario y admin registrados correctamente',
      usuario_insertado: usuarioInsertado,
      adminData: adminRes
    };
  }

  async obtenerAdminsVisibles(idAdmin) {
    if (isNaN(idAdmin)) {
      const err = new Error('El ID de administrador debe ser un número válido');
      err.status = 400;
      throw err;
    }

    const data = await this.adminRepository.getAdminsVisibles(idAdmin);
    if (!data || data.length === 0) return [];

    return data.map(a => ({
      id: a.id_admin,
      nombre: a.usuario?.nombre_completo || 'Sin nombre',
      correo: a.usuario?.correo || 'Sin correo',
      fechaNac: this.formatearFecha(a.usuario?.fecha_nac),
      telefono: a.usuario?.teléfono || 'No registrado',
      cargo: a.cargo || 'N/A',
      fechaIn: this.formatearFecha(a.fecha_ingreso),
      admitidoPor: a.administrador?.usuario?.nombre_completo || 'No especificado'
    }));
  }
}

module.exports = AdminService;
