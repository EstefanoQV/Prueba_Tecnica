const nodemailer = require('nodemailer');

// Crea el "transportador" de emails usando las variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía un email de confirmación cuando se crea una cita.
 * Como es simulado con Ethereal, el email no llega a nadie real.
 */
async function sendAppointmentConfirmation(appointment) {
  const { patientName, doctorName, date, startTime, endTime, reason } = appointment;

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: `${patientName.toLowerCase().replace(' ', '.')}@example.com`, // email simulado
    subject: `✅ Cita confirmada con ${doctorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Confirmación de Cita Médica</h2>
        <p>Hola <strong>${patientName}</strong>,</p>
        <p>Tu cita ha sido confirmada con los siguientes detalles:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background:#f3f4f6;">
            <td style="padding:8px; border:1px solid #e5e7eb;"><strong>Doctor</strong></td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${doctorName}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #e5e7eb;"><strong>Fecha</strong></td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${formattedDate}</td>
          </tr>
          <tr style="background:#f3f4f6;">
            <td style="padding:8px; border:1px solid #e5e7eb;"><strong>Horario</strong></td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${startTime} - ${endTime}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #e5e7eb;"><strong>Motivo</strong></td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${reason || 'No especificado'}</td>
          </tr>
        </table>
        <p style="margin-top:20px; color:#6b7280; font-size:12px;">
          Este es un email simulado generado automáticamente.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // En Ethereal puedes ver el email en esta URL:
    console.log('📧 Email simulado enviado. Ver en:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (err) {
    // El email es opcional — si falla, no cortamos el flujo principal
    console.error('⚠️  Error enviando email (no crítico):', err.message);
  }
}

module.exports = { sendAppointmentConfirmation };