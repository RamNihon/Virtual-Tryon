const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  // Basic Info
  brandName: { type: String, default: '' },
  name: { type: String, required: true },
  description: { type: String, default: '' },

  // Pricing
  originalPrice: { type: Number, default: 0 },
  price: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },

  // Category & Details
  category: {
    type: String,
    enum: ['upper_body', 'lower_body', 'dress'],
    default: 'upper_body'
  },

  // Size Chart
  sizes: {
    type: [String],
    default: []
  },

  // Product Highlights
  highlights: {
    packOf: { type: String, default: '' },
    color: { type: String, default: '' },
    pattern: { type: String, default: 'Solid' },
    fabric: { type: String, default: '' },
    occasion: { type: String, default: '' },
    suitableFor: { type: String, default: '' }
  },

  // Images - Ordered sequence
  images: [String],
  imageUrl: { type: String, default: '' },

  productUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  inStock: { type: Boolean, default: true },
  stockNote: { type: String, default: '' },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.models.Product ||
  mongoose.model('Product', productSchema)