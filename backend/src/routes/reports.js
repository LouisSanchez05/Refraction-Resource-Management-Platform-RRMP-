const express = require('express');
const router = express.Router();
const { getRoomUtilization } = require('../controllers/reportsController');

router.get('/room-utilization', getRoomUtilization);

module.exports = router;