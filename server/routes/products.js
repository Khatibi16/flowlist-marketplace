const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, status = 'active' } = req.query;
    
    let query = { status };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      query.price = { ...query.price, ...query.price, $lte: parseFloat(maxPrice) };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .populate('sellerId', 'name email')
      .lean();

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name email')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure ratings object exists with defaults
    if (!product.ratings) {
      product.ratings = {
        average: 0,
        count: 0
      };
    }

    // Ensure reviews array exists
    if (!product.reviews) {
      product.reviews = [];
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create new product (protected - sellers only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create products' });
    }

    const {
      title,
      description,
      price,
      originalPrice,
      category,
      size,
      condition,
      images,
      aiGenerated,
      aiDescription,
      aiPricing,
      tags
    } = req.body;

    if (!title || !description || !price || !category || !size || !condition || !images || images.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = new Product({
      title,
      description,
      price,
      originalPrice,
      category,
      size,
      condition,
      images,
      sellerId: user._id,
      sellerName: user.name,
      sellerEmail: user.email,
      aiGenerated: aiGenerated || false,
      aiDescription,
      aiPricing,
      tags: tags || [],
      status: 'active'
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product (protected - seller only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the seller
    if (product.sellerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only update your own products' });
    }

    const updateData = { ...req.body };
    delete updateData.sellerId; // Prevent changing seller
    delete updateData.sellerName;
    delete updateData.sellerEmail;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product (protected - seller only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the seller
    if (product.sellerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Get seller's products (protected)
router.get('/seller/my-products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

module.exports = router;
