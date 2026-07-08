const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, getAllCompanies, createCompany, assignUserToCompany } = require('../controllers/adminController');

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/companies', getAllCompanies);
router.post('/companies', createCompany);
router.patch('/users/:userId/company/:companyId', assignUserToCompany);

module.exports = router;