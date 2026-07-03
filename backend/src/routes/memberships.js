const express = require('express');
const router = express.Router();
const { assignMembership, getCompanyBalance, getMonthlyReport } = require('../controllers/membershipsController');

router.post('/', assignMembership);
router.get('/company/:companyId/balance', getCompanyBalance);
router.get('/report', getMonthlyReport);

module.exports = router;