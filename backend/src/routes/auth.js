const express = require('express');
const passport = require('passport');
const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/google', passport.authenticate('google', { scope: ['openid', 'profile', 'email'], prompt: 'select_account' }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login` }), (req, res) => {
  res.redirect(`${FRONTEND_URL}/dashboard`);
});

router.get('/microsoft', (req, res, next) => {
  if (process.env.MICROSOFT_CLIENT_ID) {
    passport.authenticate('microsoft', { scope: ['user.read'] })(req, res, next);
  } else {
    res.status(503).json({ error: 'Microsoft login not configured yet' });
  }
});

router.get('/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: `${FRONTEND_URL}/login` }), (req, res) => {
  res.redirect(`${FRONTEND_URL}/dashboard`);
});

router.get('/logout', (req, res, next) => {
  req.logout((logoutError) => {
    if (logoutError) return next(logoutError);
    req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);
      res.clearCookie('connect.sid');
      return res.redirect(FRONTEND_URL);
    });
  });
});

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) return res.json({ user: req.user });
  return res.status(401).json({ error: 'Not authenticated' });
});

module.exports = router;
