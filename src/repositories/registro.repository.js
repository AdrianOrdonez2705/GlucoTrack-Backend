class RegistroRepository {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async getPacienteData(idPaciente) {
    const { data, error, status } = await this.supabase
      .from('paciente')
      .select(`
        id_paciente,
        embarazo,
        id_medico,
        usuario!inner (
          fecha_nac
        ),
        paciente_enfermedad (
          enfermedades_base (
            nombre_enfermedad
          )
        )
      `)
      .eq('id_paciente', idPaciente)
      .maybeSingle();

    return { data, error, status };
  }

  async insertAlerta(alertaData) {
    const { data, error } = await this.supabase
      .from('alertas')
      .insert([alertaData])
      .select();

    if (error) throw error;
    return data[0];
  }

  async getRegistroGlucosa(idRegistro) {
    const { data } = await this.supabase
      .from("registro_glucosa")
      .select("id_paciente, nivel_glucosa, fecha, hora, observaciones")
      .eq("id_registro", idRegistro)
      .single();
    return data;
  }

  async getPacienteInfo(idPaciente) {
    const { data } = await this.supabase
      .from("paciente")
      .select("id_usuario, id_medico")
      .eq("id_paciente", idPaciente)
      .single();
    return data;
  }

  async getMedicoAsignado(idMedico) {
    const { data } = await this.supabase
      .from("medico")
      .select("id_usuario")
      .eq("id_medico", idMedico)
      .single();
    return data;
  }

  async getUsuario(idUsuario, selectCampos) {
    const { data } = await this.supabase
      .from("usuario")
      .select(selectCampos)
      .eq("id_usuario", idUsuario)
      .single();
    return data;
  }
}

module.exports = RegistroRepository;
