require('dotenv').config();
console.log('Google client ID loaded:', Boolean(process.env.GOOGLE_CLIENT_ID));
console.log('Google secret loaded:', Boolean(process.env.GOOGLE_CLIENT_SECRET));

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./src/middleware/passport');

const roomsRouter = require('./src/routes/rooms');
const reservationsRouter = require('./src/routes/reservations');
const authRouter = require('./src/routes/auth');
const membershipsRouter = require('./src/routes/memberships');
const adminRouter = require('./src/routes/admin');
const reportsRouter = require('./src/routes/reports');
const companiesRouter = require('./src/routes/companies');
const auditRouter = require('./src/routes/audit');
const quickbooksRouter = require('./src/routes/quickbooks');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/rooms', roomsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/auth', authRouter);
app.use('/api/memberships', membershipsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/audit', auditRouter);
app.use('/api/quickbooks', quickbooksRouter);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'RRMP API is running' });
});

app.get('/api/session', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});