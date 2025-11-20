const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  marketplace: {
    type: String,
    required: true,
    enum: ['amazon', 'shopify', 'ebay', 'etsy', 'facebook', 'mercari']
  },
  marketplaceListingId: {
    type: String,
    // External marketplace's listing ID
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'failed', 'removed'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  },
  syncedAt: {
    type: Date,
    default: Date.now
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

marketplaceListingSchema.index({ productId: 1, marketplace: 1 });
marketplaceListingSchema.index({ userId: 1 });

marketplaceListingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);

