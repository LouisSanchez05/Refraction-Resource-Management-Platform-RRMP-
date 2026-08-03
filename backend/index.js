require('dotenv').config();
console.log('Backend started from:', __dirname);
console.log('Working directory:', process.cwd());
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('./src/middleware/passport');
const authRoutes = require('./src/routes/auth');
const companyRoutes = require('./src/routes/companies');
const roomRoutes = require('./src/routes/rooms');
const reservationRoutes = require('./src/routes/reservations');
const membershipRoutes = require('./src/routes/memberships');
const reportRoutes = require('./src/routes/reports');
const adminRoutes = require('./src/routes/admin');
const auditRoutes = require('./src/routes/audit');
const quickbooksRoutes = require('./src/routes/quickbooks');

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// Authentication
app.use('/auth', authRoutes);
// API routes
app.use('/api/companies', companyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/quickbooks', quickbooksRoutes);
// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'RRMP backend is running' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NEW RRMP SERVER running on port ${PORT}`);
});