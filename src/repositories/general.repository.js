class GeneralRepository {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async getMomentos() {
    const { data, error } = await this.supabase
      .from("momento_dia")
      .select("id_momento, momento");
    if (error) throw error;
    return data;
  }

  async getNiveles() {
    const { data, error } = await this.supabase
      .from('nivel_actividad_fisica')
      .select('id_nivel_actividad,descripcion');
    if (error) throw error;
    return data;
  }

  async getEnfermedades() {
    const { data, error } = await this.supabase
      .from('enfermedades_base')
      .select('id_enfermedad,nombre_enfermedad');
    if (error) throw error;
    return data;
  }

  async getTratamientos() {
    const { data, error } = await this.supabase
      .from('tratamientos')
      .select('id_tratamiento,nombre_tratamiento,descripcion');
    if (error) throw error;
    return data;
  }

  async getEspecialidades() {
    const { data, error } = await this.supabase
      .from('especialidad')
      .select('id_especialidad,nombre');
    if (error) throw error;
    return data;
  }

  async getAuditoria() {
    const { data, error } = await this.supabase
      .from('auditoria_endpoints')
      .select(`
          *,
          usuario(nombre_completo)
      `);
    if (error) throw error;
    return data;
  }
}

module.exports = GeneralRepository;
