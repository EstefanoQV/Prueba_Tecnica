/**
 * Convierte "HH:mm" a minutos desde medianoche.
 * Ejemplo: "10:30" → 630
 * Esto nos permite comparar horas con simples números.
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Detecta si dos rangos de tiempo se solapan.
 * La fórmula es: (inicio1 < fin2) AND (fin1 > inicio2)
 *
 * Ejemplos:
 *  10:00-11:00 vs 10:15-10:45 → solapa ✅
 *  10:00-11:00 vs 11:00-12:00 → NO solapa (consecutivas) ✅
 *  10:00-11:00 vs 09:00-12:00 → solapa ✅
 */
function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  // Si los extremos se tocan exactamente (ej: 11:00 y 11:00), NO es solapamiento
  return s1 < e2 && e1 > s2;
}

/**
 * Busca en la base de datos las citas que generan conflicto.
 *
 * @param {Model}  Appointment - el modelo de Mongoose
 * @param {string} doctorName  - nombre del doctor
 * @param {Date}   date        - fecha (solo día, sin hora)
 * @param {string} startTime   - hora inicio "HH:mm"
 * @param {string} endTime     - hora fin "HH:mm"
 * @param {string} excludeId   - ID a excluir (para ediciones)
 * @returns {Array} citas que generan conflicto
 */
async function findConflicts(Appointment, { doctorName, date, startTime, endTime, excludeId }) {
  // Parseamos la fecha de forma segura sin importar si llega
  // como "2026-05-01" o "2026-05-01T00:00:00.000Z"
  const parsedDate = new Date(date)

  const dayStart = new Date(parsedDate)
  dayStart.setUTCHours(0, 0, 0, 0)   // ← UTC en vez de local

  const dayEnd = new Date(parsedDate)
  dayEnd.setUTCHours(23, 59, 59, 999) // ← UTC en vez de local

  console.log('🔍 Buscando conflictos:')
  console.log('   Doctor:', doctorName)
  console.log('   DayStart:', dayStart)
  console.log('   DayEnd:', dayEnd)
  console.log('   startTime:', startTime, '→ endTime:', endTime)

  const query = {
    doctorName: doctorName.trim(),
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: 'cancelled' },
  }

  if (excludeId) {
    const mongoose = require('mongoose')
    query._id = { $ne: new mongoose.Types.ObjectId(excludeId) }
  }

  const existingAppointments = await Appointment.find(query)

  console.log('   Citas encontradas ese día:', existingAppointments.length)

  return existingAppointments.filter((appt) =>
    timesOverlap(startTime, endTime, appt.startTime, appt.endTime)
  )
}

module.exports = { findConflicts, timesOverlap, timeToMinutes };