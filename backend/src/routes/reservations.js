const express = require('express');
const router = express.Router();
const { getRoomReservations, createReservation, cancelReservation } = require('../controllers/reservationsController');

router.get('/room/:roomId', getRoomReservations);
router.post('/', createReservation);
router.delete('/:id', cancelReservation);

module.exports = router;