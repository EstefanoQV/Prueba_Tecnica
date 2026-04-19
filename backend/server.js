const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const appointmentRoutes = require('./src/routes/appointments');

const app = express();

// ── Middlewares globales ──────────────────────────────────────
app.use(cors());                    // permite peticiones desde el frontend
app.use(express.json());            // parsea el body como JSON automáticamente

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/appointments', appointmentRoutes);

// ── Ruta de salud (útil para saber si el server está vivo) ────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Middleware de errores global ──────────────────────────────
// Captura cualquier error que se pase con next(error) desde los controllers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

// ── Conexión a MongoDB y arranque ─────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server corriendo en http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1); // si no hay DB, no tiene sentido seguir
  });