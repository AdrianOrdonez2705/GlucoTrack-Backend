class GeneralService {
  constructor(generalRepository) {
    this.generalRepository = generalRepository;
  }

  async obtenerMomentos() {
    return await this.generalRepository.getMomentos();
  }

  async obtenerNiveles() {
    return await this.generalRepository.getNiveles();
  }

  async obtenerEnfermedades() {
    return await this.generalRepository.getEnfermedades();
  }

  async obtenerTratamientos() {
    return await this.generalRepository.getTratamientos();
  }

  async obtenerEspecialidades() {
    return await this.generalRepository.getEspecialidades();
  }

  async obtenerAuditoria() {
    return await this.generalRepository.getAuditoria();
  }
}

module.exports = GeneralService;
