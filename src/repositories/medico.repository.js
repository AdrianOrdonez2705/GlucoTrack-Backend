class MedicoRepository {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async uploadMatricula(pdf) {
    const fileName = `pdfs/${Date.now()}_${pdf.originalname}`;
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from("Matriculas_PDF")
      .upload(fileName, pdf.buffer, { contentType: pdf.mimetype });

    if (uploadError) throw uploadError;

    const { data: urlData } = this.supabase.storage
      .from("Matriculas_PDF")
      .getPublicUrl(uploadData.path);
      
    return urlData.publicUrl;
  }

  async uploadCarnet(img, customName = null) {
    const fileName = customName || `imgs/${Date.now()}_${img.originalname}`;
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from("Carnets_IMG")
      .upload(fileName, img.buffer, { 
        contentType: img.mimetype,
        upsert: !!customName
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = this.supabase.storage
      .from("Carnets_IMG")
      .getPublicUrl(uploadData.path);
      
    return urlData.publicUrl;
  }

  async insertUsuario(usuarioData) {
    const { data, error } = await this.supabase
      .from("usuario")
      .insert([usuarioData])
      .select();

    if (error) throw error;
    return data[0];
  }

  async insertMedico(medicoData) {
    const { data, error } = await this.supabase
      .from('medico')
      .insert([medicoData])
      .select();

    if (error) throw error;
    return data[0];
  }

  async getMedicos() {
    const { data, error } = await this.supabase
      .from('medico')
      .select(`
        id_medico,
        usuario ( nombre_completo )
      `);

    if (error) throw error;
    return data;
  }

  async getPerfilMedico(idUsuario) {
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
          correo
        ),
        administrador (
          usuario (
            nombre_completo
          )
        )
      `)
      .eq('id_usuario', idUsuario)
      .maybeSingle();

    return { data, error, status };
  }

  async getPacientes(idMedico) {
    const { data, error, status } = await this.supabase
      .from('paciente')
      .select(`
        id_paciente,
        genero,
        peso,
        altura,
        numero_emergencia,
        nombre_emergencia,
        foto_perfil,
        usuario!inner (
          id_usuario,
          nombre_completo,
          fecha_nac,
          teléfono,
          correo,
          estado
        ),
        nivel_actividad_fisica (
          descripcion
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
        registro_glucosa (
          fecha,
          hora,
          nivel_glucosa,
          observaciones,
          momento_dia (
            momento
          ),
          alertas (
            tipo_alerta (
              tipo
            ),
            retroalimentacion (
              mensaje
            )
          )
        )
      `)
      .eq('id_medico', idMedico)
      .eq('usuario.estado', true);

    return { data, error, status };
  }

  async getAlertasActivas(idMedico) {
    const { data, error, status } = await this.supabase
      .from('alertas')
      .select(`
        id_alerta,
        estado,
        tipo_alerta!inner (
          tipo
        ),
        registro_glucosa!inner (
          fecha,
          hora,
          nivel_glucosa,
          observaciones,
          id_medico,
          paciente!inner (
            id_paciente,
            usuario!inner (
              nombre_completo
            )
          ),
          momento_dia (
            momento
          )
        )
      `)
      .eq('estado', true)
      .eq('registro_glucosa.id_medico', idMedico);

    return { data, error, status };
  }

  async getAlertasResueltas(idMedico) {
    const { data, error, status } = await this.supabase
      .from('alertas')
      .select(`
        id_alerta,
        estado,
        tipo_alerta!inner (
          tipo
        ),
        retroalimentacion (
          mensaje
        ),
        registro_glucosa!inner (
          fecha,
          hora,
          nivel_glucosa,
          observaciones,
          id_paciente,
          id_medico,
          paciente (
            id_paciente,
            usuario (
              nombre_completo
            )
          ),
          momento_dia (
            momento
          )
        )
      `)
      .eq('estado', false)
      .eq('registro_glucosa.id_medico', idMedico);

    return { data, error, status };
  }

  async insertRetroalimentacion(retroData) {
    const { data, error } = await this.supabase
      .from('retroalimentacion')
      .insert([retroData])
      .select();

    if (error) throw error;
    return data;
  }

  async updateAlerta(idAlerta, updateData) {
    const { data, error } = await this.supabase
      .from('alertas')
      .update(updateData)
      .eq('id_alerta', idAlerta)
      .select();

    if (error) throw error;
    return data;
  }

  async insertRegistroGlucosa(registroData) {
    const { data, error } = await this.supabase
      .from("registro_glucosa")
      .insert([registroData])
      .select();

    if (error) throw error;
    return data[0];
  }

  async getMedicoById(idMedico) {
    const { data, error } = await this.supabase
      .from('medico')
      .select('id_usuario')
      .eq('id_medico', idMedico)
      .single();

    return { data, error };
  }

  async updateUsuario(idUsuario, updateData) {
    const { error } = await this.supabase
      .from('usuario')
      .update(updateData)
      .eq('id_usuario', idUsuario);

    if (error) throw error;
  }

  async updateMedico(idMedico, updateData) {
    const { error } = await this.supabase
      .from('medico')
      .update(updateData)
      .eq('id_medico', idMedico);

    if (error) throw error;
  }
}

module.exports = MedicoRepository;
