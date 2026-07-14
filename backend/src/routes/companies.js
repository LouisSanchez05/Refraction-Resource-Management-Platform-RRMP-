const express = require('express');
const router = express.Router();

const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany
} = require('../controllers/companiesController');

const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, getCompanies);
router.get('/:companyId', isAdmin, getCompanyById);
router.post('/', isAdmin, createCompany);
router.patch('/:companyId', isAdmin, updateCompany);

module.exports = router;