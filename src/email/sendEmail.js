const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    // 🔍 DEBUG: Verificamos si realmente está leyendo el .env
    console.log("Intentando enviar desde:", process.env.EMAIL_USER);
    console.log("Password cargado:", process.env.EMAIL_PASS ? "SÍ" : "NO");

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

    const info = await transporter.sendMail({
      from: `"GlucoTracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    // 🔍 DEBUG: Si llega aquí, Google aceptó el correo
    console.log("✅ Correo aceptado por Gmail. ID:", info.messageId);
    return info;

  } catch (error) {
    // 🔍 DEBUG: Si falla, veremos el error exacto de Google
    console.error("❌ Error crítico en Nodemailer:", error.message);
    throw error; // Lanzamos el error para que tu endpoint no devuelva 200 OK
  }
};

module.exports = { sendEmail };