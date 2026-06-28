const mongoose = require('mongoose')

const tryonHistorySchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  product: String,
  resultImage: String,
  humanImage: String,
  garmentImage: String,
  productName: String,
  category: String,
  source: {
    type: String,
    enum: ['shop', 'fabric'],
    default: 'shop'
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.models.TryonHistory || 
  mongoose.model('TryonHistory', tryonHistorySchema)