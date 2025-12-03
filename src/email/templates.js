const getHipoTemplate = ({ nombrePaciente, valor, fecha, hora ,nombreMedico}) => ({
  subject: `Alerta de Hipoglucemia - ${nombrePaciente}`,
  html: `
    <p>Estimado/a Doctor/a ${nombreMedico},</p>
    <p>Se detectó una medición baja de glucosa en el paciente <strong>${nombrePaciente}</strong>.</p>

    <p><strong>Detalles:</strong></p>
    <ul>
      <li><strong>Valor:</strong> ${valor} mg/dL</li>
      <li><strong>Fecha:</strong> ${fecha}</li>
      <li><strong>Hora:</strong> ${hora}</li>
    </ul>

    <p>El paciente se encontraba acompañado por el médico de turno.</p>

    <p>Atentamente,<br>GlucoTracker</p>
  `
});

const getHiperTemplate = ({ nombrePaciente, valor, fecha, hora }) => ({
  subject: `Alerta de Hiperglucemia - ${nombrePaciente}`,
  html: `
    <p>Estimado/a Doctor/a,</p>
    <p>Se registró una medición elevada de glucosa en el paciente <strong>${nombrePaciente}</strong>.</p>

    <p><strong>Detalles:</strong></p>
    <ul>
      <li><strong>Valor:</strong> ${valor} mg/dL</li>
      <li><strong>Fecha:</strong> ${fecha}</li>
      <li><strong>Hora:</strong> ${hora}</li>
    </ul>

    <p>El paciente se encontraba acompañado por el médico de turno.</p>

    <p>Atentamente,<br>GlucoTracker</p>
  `
});

module.exports = { getHipoTemplate, getHiperTemplate };
