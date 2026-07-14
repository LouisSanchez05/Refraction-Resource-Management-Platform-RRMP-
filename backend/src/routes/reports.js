const express = require('express');
const router = express.Router();

const {
  getRoomUtilization
} = require('../controllers/reportsController');

const { isAdmin } = require('../middleware/auth');

router.get(
  '/room-utilization',
  isAdmin,
  getRoomUtilization
);

module.exports = router;