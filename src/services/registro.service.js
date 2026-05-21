const nodemailer = require("nodemailer");
const { getHipoTemplate, getHiperTemplate } = require("../email/templates");

class RegistroService {
  constructor(registroRepository) {
    this.registroRepository = registroRepository;
  }

  calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  }

  async getDatosParaGlucosa(idPaciente) {
    const { data, error, status } = await this.registroRepository.getPacienteData(idPaciente);

    if (error) {
      return { success: false, error, status, code: 'DB_QUERY_ERROR' };
    }

    if (!data) {
      return { success: false, error: null, notFound: true };
    }

    const enfermedadesList = data.paciente_enfermedad 
      ? data.paciente_enfermedad.map(pe => pe.enfermedades_base?.nombre_enfermedad).filter(Boolean)
      : [];

    const datosGlucosa = {
      edad: this.calcularEdad(data.usuario?.fecha_nac),
      embarazo: data.embarazo || false,
      id_medico: data.id_medico || null,
      id_paciente: data.id_paciente,
      enfermedades: enfermedadesList
    };

    return { success: true, data: datosGlucosa };
  }

  async registrarAlertaAndEmail(alertaPayload) {
    const { id_tipo_alerta, id_registro, id_medico, fecha_alerta } = alertaPayload;

    // 1️⃣ Insertar alerta
    const alertaInsertada = await this.registroRepository.insertAlerta({
      id_tipo_alerta,
      id_registro,
      id_medico,
      fecha_alerta
    });

    // 2️⃣ Obtener datos para el correo
    const registro = await this.registroRepository.getRegistroGlucosa(id_registro);
    if (!registro) throw new Error("Registro de glucosa no encontrado");

    const paciente = await this.registroRepository.getPacienteInfo(registro.id_paciente);
    if (!paciente) throw new Error("Paciente no encontrado");

    const medico = await this.registroRepository.getMedicoAsignado(paciente.id_medico);
    if (!medico) throw new Error("Médico asignado no encontrado");

    const usuarioMedico = await this.registroRepository.getUsuario(medico.id_usuario, "correo, nombre_completo");
    if (!usuarioMedico) throw new Error("Usuario del médico no encontrado");
    
    const usuarioPaciente = await this.registroRepository.getUsuario(paciente.id_usuario, "nombre_completo");
    if (!usuarioPaciente) throw new Error("Usuario del paciente no encontrado");

    // 3️⃣ Preparar plantilla
    const datosCorreo = {
      nombrePaciente: usuarioPaciente.nombre_completo,
      valor: registro.nivel_glucosa,
      fecha: registro.fecha,
      hora: registro.hora,
      nombreMedico: usuarioMedico.nombre_completo,
      observaciones: registro.observaciones
    };

    const template =
      id_tipo_alerta === 1
        ? getHipoTemplate(datosCorreo)
        : getHiperTemplate(datosCorreo);

    // 4️⃣ Enviar correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"GlucoTracker" <${process.env.EMAIL_USER}>`,
      to: usuarioMedico.correo,
      subject: template.subject,
      html: template.html
    });

    return alertaInsertada;
  }
}

module.exports = RegistroService;
