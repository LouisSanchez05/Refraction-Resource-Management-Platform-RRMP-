const express = require('express');
const router = express.Router();

const {
  getRoomReservations,
  createReservation,
  updateReservation,
  cancelReservation
} = require('../controllers/reservationsController');

router.get('/room/:roomId', getRoomReservations);
router.post('/', createReservation);
router.patch('/:id', updateReservation);
router.delete('/:id', cancelReservation);

module.exports = router;