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
    // imagePath comes as "/uploads/filename.jpg"
    // We need to construct the full path from server root
    // __dirname is server/routes, so we go up two levels to get to server root
    const serverRoot = path.join(__dirname, '..');
    const imagePathWithoutLeadingSlash = imagePath.replace(/^\//, '');
    const fullPath = path.join(serverRoot, imagePathWithoutLeadingSlash);
    
    console.log('📸 Attempting to read image from:', fullPath);
    console.log('📸 Image path received:', imagePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error('❌ Image file does not exist at:', fullPath);
      throw new Error(`Image file not found at ${fullPath}`);
    }
    
    const imageBuffer = fs.readFileSync(fullPath);
    console.log('✅ Image file read successfully, size:', imageBuffer.length, 'bytes');
    
    const base64Image = imageBuffer.toString('base64');
    
    // Determine MIME type from file extension
    const ext = path.extname(fullPath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    
    console.log('✅ Image converted to base64, MIME type:', mimeType);
    
    return {
      base64: base64Image,
      mimeType: mimeType
    };
  } catch (error) {
    console.error('❌ Error reading image file:', error.message);
    console.error('❌ Stack:', error.stack);
    throw new Error(`Failed to read image file: ${error.message}`);
  }
};

// Helper function to analyze image with OpenAI Vision API
const analyzeImageWithOpenAI = async (imagePath) => {
  try {
    console.log('🤖 Starting OpenAI Vision API analysis for:', imagePath);
    
    // Get OpenAI client (will throw if API key not configured)
    const client = getOpenAIClient();
    console.log('✅ OpenAI client initialized');

    // Read and convert image to base64
    const { base64, mimeType } = imageToBase64(imagePath);
    console.log('✅ Image converted to base64, sending to OpenAI...');

    // Create the prompt for product analysis - make it very specific to avoid generic responses
    const prompt = `You are analyzing a product image for a fashion marketplace. Look carefully at the image and provide SPECIFIC details about what you see. Do NOT give generic descriptions - be precise about colors, patterns, materials, style, and condition.

Return ONLY a valid JSON object (no markdown, no code blocks, no explanations, just pure JSON):

{
  "title": "A specific, descriptive product title based on what you see (max 60 characters). Be specific about color, style, type.",
  "description": "A detailed 2-3 sentence description. Mention specific colors, patterns, materials, design details, and style you observe in the image.",
  "category": "One of: Tops, Outerwear, Bottoms, Dresses, Shoes, Accessories, Other",
  "condition": "One of: New, Like New, Good, Fair, Poor - assess based on visible wear, wrinkles, fading, or damage in the image",
  "size": "One of: XS, S, M, L, XL, XXL - only if size label is visible, otherwise 'M'",
  "brand": "Exact brand name if logo/label is visible, otherwise null",
  "estimatedPrice": {
    "min": minimum_reasonable_price_in_USD_based_on_visible_quality_and_condition,
    "max": maximum_reasonable_price_in_USD_based_on_visible_quality_and_condition,
    "suggested": suggested_price_in_USD_based_on_visible_quality_and_condition
  },
  "tags": ["specific", "tags", "based", "on", "what", "you", "see", "like", "color", "pattern", "style", "material"],
  "style": "Specific style description based on what you see (e.g., 'Casual Denim', 'Formal Blazer', 'Streetwear Sneakers', 'Vintage Floral')",
  "season": "One of: Spring, Summer, Fall, Winter, All-season"
}

IMPORTANT: Analyze the ACTUAL image content. Describe what you see, not generic product descriptions. Each image should get a unique analysis based on its specific visual content.`;

    // Call OpenAI Vision API - try gpt-4o first, fallback to gpt-4o-mini or gpt-4-vision-preview
    console.log('📤 Sending request to OpenAI Vision API...');
    console.log('📊 Base64 length:', base64.length, 'chars');
    
    let response;
    const models = ["gpt-4o", "gpt-4o-mini", "gpt-4-vision-preview"];
    let lastError = null;
    
    for (const model of models) {
      try {
        console.log(`🔄 Trying model: ${model}`);
        response = await client.chat.completions.create({
          model: model,
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
          temperature: 0.5 // Slightly higher for more variation between images
        });
        console.log(`✅ Successfully used model: ${model}`);
        break;
      } catch (modelError) {
        console.log(`❌ Model ${model} failed:`, modelError.message);
        lastError = modelError;
        // If it's a model not found error, try next model
        if (modelError.message && modelError.message.includes('model')) {
          continue;
        }
        // If it's another error, throw it
        throw modelError;
      }
    }
    
    if (!response) {
      throw lastError || new Error('All models failed');
    }

    console.log('✅ Received response from OpenAI');
    
    // Extract the response text
    const responseText = response.choices[0].message.content.trim();
    console.log('📝 OpenAI response (first 200 chars):', responseText.substring(0, 200));
    
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

    console.log('✅ Analysis complete:', {
      title: analysis.title,
      category: analysis.category,
      description: analysis.description.substring(0, 50) + '...'
    });

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
    
    console.log('📥 Analyze request received:', { imagePath, filename });
    
    if (!imagePath && !filename) {
      return res.status(400).json({ success: false, message: 'Image path or filename required' });
    }

    // Use imagePath if provided, otherwise construct from filename
    const fullImagePath = imagePath || `/uploads/${filename}`;
    
    console.log('🔍 Using image path:', fullImagePath);

    // Analyze image with OpenAI Vision API
    const analysis = await analyzeImageWithOpenAI(fullImagePath);
    
    console.log('✅ Sending analysis result to client');
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('❌ AI Analysis error:', error.message);
    console.error('❌ Error stack:', error.stack);
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
