const express = require('express');
const router = express.Router();

const {
  assignMembership,
  getCompanyBalance,
  getMonthlyReport,
  updateMembershipPlan,
  getOverageReview,
  getMembershipPlans,
  createMembershipPlan,
  deleteMembershipPlan,
} = require('../controllers/membershipsController');


const {
  isAuthenticated,
  isAdmin
} = require('../middleware/auth');

router.post('/assign', isAdmin, assignMembership);
router.post('/plans', isAdmin, createMembershipPlan);

router.get(
  '/balance/:companyId',
  isAuthenticated,
  getCompanyBalance
);

router.get(
  '/monthly-report',
  isAdmin,
  getMonthlyReport
);

router.patch(
  '/plans/:planId',
  isAdmin,
  updateMembershipPlan
);

router.get(
  '/overages',
  isAdmin,
  getOverageReview
);
router.get('/plans', getMembershipPlans);

router.delete(
  '/plans/:planId',
  isAdmin,
  deleteMembershipPlan
);


module.exports = router;  