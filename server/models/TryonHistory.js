const mongoose = require('mongoose')

const tryonHistorySchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  product: String,
  resultImage: String,
  humanImage: String
}, { timestamps: true })

module.exports = mongoose.models.TryonHistory || 
  mongoose.model('TryonHistory', tryonHistorySchema)