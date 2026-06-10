const mongoose = require('mongoose')

const fabricProductSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  fabricType: String,
  price: { type: Number, required: true },
  pricePerMeter: { type: Number, default: 0 },

  // Original fabric images
  fabricImages: [String],
  fabricImageUrl: String,

  // Available garment types
  availableGarments: [{
    type: String,
    enum: [
      'shirt_full',
      'shirt_half',
      'pant',
      'kurta',
      'salwar_suit',
      'kurti',
      'saree'
    ]
  }],

  // AI Generated previews (cached)
  generatedPreviews: [{
    garmentType: String,
    imageUrl: String,
    generatedAt: { type: Date, default: Date.now }
  }],

  isActive: { type: Boolean, default: true },
  inStock: { type: Boolean, default: true },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.models.FabricProduct ||
  mongoose.model('FabricProduct', fabricProductSchema)