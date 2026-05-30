const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: {
    type: String,
    enum: ['upper_body', 'lower_body', 'dress'],
    default: 'upper_body'
  },
  productUrl: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)