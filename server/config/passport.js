const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const Seller = require('../models/seller')
const { sendWelcomeEmail } = require('../config/email')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Pehle check karo - seller already hai?
    let seller = await Seller.findOne({
      email: profile.emails[0].value
    })

    if (seller) {
      // If this email was registered the normal way (password)
      // and was never linked to a Google account, don't silently
      // log them in via Google — that would let anyone who can
      // create a Google account with a matching email address
      // access someone else's seller account without ever knowing
      // their password. Require them to link it explicitly first
      // (e.g. by logging in with the password once, from a
      // "Connect Google" flow) rather than merging automatically.
      if (!seller.googleId) {
        return done(null, false, {
          message:
            'An account with this email already exists. Please log in with your password first.',
        })
      }

      // Pehle se Google-linked hai - login!
      return done(null, seller)
    }

    // Naya seller banao
    seller = await Seller.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      password: 'google_auth_' + Date.now(),
      googleId: profile.id
    })

    // Same welcome email a regular email/password signup gets —
    // without this, Google sellers silently missed onboarding
    // (no info about their 100 free credits, dashboard link, etc).
    // Non-blocking: a failed email should never break Google login.
    sendWelcomeEmail(seller).catch((err) => {
      console.log('Welcome email error (Google signup):', err.message)
    })

    return done(null, seller)

  } catch (error) {
    return done(error, null)
  }
}))

passport.serializeUser((seller, done) => {
  done(null, seller._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const seller = await Seller.findById(id)
    done(null, seller)
  } catch (error) {
    done(error, null)
  }
})

module.exports = passport