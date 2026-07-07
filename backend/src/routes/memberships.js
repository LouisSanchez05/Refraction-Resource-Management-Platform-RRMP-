const express = require('express');
const router = express.Router();

const {
  assignMembership,
  getCompanyBalance,
  getMonthlyReport,
  updateMembershipPlan
} = require('../controllers/membershipsController');

router.post('/assign', assignMembership);
router.get('/balance/:companyId', getCompanyBalance);
router.get('/monthly-report', getMonthlyReport);
router.patch('/plans/:planId', updateMembershipPlan);

module.exports = router;