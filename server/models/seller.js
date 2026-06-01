const mongoose = require('mongoose')

const sellerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  sellerId: {
    type: String,
    unique: true,
    default: () => 'seller_' + Date.now()
  },
  apiKey: {
    type: String,
    unique: true,
    default: () => 'sk_' + Math.random().toString(36).substr(2, 20)
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro'],
    default: 'free'
  },
  tryonCount: { type: Number, default: 0 },
  tryonLimit: { type: Number, default: 50 },
  allowedDomains: [String],
  whatsapp: { type: String, default: '' },
  googleId: { type: String },
  upiId: { type: String, default: '' },

  // ─── Yeh 2 naye fields add karo ───────────
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date }

}, { timestamps: true })

module.exports = mongoose.models.Seller || 
  mongoose.model('Seller', sellerSchema)