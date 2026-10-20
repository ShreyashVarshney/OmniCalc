const mongoose = require('mongoose');

const CalculationSchema = new mongoose.Schema(
  {
    expression: {
      type: String,
      required: [true, 'Calculation expression is required'],
      trim: true,
    },
    result: {
      type: String,
      required: [true, 'Calculation result is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['standard', 'scientific', 'converter'],
      default: 'standard',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: 'General',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast query of history ordered by recency
CalculationSchema.index({ createdAt: -1 });
CalculationSchema.index({ isFavorite: 1, createdAt: -1 });

module.exports = mongoose.model('Calculation', CalculationSchema);
