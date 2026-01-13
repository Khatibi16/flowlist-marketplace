const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const MarketplaceConnection = require('../models/MarketplaceConnection');
const MarketplaceListing = require('../models/MarketplaceListing');
const Product = require('../models/Product');

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all marketplace connections for a user
router.get('/connections', authenticate, async (req, res) => {
  try {
    const connections = await MarketplaceConnection.find({ 
      userId: req.userId,
      isActive: true 
    }).select('-credentials');
    
    res.json({
      success: true,
      connections: connections.map(conn => ({
        marketplace: conn.marketplace,
        isConnected: true,
        lastSync: conn.lastSync
      }))
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ message: 'Failed to fetch connections' });
  }
});

// Connect to a marketplace (OAuth or API key)
router.post('/connect/:marketplace', authenticate, async (req, res) => {
  try {
    const { marketplace } = req.params;
    const { credentials } = req.body;

    // Validate marketplace
    const validMarketplaces = ['amazon', 'shopify', 'ebay', 'etsy', 'facebook', 'mercari'];
    if (!validMarketplaces.includes(marketplace)) {
      return res.status(400).json({ message: 'Invalid marketplace' });
    }

    // Check if connection already exists
    let connection = await MarketplaceConnection.findOne({
      userId: req.userId,
      marketplace
    });

    if (connection) {
      // Update existing connection
      connection.credentials = credentials;
      connection.isActive = true;
      connection.updatedAt = Date.now();
    } else {
      // Create new connection
      connection = new MarketplaceConnection({
        userId: req.userId,
        marketplace,
        credentials
      });
    }

    await connection.save();

    res.json({
      success: true,
      message: `Successfully connected to ${marketplace}`,
      connection: {
        marketplace: connection.marketplace,
        isActive: connection.isActive
      }
    });
  } catch (error) {
    console.error('Connect marketplace error:', error);
    res.status(500).json({ message: 'Failed to connect marketplace' });
  }
});

// Disconnect from a marketplace
router.delete('/connect/:marketplace', authenticate, async (req, res) => {
  try {
    const { marketplace } = req.params;

    await MarketplaceConnection.findOneAndUpdate(
      { userId: req.userId, marketplace },
      { isActive: false }
    );

    res.json({
      success: true,
      message: `Disconnected from ${marketplace}`
    });
  } catch (error) {
    console.error('Disconnect marketplace error:', error);
    res.status(500).json({ message: 'Failed to disconnect marketplace' });
  }
});

