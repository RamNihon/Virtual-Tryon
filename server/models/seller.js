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
  allowedDomains: [String]
}, { timestamps: true })

module.exports = mongoose.model('Seller', sellerSchema)