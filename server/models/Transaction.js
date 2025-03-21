const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  type: {
    type: String,
    enum: ['stock-in', 'stock-out', 'adjustment', 'return', 'expired'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  updatedQuantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema); 