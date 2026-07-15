const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  updateUserRole,
  getAllCompanies,
  createCompany,
  assignUserToCompany,
  getAllRooms,
  createRoom,
  updateRoom
} = require('../controllers/adminController');

const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: 'You must be logged in to access this resource'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required'
    });
  }

  next();
};

router.use(isAdmin);

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/companies', getAllCompanies);
router.post('/companies', createCompany);
router.patch('/users/:userId/company/:companyId', assignUserToCompany);
router.get('/rooms', getAllRooms);
router.post('/rooms', createRoom);
router.patch('/rooms/:id', updateRoom);

module.exports = router;