const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'El nombre del paciente es obligatorio'],
      trim: true,                       // elimina espacios al inicio/fin
    },
    doctorName: {
      type: String,
      required: [true, 'El nombre del doctor es obligatorio'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    startTime: {
      type: String,
      required: [true, 'La hora de inicio es obligatoria'],
      match: [/^\d{2}:\d{2}$/, 'Formato de hora inválido, use HH:mm'],
    },
    endTime: {
      type: String,
      required: [true, 'La hora de fin es obligatoria'],
      match: [/^\d{2}:\d{2}$/, 'Formato de hora inválido, use HH:mm'],
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);