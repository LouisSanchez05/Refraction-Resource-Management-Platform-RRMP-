const express = require('express');
const router = express.Router();
const { getRoomReservations, createReservation, cancelReservation, editReservation } = require('../controllers/reservationsController');

router.get('/room/:roomId', getRoomReservations);
router.post('/', createReservation);
router.patch('/:id', editReservation);
router.delete('/:id', cancelReservation);

module.exports = router;