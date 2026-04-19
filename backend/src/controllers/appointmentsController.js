const Appointment = require('../models/Appointment');
const { findConflicts } = require('../utils/overlapDetector');
const { sendAppointmentConfirmation } = require('../utils/emailService');

// ── GET /api/appointments ─────────────────────────────────────
// Bonus: paginación + filtro por rango de fechas
async function getAll(req, res, next) {
  try {
    const {
      date,
      doctorName,
      status,
      dateFrom,   // 🌟 rango de fechas: inicio
      dateTo,     // 🌟 rango de fechas: fin
      search,     // 🌟 búsqueda en tiempo real
      page = 1,   // 🌟 paginación: página actual (default 1)
      limit = 10, // 🌟 paginación: items por página (default 10)
    } = req.query;

    const filter = {};

    if (doctorName) {
      filter.doctorName = { $regex: doctorName, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    // Búsqueda en tiempo real: busca en nombre del paciente o doctor
    if (search) {
      filter.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { doctorName:  { $regex: search, $options: 'i' } },
        { reason:      { $regex: search, $options: 'i' } },
      ];
    }

    // Filtro por fecha exacta (un solo día)
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dayStart, $lte: dayEnd };
    }

    // 🌟 Filtro por rango de fechas (dateFrom y dateTo)
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        filter.date.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filter.date.$lte = to;
      }
    }

    // 🌟 Paginación
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // máximo 100 por página
    const skip     = (pageNum - 1) * limitNum;

    // Ejecutamos la consulta y el conteo en paralelo (más rápido)
    const [appointments, total] = await Promise.all([
      Appointment.find(filter).sort({ date: 1, startTime: 1 }).skip(skip).limit(limitNum),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/appointments/:id ─────────────────────────────────
async function getById(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/appointments ────────────────────────────────────
async function create(req, res, next) {
  try {
    const { patientName, doctorName, date, startTime, endTime, reason, status } = req.body;

    const conflicts = await findConflicts(Appointment, { doctorName, date, startTime, endTime });

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Conflicto de horario detectado',
        conflicts: conflicts.map((c) => ({
          id: c._id,
          patientName: c.patientName,
          startTime: c.startTime,
          endTime: c.endTime,
          reason: c.reason,
        })),
      });
    }

    const appointment = await Appointment.create({
      patientName, doctorName, date, startTime, endTime, reason, status,
    });

    // 🌟 Email de confirmación simulado (no bloquea la respuesta)
    sendAppointmentConfirmation(appointment);

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/appointments/:id ─────────────────────────────────
async function update(req, res, next) {
  try {
    const { patientName, doctorName, date, startTime, endTime, reason, status } = req.body;

    const existing = await Appointment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    const conflicts = await findConflicts(Appointment, {
      doctorName, date, startTime, endTime,
      excludeId: req.params.id,
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Conflicto de horario detectado',
        conflicts: conflicts.map((c) => ({
          id: c._id,
          patientName: c.patientName,
          startTime: c.startTime,
          endTime: c.endTime,
          reason: c.reason,
        })),
      });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { patientName, doctorName, date, startTime, endTime, reason, status },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/appointments/:id ──────────────────────────────
async function remove(req, res, next) {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }
    res.json({ success: true, message: 'Cita eliminada correctamente' });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/appointments/conflicts/check ─────────────────────
async function checkConflicts(req, res, next) {
  try {
    const { doctorName, date, startTime, endTime, excludeId } = req.query;

    if (!doctorName || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'doctorName, date, startTime y endTime son obligatorios',
      });
    }

    const conflicts = await findConflicts(Appointment, {
      doctorName, date, startTime, endTime, excludeId,
    });

    res.json({ success: true, hasConflicts: conflicts.length > 0, conflicts });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove, checkConflicts };