const express = require('express');
const router = express.Router();

const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany
} = require('../controllers/companiesController');

router.get('/', getCompanies);
router.get('/:companyId', getCompanyById);
router.post('/', createCompany);
router.patch('/:companyId', updateCompany);

module.exports = router;