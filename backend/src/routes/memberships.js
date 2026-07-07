const express = require('express');
const router = express.Router();

const {
  assignMembership,
  getCompanyBalance,
  getMonthlyReport
} = require('../controllers/membershipsController');

router.post('/assign', assignMembership);
router.get('/balance/:companyId', getCompanyBalance);
router.get('/monthly-report', getMonthlyReport);

module.exports = router;