const mongoose = require('mongoose');

const marketplaceConnectionSchema = new mongoose.Schema({
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
  // Store encrypted API credentials
  credentials: {
    // For OAuth-based marketplaces (Shopify, Facebook)
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
    
    // For API key-based marketplaces (Amazon, eBay, Etsy)
    apiKey: String,
    apiSecret: String,
    sellerId: String,
    
    // Additional marketplace-specific data
    storeName: String,
    accountId: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSync: {
    type: Date
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

// Index for faster lookups
marketplaceConnectionSchema.index({ userId: 1, marketplace: 1 }, { unique: true });

marketplaceConnectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MarketplaceConnection', marketplaceConnectionSchema);

