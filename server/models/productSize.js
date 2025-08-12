const Mongoose = require('mongoose');
const { Schema } = Mongoose;

// Product Size Schema
const ProductSizeSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

// Index for better performance
ProductSizeSchema.index({ product: 1, name: 1 }, { unique: true });
ProductSizeSchema.index({ product: 1, isActive: 1 });

// Update the updated field on save
ProductSizeSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated = Date.now();
  }
  next();
});

module.exports = Mongoose.model('ProductSize', ProductSizeSchema);
