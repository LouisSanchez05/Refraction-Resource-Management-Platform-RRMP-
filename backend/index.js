const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./src/middleware/passport');
require('dotenv').config();

const roomsRouter = require('./src/routes/rooms');
const reservationsRouter = require('./src/routes/reservations');
const authRouter = require('./src/routes/auth');

const app = express();

app.use(cors());
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

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'RRMP API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});