const express = require('express');
const router = express.Router();
const { getAllRooms, checkAvailability } = require('../controllers/roomsController');

router.get('/', getAllRooms);
router.get('/:roomId/availability', checkAvailability);

module.exports = router;