const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db/pool');

const callbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  'http://localhost:3000/auth/google/callback';

console.log('Google callback URL:', callbackURL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        if (!email) {
          return done(new Error('Google account did not provide an email'));
        }

        let result = await pool.query(
          'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
          [email]
        );

        if (result.rows.length === 0) {
          result = await pool.query(
            `
            INSERT INTO users (email, name, role)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [email, name, 'member']
          );
        }

        return done(null, result.rows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    return done(null, result.rows[0]);
  } catch (err) {
    return done(err);
  }
});

module.exports = passport;