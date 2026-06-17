const mongoose = require('mongoose')

const supportChatSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  sellerName: String,
  sellerEmail: String,
  sessionId: {
    type: String,
    default: () => 'chat_' + Date.now()
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'bot', 'admin']
    },
    text: String,
    time: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['open', 'escalated', 'resolved'],
    default: 'open'
  },
  adminNotified: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.models.SupportChat ||
  mongoose.model('SupportChat', supportChatSchema)