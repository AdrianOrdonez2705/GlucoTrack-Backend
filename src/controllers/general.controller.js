class GeneralController {
  constructor(generalService) {
    this.generalService = generalService;
  }

  verMomentos = async (req, res) => {
    try {
      const data = await this.generalService.obtenerMomentos();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error al obtener momentos: ', error.message);
      res.status(500).json({ error: 'Error al obtener momentos' });
    }
  };

  verNiveles = async (req, res) => {
    try {
      const data = await this.generalService.obtenerNiveles();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error al obtener niveles de actividad: ', error.message);
      res.status(500).json({ error: 'Error al obtener actividades' });
    }
  };

  verEnfermedades = async (req, res) => {
    try {
      const data = await this.generalService.obtenerEnfermedades();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error al obtener enfermedades: ', error.message);
      res.status(500).json({ error: 'Error al obtener enfermedades' });
    }
  };

  verTratamientos = async (req, res) => {
    try {
      const data = await this.generalService.obtenerTratamientos();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error al obtener tratamientos: ', error.message);
      res.status(500).json({ error: 'Error al obtener tratamientos' });
    }
  };

  verEspecialidades = async (req, res) => {
    try {
      const data = await this.generalService.obtenerEspecialidades();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error al obtener tratamientos: ', error.message); // Note: kept original typo in log
      res.status(500).json({ error: 'Error al obtener tratamientos' }); // Note: kept original typo in response
    }
  };

  verAuditoria = async (req, res) => {
    try {
      const data = await this.generalService.obtenerAuditoria();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error obteniendo auditoría:', error);
      return res.status(500).json({
        message: 'Error obteniendo auditoría',
        error: error.message
      });
    }
  };
}

module.exports = GeneralController;