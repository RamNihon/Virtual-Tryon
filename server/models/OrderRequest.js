const mongoose = require('mongoose')

const orderRequestSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: String,
  productPrice: Number,
  customerInfo: {
    // Anonymous tracking
    sessionId: String
  },
  orderType: {
    type: String,
    enum: ['whatsapp', 'upi'],
    default: 'whatsapp'
  }
}, { timestamps: true })

module.exports = mongoose.models.OrderRequest ||
  mongoose.model('OrderRequest', orderRequestSchema)