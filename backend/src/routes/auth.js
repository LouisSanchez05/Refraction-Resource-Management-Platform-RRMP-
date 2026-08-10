const express = require('express');
const passport = require('passport');

const router = express.Router();

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:5173';

// Start Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}/login`,
  }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((logoutError) => {
    if (logoutError) {
      return next(logoutError);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie('connect.sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite:
          process.env.NODE_ENV === 'production'
            ? 'none'
            : 'lax',
      });

      return res.redirect(`${FRONTEND_URL}/login`);
    });
  });
});

// Current user
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  }

  return res.status(401).json({
    error: 'Not authenticated',
  });
});

module.exports = router;