class PacienteRepository {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async uploadProfileImage(filename, buffer, mimetype) {
    const imgUpload = await this.supabase.storage
      .from("perfiles_pacientes")
      .upload(`imgs/${filename}`, buffer, { contentType: mimetype });
    if (imgUpload.error) throw imgUpload.error;
    
    return this.supabase.storage.from("perfiles_pacientes").getPublicUrl(imgUpload.data.path).data.publicUrl;
  }

  async insertUsuario(usuarioData) {
    const { data, error } = await this.supabase
      .from("usuario")
      .insert([usuarioData]).select();
    if (error) throw error;
    return data[0];
  }

  async insertPaciente(pacienteData) {
    const { data, error } = await this.supabase
      .from("paciente")
      .insert([pacienteData]).select();
    if (error) throw error;
    return data[0];
  }

  async insertSeguimientoEmbarazo(data) {
    const { error } = await this.supabase.from('seguimiento_embarazo').insert(data);
    if (error) throw error;
  }

  async insertTratamientoEnfermedad(data) {
    const { error } = await this.supabase.from('tratamiento_enfermedad').insert(data);
    if (error) throw error;
  }

  async insertPacienteEnfermedad(data) {
    const { error } = await this.supabase.from('paciente_enfermedad').insert(data);
    if (error) throw error;
  }

  async findPerfilById(idPaciente) {
    return await this.supabase
      .from('paciente')
      .select(`
        id_paciente,
        genero,
        altura,
        peso,
        embarazo,
        nombre_emergencia,
        numero_emergencia,
        foto_perfil,
        usuario!inner (
          id_usuario,
          nombre_completo,
          fecha_nac,
          teléfono,
          correo,
          fecha_registro
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
        ),
        seguimiento_embarazo (
          semanas_embarazo,
          fecha_registro,
          fecha_terminacion
        )
      `)
      .eq('id_paciente', idPaciente)
      .maybeSingle();
  }

  async findRegistrosGlucosa(idPaciente) {
    return await this.supabase
      .from('registro_glucosa')
      .select(`
        id_registro,
        fecha,
        hora,
        nivel_glucosa,
        observaciones,
        momento_dia (
          momento
        ),
        medico (
          usuario (
            nombre_completo
          )
        ),
        alertas (
          id_alerta,
          tipo_alerta (
            tipo
          ),
          retroalimentacion (
            mensaje
          )
        )
      `)
      .eq('id_paciente', idPaciente)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });
  }

  async insertRegistroGlucosa(data) {
    const { data: glucosaData, error } = await this.supabase
      .from("registro_glucosa")
      .insert([data])
      .select();
    if (error) throw error;
    return glucosaData[0];
  }

  async findPacienteByIdUsuario(id_usuario) {
    const { data, error } = await this.supabase
      .from('paciente')
      .select('id_paciente')
      .eq('id_usuario', id_usuario)
      .single();
    if (error) throw error;
    return data;
  }

  async updateUsuario(id_usuario, dataToUpdate) {
    const { data, error } = await this.supabase
      .from('usuario')
      .update(dataToUpdate)
      .eq('id_usuario', id_usuario)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updatePaciente(id_usuario, dataToUpdate) {
    const { data, error } = await this.supabase
      .from('paciente')
      .update(dataToUpdate)
      .eq('id_usuario', id_usuario)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getSeguimientoActivo(id_paciente) {
    const { data, error } = await this.supabase
      .from('seguimiento_embarazo')
      .select('id_seguimiento')
      .eq('id_paciente', id_paciente)
      .is('fecha_terminacion', null)
      .order('fecha_registro', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data;
  }

  async updateSeguimientoEmbarazo(id_seguimiento, dataToUpdate) {
    const { error } = await this.supabase
      .from('seguimiento_embarazo')
      .update(dataToUpdate)
      .eq('id_seguimiento', id_seguimiento);
    if (error) throw error;
  }

  async findEmbarazoStatus(id_paciente) {
    const { data, error } = await this.supabase
      .from("paciente")
      .select("embarazo")
      .eq("id_paciente", id_paciente)
      .single();
    if (error) throw error;
    return data;
  }

  async findUltimoSeguimientoActivo(id_paciente) {
    const { data, error } = await this.supabase
      .from("seguimiento_embarazo")
      .select("fecha_registro, semanas_embarazo")
      .eq("id_paciente", id_paciente)
      .is("fecha_terminacion", null)
      .order("fecha_registro", { ascending: false })
      .limit(1);
    if (error) throw error;
    return data;
  }
}

module.exports = PacienteRepository;
