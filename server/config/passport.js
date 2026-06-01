const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const Seller = require('../models/seller')

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
      // Pehle se registered hai - login!
      return done(null, seller)
    }

    // Naya seller banao
    seller = await Seller.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      password: 'google_auth_' + Date.now(),
      googleId: profile.id
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