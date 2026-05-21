class AdminRepository {
  constructor(supabase) {
    this.supabase = supabase;
  }

  _handleError(error, status = 500, defaultMessage = 'Error de base de datos') {
    if (!error) return null;
    const err = new Error(error.message || defaultMessage);
    err.details = error.details;
    err.dbCode = error.code;
    
    if (error.code && error.code.startsWith('28')) {
      err.status = 403;
      err.code = 'DB_AUTH_ERROR';
      err.message = 'No autorizado para consultar la base de datos';
    } else if (error.code === '57014') {
      err.status = 504;
      err.code = 'DB_TIMEOUT';
      err.message = 'La base de datos tardó demasiado en responder';
    } else {
      err.status = status || 500;
      err.code = 'DB_QUERY_ERROR';
      err.message = defaultMessage;
    }
    throw err;
  }

  async getMedicosByEstadoUsuario(estado) {
    const { data, error, status } = await this.supabase
      .from('medico')
      .select(`
        id_medico,
        matricula_profesional,
        departamento,
        carnet_profesional,
        usuario!inner (
          nombre_completo,
          fecha_nac,
          teléfono,
          correo,
          estado
        ),
        administrador (
          usuario (
            nombre_completo
          )
        )
      `)
      .eq('usuario.estado', estado);
    if (error) this._handleError(error, status, 'Error al consultar los médicos');
    return data;
  }

  async getMedicoIdUsuario(idMedico) {
    const { data, error } = await this.supabase
      .from('medico')
      .select('id_usuario')
      .eq('id_medico', idMedico)
      .single();
    if (error || !data) return null;
    return data;
  }

  async updateMedicoAdmin(idMedico, idAdmin) {
    const { error } = await this.supabase
      .from('medico')
      .update({ administrador_id_admin: idAdmin })
      .eq('id_medico', idMedico);
    if (error) {
       const err = new Error(error.message);
       err.status = 400;
       throw err;
    }
  }

  async updateUsuarioEstado(idUsuario, estado) {
    const { data, error } = await this.supabase
      .from('usuario')
      .update({ estado })
      .eq('id_usuario', idUsuario)
      .select();
    if (error) {
       const err = new Error(error.message);
       err.status = 400;
       throw err;
    }
    return data;
  }

  async getPacientesActivos() {
    const { data, error, status } = await this.supabase
      .from('paciente')
      .select(`
        id_paciente,
        genero,
        peso,
        altura,
        nombre_emergencia,
        numero_emergencia,
        foto_perfil,
        usuario!inner (
          nombre_completo,
          fecha_nac,
          teléfono,
          correo,
          estado
        ),
        nivel_actividad_fisica (
          descripcion
        ),
        medico (
          usuario (
            nombre_completo
          )
        ),
        administrador!inner (
          usuario (
            nombre_completo
          )
        ),
        paciente_enfermedad (
          enfermedades_base (
            nombre_enfermedad
          )
        ),
        tratamiento_enfermedad (
          dosis,
          tratamientos (
            nombre_tratamiento,
            descripcion
          )
        )
      `)
      .eq('usuario.estado', true);
    if (error) this._handleError(error, status, 'Error al consultar los pacientes');
    return data;
  }

  async getPacientesSolicitantes() {
    const { data, error, status } = await this.supabase
      .from('paciente')
      .select(`
        id_paciente,
        genero,
        peso,
        altura,
        nombre_emergencia,
        numero_emergencia,
        foto_perfil,
        embarazo,
        usuario!inner (
          nombre_completo,
          fecha_nac,
          teléfono,
          correo,
          estado
        ),
        nivel_actividad_fisica (
          descripcion
        ),
        medico (
          usuario (
            nombre_completo
          )
        ),
        administrador (
          usuario (
            nombre_completo
          )
        ),
        seguimiento_embarazo (
          semanas_embarazo
        ),
        paciente_enfermedad (
          enfermedades_base (
            nombre_enfermedad
          )
        ),
        tratamiento_enfermedad (
          dosis,
          tratamientos (
            nombre_tratamiento,
            descripcion
          )
        )
      `)
      .eq('usuario.estado', false);
    if (error) this._handleError(error, status, 'Error al consultar los pacientes solicitantes');
    return data;
  }

  async getPacienteIdUsuario(idPaciente) {
    const { data, error } = await this.supabase
      .from('paciente')
      .select('id_usuario')
      .eq('id_paciente', idPaciente)
      .single();
    if (error) {
       const err = new Error(error.message);
       err.status = 400;
       throw err;
    }
    if (!data) return null;
    return data;
  }

  async updatePacienteAdmin(idPaciente, idAdmin) {
    const { error } = await this.supabase
      .from('paciente')
      .update({ administrador_id_admin: idAdmin })
      .eq('id_paciente', idPaciente);
    if (error) {
       const err = new Error(error.message);
       err.status = 400;
       throw err;
    }
  }

  async getPerfilAdmin(idUsuario) {
    const { data, error, status } = await this.supabase
      .from('administrador')
      .select(`
        id_admin,
        cargo,
        fecha_ingreso,
        usuario!inner (
          nombre_completo,
          correo,
          fecha_nac,
          teléfono
        ),
        administrador (
          usuario (
            nombre_completo
          )
        )
      `)
      .eq('id_usuario', idUsuario)
      .maybeSingle();
    if (error) this._handleError(error, status, 'Error al consultar el perfil del administrador');
    return data;
  }

  async createUsuario(usuarioData) {
    const { data, error } = await this.supabase
      .from('usuario')
      .insert([usuarioData])
      .select();
    if (error) throw new Error(error.message);
    return data;
  }

  async createAdmin(adminData) {
    const { data, error } = await this.supabase
      .from('administrador')
      .insert([adminData])
      .select();
    if (error) throw new Error(error.message);
    return data;
  }

  async getAdminsVisibles(idAdmin) {
    const { data, error, status } = await this.supabase
      .from('administrador')
      .select(`
        id_admin,
        cargo,
        fecha_ingreso,
        usuario!inner (
          nombre_completo,
          correo,
          fecha_nac,
          teléfono
        ),
        administrador (
          usuario (
            nombre_completo
          )
        )
      `)
      .neq('id_admin', 1)
      .neq('id_admin', idAdmin);
    if (error) this._handleError(error, status, 'Error al consultar los administradores visibles');
    return data;
  }
}

module.exports = AdminRepository;
