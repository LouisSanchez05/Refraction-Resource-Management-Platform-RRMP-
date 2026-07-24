const express = require('express');
const router = express.Router();

const {
  getRooms,
  getRoomById,
  createRoom,
} = require('../controllers/roomsController');

const { isAdmin } = require('../middleware/auth');

router.get('/', getRooms);
router.get('/:roomId', getRoomById);
router.post('/', isAdmin, createRoom);

module.exports = router;