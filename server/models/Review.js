const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    default: ''
  },
  images: [String],
  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.models.Review ||
  mongoose.model('Review', reviewSchema)