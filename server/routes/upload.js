const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI client (will be created when needed)
let openai = null;

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file');
  }
  
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  return openai;
};

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

// Helper function to read image and convert to base64
const imageToBase64 = (imagePath) => {
  try {
    const fullPath = path.join(__dirname, '..', imagePath.replace(/^\//, ''));
    const imageBuffer = fs.readFileSync(fullPath);
    const base64Image = imageBuffer.toString('base64');
    
    // Determine MIME type from file extension
    const ext = path.extname(fullPath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    
    return {
      base64: base64Image,
      mimeType: mimeType
    };
  } catch (error) {
    console.error('Error reading image file:', error);
    throw new Error('Failed to read image file');
  }
};

// Helper function to analyze image with OpenAI Vision API
const analyzeImageWithOpenAI = async (imagePath) => {
  try {
    // Get OpenAI client (will throw if API key not configured)
    const client = getOpenAIClient();

    // Read and convert image to base64
    const { base64, mimeType } = imageToBase64(imagePath);

    // Create the prompt for product analysis
    const prompt = `Analyze this product image for a fashion marketplace listing. Extract the following information and return ONLY a valid JSON object (no markdown, no code blocks, just pure JSON):

{
  "title": "A concise, attractive product title (max 60 characters)",
  "description": "A detailed product description highlighting key features, style, materials, and appeal (2-3 sentences)",
  "category": "One of: Tops, Outerwear, Bottoms, Dresses, Shoes, Accessories, Other",
  "condition": "One of: New, Like New, Good, Fair, Poor (assess visible wear/condition)",
  "size": "One of: XS, S, M, L, XL, XXL (if visible, otherwise 'M')",
  "brand": "Brand name if visible/recognizable, otherwise null",
  "estimatedPrice": {
    "min": minimum_reasonable_price_in_USD,
    "max": maximum_reasonable_price_in_USD,
    "suggested": suggested_price_in_USD
  },
  "tags": ["array", "of", "relevant", "tags", "like", "vintage", "casual", "formal", "etc"],
  "style": "Style description (e.g., Casual, Formal, Streetwear, Vintage, etc.)",
  "season": "One of: Spring, Summer, Fall, Winter, All-season"
}

Be specific and accurate. Base your analysis on what you actually see in the image.`;

    // Call OpenAI Vision API
    const response = await client.chat.completions.create({
      model: "gpt-4o", // or "gpt-4-vision-preview" if gpt-4o is not available
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3 // Lower temperature for more consistent results
    });

    // Extract the response text
    const responseText = response.choices[0].message.content.trim();
    
    // Try to parse JSON (handle cases where response might have markdown code blocks)
    let analysisData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Validate and structure the response
    const analysis = {
      title: analysisData.title || 'Product',
      description: analysisData.description || 'A quality product ready for purchase.',
      category: analysisData.category || 'Other',
      condition: analysisData.condition || 'Good',
      size: analysisData.size || 'M',
      brand: analysisData.brand || null,
      estimatedPrice: analysisData.estimatedPrice || { min: 20, max: 100, suggested: 50 },
      tags: Array.isArray(analysisData.tags) ? analysisData.tags : [],
      style: analysisData.style || 'Contemporary',
      season: analysisData.season || 'All-season',
      confidence: 0.9, // High confidence for OpenAI Vision
      aiGenerated: true
    };

    return analysis;
  } catch (error) {
    console.error('OpenAI Vision API error:', error);
    
    // Provide helpful error messages
    if (error.message.includes('API key')) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file');
    } else if (error.message.includes('rate limit')) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.message.includes('insufficient_quota')) {
      throw new Error('OpenAI API quota exceeded. Please check your account billing.');
    } else {
      throw error;
    }
  }
};

// Enhanced AI image analysis endpoint using OpenAI Vision API
router.post('/analyze', async (req, res) => {
  try {
    const { imagePath, filename } = req.body;
    
    if (!imagePath && !filename) {
      return res.status(400).json({ success: false, message: 'Image path or filename required' });
    }

    // Use imagePath if provided, otherwise construct from filename
    const fullImagePath = imagePath || `/uploads/${filename}`;

    // Analyze image with OpenAI Vision API
    const analysis = await analyzeImageWithOpenAI(fullImagePath);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to analyze image',
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
    
    // Analyze image with OpenAI Vision API
    const analysis = await analyzeImageWithOpenAI(firstImage);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Multiple image analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to analyze images',
      error: error.message 
    });
  }
});

module.exports = router;
