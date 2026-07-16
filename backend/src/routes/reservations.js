const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
  getRoomReservations,
  getUserReservations,
  createReservation,
  updateReservation,
  cancelReservation
} = require('../controllers/reservationsController');

router.get('/room/:roomId', getRoomReservations);
router.get('/user/:userId', isAuthenticated, getUserReservations);
router.post('/', createReservation);
router.patch('/:id', updateReservation);
router.delete('/:id', cancelReservation);

module.exports = router;