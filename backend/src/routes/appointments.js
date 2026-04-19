const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  remove,
  checkConflicts,
} = require('../controllers/appointmentsController');
const { validateAppointment } = require('../middleware/validateAppointment');

// ⚠️ IMPORTANTE: /conflicts/check debe ir ANTES de /:id
// porque Express intentaría matchear "conflicts" como un ID si va después
router.get('/conflicts/check', checkConflicts);

router.get('/',     getAll);
router.get('/:id',  getById);
router.post('/',    validateAppointment, create);   // valida primero, luego crea
router.put('/:id',  validateAppointment, update);   // valida primero, luego actualiza
router.delete('/:id', remove);

module.exports = router;