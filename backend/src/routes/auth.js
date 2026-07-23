const express = require('express');
const passport = require('passport');
const router = express.Router();

// initiate Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

// initiate Microsoft OAuth
router.get('/microsoft', passport.authenticate('microsoft', {
  scope: ['user.read']
}));

// Microsoft OAuth callback
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

// logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

// get current user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;