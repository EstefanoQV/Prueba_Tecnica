/**
 * Middleware que valida los datos antes de llegar al controller.
 * Si algo falla, corta la cadena y responde con error.
 * Si todo está bien, llama a next() para continuar.
 */
function validateAppointment(req, res, next) {
  const { patientName, doctorName, date, startTime, endTime } = req.body;
  const errors = [];

  // ── Campos obligatorios ───────────────────────────────────
  if (!patientName?.trim()) errors.push('El nombre del paciente es obligatorio');
  if (!doctorName?.trim())  errors.push('El nombre del doctor es obligatorio');
  if (!date)                errors.push('La fecha es obligatoria');
  if (!startTime)           errors.push('La hora de inicio es obligatoria');
  if (!endTime)             errors.push('La hora de fin es obligatoria');

  // Si faltan campos básicos, no tiene sentido seguir validando
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // ── Formato de hora ───────────────────────────────────────
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(startTime)) errors.push('startTime debe tener formato HH:mm');
  if (!timeRegex.test(endTime))   errors.push('endTime debe tener formato HH:mm');

  // ── La fecha no puede ser anterior a hoy ─────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0); // comparamos solo el día, no la hora exacta

  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);

  if (appointmentDate < today) {
    errors.push('La fecha no puede ser anterior a hoy');
  }

  // ── endTime debe ser posterior a startTime ────────────────
  if (errors.length === 0) { // solo si los formatos son válidos
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes   = eh * 60 + em;

    if (endMinutes <= startMinutes) {
      errors.push('La hora de fin debe ser posterior a la hora de inicio');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next(); // todo válido, continuamos al controller
}

module.exports = { validateAppointment };