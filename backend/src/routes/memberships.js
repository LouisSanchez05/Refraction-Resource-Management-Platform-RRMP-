const express = require('express');
const router = express.Router();

const {
  assignMembership,
  getCompanyBalance,
  getMonthlyReport,
  updateMembershipPlan,
  getOverageReview
} = require('../controllers/membershipsController');


router.post('/assign', assignMembership);
router.get('/balance/:companyId', getCompanyBalance);
router.get('/monthly-report', getMonthlyReport);
router.patch('/plans/:planId', updateMembershipPlan);
router.get('/overages', getOverageReview);

module.exports = router;