// List product to marketplaces
router.post('/list/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const { marketplaces } = req.body; // Array of marketplace IDs

    if (!marketplaces || !Array.isArray(marketplaces) || marketplaces.length === 0) {
      return res.status(400).json({ message: 'Please select at least one marketplace' });
    }

    // Verify product belongs to user
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (String(product.sellerId) !== String(req.userId)) {
      return res.status(403).json({ message: 'You can only list your own products' });
    }

    const results = [];
    const validMarketplaces = ['amazon', 'shopify', 'ebay', 'etsy', 'facebook', 'mercari'];

    for (const marketplace of marketplaces) {
      if (!validMarketplaces.includes(marketplace)) {
        results.push({
          marketplace,
          success: false,
          message: 'Invalid marketplace'
        });
        continue;
      }

      try {
        // Check if connection exists
        const connection = await MarketplaceConnection.findOne({
          userId: req.userId,
          marketplace,
          isActive: true
        });

        if (!connection) {
          results.push({
            marketplace,
            success: false,
            message: `Not connected to ${marketplace}. Please connect first.`
          });
          continue;
        }

        // Format product data for marketplace
        const listingData = formatProductForMarketplace(product, marketplace);

        // In a real implementation, this would call the marketplace API
        // For now, we'll simulate the listing
        const marketplaceListingId = `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Save listing record
        let listing = await MarketplaceListing.findOne({
          productId,
          marketplace
        });

        if (listing) {
          listing.marketplaceListingId = marketplaceListingId;
          listing.status = 'active';
          listing.syncedAt = Date.now();
        } else {
          listing = new MarketplaceListing({
            productId,
            userId: req.userId,
            marketplace,
            marketplaceListingId,
            status: 'active'
          });
        }

        await listing.save();

        // Update connection last sync
        connection.lastSync = Date.now();
        await connection.save();

        results.push({
          marketplace,
          success: true,
          listingId: marketplaceListingId,
          message: `Successfully listed to ${marketplace}`
        });
      } catch (error) {
        console.error(`Error listing to ${marketplace}:`, error);
        
        // Save failed listing
        await MarketplaceListing.findOneAndUpdate(
          { productId, marketplace },
          {
            status: 'failed',
            errorMessage: error.message
          },
          { upsert: true }
        );

        results.push({
          marketplace,
          success: false,
          message: error.message || `Failed to list to ${marketplace}`
        });
      }
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('List to marketplaces error:', error);
    res.status(500).json({ message: 'Failed to list product' });
  }
});

// Get listings for a product
router.get('/listings/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const listings = await MarketplaceListing.find({ productId });

    res.json({
      success: true,
      listings: listings.map(listing => ({
        marketplace: listing.marketplace,
        status: listing.status,
        listingId: listing.marketplaceListingId,
        syncedAt: listing.syncedAt
      }))
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
});

// Helper function to format product data for different marketplaces
function formatProductForMarketplace(product, marketplace) {
  const baseData = {
    title: product.title,
    description: product.description,
    price: product.price,
    images: product.images,
    condition: product.condition,
    category: product.category
  };

  // Marketplace-specific formatting
  switch (marketplace) {
    case 'amazon':
      return {
        ...baseData,
        // Amazon requires specific fields
        sku: `FL-${product._id}`,
        quantity: 1,
        productType: 'Clothing',
        conditionType: mapConditionToAmazon(product.condition)
      };

    case 'shopify':
      return {
        ...baseData,
        product: {
          title: product.title,
          body_html: product.description,
          vendor: product.sellerName,
          product_type: product.category,
          variants: [{
            price: product.price.toString(),
            inventory_quantity: 1,
            option1: product.size
          }],
          images: product.images.map(img => ({ src: `http://localhost:5001${img}` }))
        }
      };

    case 'ebay':
      return {
        ...baseData,
        Item: {
          Title: product.title,
          Description: product.description,
          StartPrice: product.price,
          ConditionID: mapConditionToEbay(product.condition),
          PrimaryCategory: { CategoryID: mapCategoryToEbay(product.category) },
          PictureDetails: { PictureURL: product.images.map(img => `http://localhost:5001${img}`) }
        }
      };

    case 'etsy':
      return {
        ...baseData,
        title: product.title,
        description: product.description,
        price: product.price,
        quantity: 1,
        who_made: 'someone_else',
        when_made: '2020_2024',
        taxonomy_id: mapCategoryToEtsy(product.category)
      };

    case 'facebook':
      return {
        ...baseData,
        name: product.title,
        description: product.description,
        price: product.price,
        currency: 'USD',
        availability: 'in stock',
        condition: product.condition.toLowerCase(),
        image_url: product.images[0] ? `http://localhost:5001${product.images[0]}` : null
      };

    case 'mercari':
      return {
        ...baseData,
        name: product.title,
        detail: product.description,
        price: product.price,
        category_id: mapCategoryToMercari(product.category),
        item_condition_id: mapConditionToMercari(product.condition)
      };

    default:
      return baseData;
  }
}

// Helper functions to map conditions and categories
function mapConditionToAmazon(condition) {
  const mapping = {
    'New': 'New',
    'Like New': 'New',
    'Good': 'UsedLikeNew',
    'Fair': 'UsedGood',
    'Poor': 'UsedAcceptable'
  };
  return mapping[condition] || 'UsedGood';
}

function mapConditionToEbay(condition) {
  const mapping = {
    'New': 1000,
    'Like New': 1500,
    'Good': 3000,
    'Fair': 4000,
    'Poor': 5000
  };
  return mapping[condition] || 3000;
}

function mapConditionToMercari(condition) {
  const mapping = {
    'New': 1,
    'Like New': 2,
    'Good': 3,
    'Fair': 4,
    'Poor': 5
  };
  return mapping[condition] || 3;
}

function mapCategoryToEbay(category) {
  // Simplified mapping - in production, use eBay's category API
  return '11450'; // Clothing, Shoes & Accessories
}

function mapCategoryToEtsy(category) {
  // Simplified mapping - in production, use Etsy's taxonomy API
  return '69150467'; // Clothing
}

function mapCategoryToMercari(category) {
  // Simplified mapping
  return '1'; // Clothing
}

module.exports = router;

