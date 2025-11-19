const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload single image
router.post('/single', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`
  });
});

// Upload multiple images
router.post('/multiple', upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  const uploadedFiles = req.files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    path: `/uploads/${file.filename}`
  }));
  
  res.json({
    success: true,
    files: uploadedFiles
  });
});

// Enhanced AI image analysis endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { imagePath, filename } = req.body;
    
    if (!imagePath && !filename) {
      return res.status(400).json({ success: false, message: 'Image path or filename required' });
    }

    // In a real implementation, you would:
    // 1. Use a computer vision API (Google Vision, AWS Rekognition, Clarifai, etc.)
    // 2. Or use a machine learning model (TensorFlow, PyTorch)
    // 3. Analyze the image for: objects, colors, style, brand, condition, etc.
    
    // For now, we'll create a smart mock that analyzes the filename and provides realistic suggestions
    const imageName = filename || imagePath || '';
    const lowerName = imageName.toLowerCase();
    
    // Smart category detection based on filename/keywords
    let detectedCategory = 'Other';
    let detectedTitle = 'Product';
    let detectedDescription = '';
    let detectedTags = [];
    let detectedCondition = 'Good';
    let detectedSize = 'M';
    let priceRange = { min: 20, max: 100, suggested: 50 };
    
    // Category and product type detection
    if (lowerName.includes('jacket') || lowerName.includes('coat')) {
      detectedCategory = 'Outerwear';
      detectedTitle = 'Stylish Jacket';
      detectedDescription = 'High-quality jacket with excellent craftsmanship and modern design. Perfect for layering and versatile styling.';
      detectedTags = ['jacket', 'outerwear', 'fashion', 'style'];
      priceRange = { min: 40, max: 150, suggested: 75 };
    } else if (lowerName.includes('shirt') || lowerName.includes('blouse') || lowerName.includes('top')) {
      detectedCategory = 'Tops';
      detectedTitle = 'Fashionable Top';
      detectedDescription = 'Elegant and comfortable top with great fit. Versatile piece that works for various occasions.';
      detectedTags = ['top', 'shirt', 'casual', 'fashion'];
      priceRange = { min: 15, max: 80, suggested: 35 };
    } else if (lowerName.includes('pant') || lowerName.includes('jean') || lowerName.includes('trouser')) {
      detectedCategory = 'Bottoms';
      detectedTitle = 'Quality Pants';
      detectedDescription = 'Well-fitted pants with excellent material quality. Comfortable and stylish for everyday wear.';
      detectedTags = ['pants', 'bottoms', 'casual', 'comfort'];
      priceRange = { min: 25, max: 100, suggested: 50 };
    } else if (lowerName.includes('dress')) {
      detectedCategory = 'Dresses';
      detectedTitle = 'Beautiful Dress';
      detectedDescription = 'Elegant dress with flattering silhouette. Perfect for special occasions or everyday elegance.';
      detectedTags = ['dress', 'elegant', 'fashion', 'style'];
      priceRange = { min: 30, max: 120, suggested: 60 };
    } else if (lowerName.includes('shoe') || lowerName.includes('boot') || lowerName.includes('sneaker')) {
      detectedCategory = 'Shoes';
      detectedTitle = 'Quality Footwear';
      detectedDescription = 'Comfortable and stylish footwear with excellent support. Great condition and ready to wear.';
      detectedTags = ['shoes', 'footwear', 'comfort', 'style'];
      priceRange = { min: 30, max: 150, suggested: 70 };
    } else if (lowerName.includes('bag') || lowerName.includes('purse') || lowerName.includes('accessory')) {
      detectedCategory = 'Accessories';
      detectedTitle = 'Stylish Accessory';
      detectedDescription = 'Beautiful accessory that adds the perfect finishing touch to any outfit. High-quality materials.';
      detectedTags = ['accessory', 'fashion', 'style', 'trendy'];
      priceRange = { min: 10, max: 80, suggested: 35 };
    } else if (lowerName.includes('leather')) {
      detectedCategory = 'Outerwear';
      detectedTitle = 'Leather Item';
      detectedDescription = 'Genuine leather item with premium quality. Classic design that never goes out of style.';
      detectedTags = ['leather', 'premium', 'classic', 'quality'];
      priceRange = { min: 50, max: 300, suggested: 120 };
    } else if (lowerName.includes('denim') || lowerName.includes('jean')) {
      detectedCategory = 'Bottoms';
      detectedTitle = 'Denim Item';
      detectedDescription = 'Classic denim piece with timeless appeal. Versatile and durable, perfect for casual wear.';
      detectedTags = ['denim', 'casual', 'classic', 'versatile'];
      priceRange = { min: 25, max: 90, suggested: 45 };
    } else if (lowerName.includes('vintage')) {
      detectedTitle = 'Vintage Item';
      detectedDescription = 'Authentic vintage piece with unique character. One-of-a-kind item with great style.';
      detectedTags = ['vintage', 'unique', 'retro', 'classic'];
      priceRange = { min: 30, max: 150, suggested: 70 };
      detectedCondition = 'Good';
    }
    
    // Condition detection
    if (lowerName.includes('new') || lowerName.includes('unworn')) {
      detectedCondition = 'New';
    } else if (lowerName.includes('excellent') || lowerName.includes('perfect')) {
      detectedCondition = 'Like New';
    } else if (lowerName.includes('worn') || lowerName.includes('used')) {
      detectedCondition = 'Good';
    }
    
    // Size detection (if mentioned in filename)
    const sizeMatch = lowerName.match(/\b(xs|s|m|l|xl|xxl)\b/);
    if (sizeMatch) {
      detectedSize = sizeMatch[1].toUpperCase();
    }
    
    // Brand detection (common brands)
    const brands = ['nike', 'adidas', 'gucci', 'prada', 'versace', 'chanel', 'dior', 'fendi', 'puma', 'reebok', 'levi', 'calvin', 'ralph'];
    let detectedBrand = null;
    for (const brand of brands) {
      if (lowerName.includes(brand)) {
        detectedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
        break;
      }
    }
    
    // Enhanced description with brand if detected
    if (detectedBrand) {
      detectedDescription = `${detectedBrand} ${detectedDescription.toLowerCase()}`;
      detectedTags.push(detectedBrand.toLowerCase());
    }
    
    // Generate title with brand if available
    if (detectedBrand) {
      detectedTitle = `${detectedBrand} ${detectedTitle}`;
    }
    
    const analysis = {
      title: detectedTitle,
      description: detectedDescription,
      category: detectedCategory,
      condition: detectedCondition,
      size: detectedSize,
      brand: detectedBrand,
      estimatedPrice: priceRange,
      tags: detectedTags,
      style: 'Contemporary',
      season: 'All-season',
      confidence: 0.85,
      aiGenerated: true
    };
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze image',
      error: error.message 
    });
  }
});

// Analyze multiple images (uses first image for analysis)
router.post('/analyze-multiple', async (req, res) => {
  try {
    const { imagePaths } = req.body;
    
    if (!imagePaths || imagePaths.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }
    
    // Analyze the first image
    const firstImage = imagePaths[0];
    const filename = firstImage.split('/').pop();
    
    // Reuse the same analysis logic by calling analyze endpoint logic
    const imageName = filename || firstImage || '';
    const lowerName = imageName.toLowerCase();
    
    // Smart category detection based on filename/keywords (same logic as /analyze)
    let detectedCategory = 'Other';
    let detectedTitle = 'Product';
    let detectedDescription = '';
    let detectedTags = [];
    let detectedCondition = 'Good';
    let detectedSize = 'M';
    let priceRange = { min: 20, max: 100, suggested: 50 };
    
    // Category and product type detection (same as /analyze endpoint)
    if (lowerName.includes('jacket') || lowerName.includes('coat')) {
      detectedCategory = 'Outerwear';
      detectedTitle = 'Stylish Jacket';
      detectedDescription = 'High-quality jacket with excellent craftsmanship and modern design. Perfect for layering and versatile styling.';
      detectedTags = ['jacket', 'outerwear', 'fashion', 'style'];
      priceRange = { min: 40, max: 150, suggested: 75 };
    } else if (lowerName.includes('shirt') || lowerName.includes('blouse') || lowerName.includes('top')) {
      detectedCategory = 'Tops';
      detectedTitle = 'Fashionable Top';
      detectedDescription = 'Elegant and comfortable top with great fit. Versatile piece that works for various occasions.';
      detectedTags = ['top', 'shirt', 'casual', 'fashion'];
      priceRange = { min: 15, max: 80, suggested: 35 };
    } else if (lowerName.includes('pant') || lowerName.includes('jean') || lowerName.includes('trouser')) {
      detectedCategory = 'Bottoms';
      detectedTitle = 'Quality Pants';
      detectedDescription = 'Well-fitted pants with excellent material quality. Comfortable and stylish for everyday wear.';
      detectedTags = ['pants', 'bottoms', 'casual', 'comfort'];
      priceRange = { min: 25, max: 100, suggested: 50 };
    } else if (lowerName.includes('dress')) {
      detectedCategory = 'Dresses';
      detectedTitle = 'Beautiful Dress';
      detectedDescription = 'Elegant dress with flattering silhouette. Perfect for special occasions or everyday elegance.';
      detectedTags = ['dress', 'elegant', 'fashion', 'style'];
      priceRange = { min: 30, max: 120, suggested: 60 };
    } else if (lowerName.includes('shoe') || lowerName.includes('boot') || lowerName.includes('sneaker')) {
      detectedCategory = 'Shoes';
      detectedTitle = 'Quality Footwear';
      detectedDescription = 'Comfortable and stylish footwear with excellent support. Great condition and ready to wear.';
      detectedTags = ['shoes', 'footwear', 'comfort', 'style'];
      priceRange = { min: 30, max: 150, suggested: 70 };
    } else if (lowerName.includes('bag') || lowerName.includes('purse') || lowerName.includes('accessory')) {
      detectedCategory = 'Accessories';
      detectedTitle = 'Stylish Accessory';
      detectedDescription = 'Beautiful accessory that adds the perfect finishing touch to any outfit. High-quality materials.';
      detectedTags = ['accessory', 'fashion', 'style', 'trendy'];
      priceRange = { min: 10, max: 80, suggested: 35 };
    } else if (lowerName.includes('leather')) {
      detectedCategory = 'Outerwear';
      detectedTitle = 'Leather Item';
      detectedDescription = 'Genuine leather item with premium quality. Classic design that never goes out of style.';
      detectedTags = ['leather', 'premium', 'classic', 'quality'];
      priceRange = { min: 50, max: 300, suggested: 120 };
    } else if (lowerName.includes('denim') || lowerName.includes('jean')) {
      detectedCategory = 'Bottoms';
      detectedTitle = 'Denim Item';
      detectedDescription = 'Classic denim piece with timeless appeal. Versatile and durable, perfect for casual wear.';
      detectedTags = ['denim', 'casual', 'classic', 'versatile'];
      priceRange = { min: 25, max: 90, suggested: 45 };
    } else if (lowerName.includes('vintage')) {
      detectedTitle = 'Vintage Item';
      detectedDescription = 'Authentic vintage piece with unique character. One-of-a-kind item with great style.';
      detectedTags = ['vintage', 'unique', 'retro', 'classic'];
      priceRange = { min: 30, max: 150, suggested: 70 };
      detectedCondition = 'Good';
    }
    
    // Condition detection
    if (lowerName.includes('new') || lowerName.includes('unworn')) {
      detectedCondition = 'New';
    } else if (lowerName.includes('excellent') || lowerName.includes('perfect')) {
      detectedCondition = 'Like New';
    } else if (lowerName.includes('worn') || lowerName.includes('used')) {
      detectedCondition = 'Good';
    }
    
    // Size detection
    const sizeMatch = lowerName.match(/\b(xs|s|m|l|xl|xxl)\b/);
    if (sizeMatch) {
      detectedSize = sizeMatch[1].toUpperCase();
    }
    
    // Brand detection
    const brands = ['nike', 'adidas', 'gucci', 'prada', 'versace', 'chanel', 'dior', 'fendi', 'puma', 'reebok', 'levi', 'calvin', 'ralph'];
    let detectedBrand = null;
    for (const brand of brands) {
      if (lowerName.includes(brand)) {
        detectedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
        break;
      }
    }
    
    if (detectedBrand) {
      detectedDescription = `${detectedBrand} ${detectedDescription.toLowerCase()}`;
      detectedTags.push(detectedBrand.toLowerCase());
      detectedTitle = `${detectedBrand} ${detectedTitle}`;
    }
    
  const analysis = {
      title: detectedTitle,
      description: detectedDescription,
      category: detectedCategory,
      condition: detectedCondition,
      size: detectedSize,
      brand: detectedBrand,
      estimatedPrice: priceRange,
      tags: detectedTags,
      style: 'Contemporary',
    season: 'All-season',
      confidence: 0.85,
      aiGenerated: true
  };
  
  res.json({
    success: true,
    analysis
  });
  } catch (error) {
    console.error('Multiple image analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze images',
      error: error.message 
    });
  }
});

module.exports = router;
