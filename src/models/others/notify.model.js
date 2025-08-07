const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegularUser',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['PRICE_UPDATE'],
    default: 'PRICE_UPDATE'
  },
  oldPrice: Number,
  newPrice: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  delivered: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);