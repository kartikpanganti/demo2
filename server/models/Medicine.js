const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 10
  },
  barcode: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for checking if stock is low
MedicineSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.reorderLevel;
});

// Virtual for checking if expired
MedicineSchema.virtual('isExpired').get(function() {
  return this.expiryDate <= new Date();
});

// Pre-save hook to update the updatedAt field
MedicineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Medicine', MedicineSchema); 