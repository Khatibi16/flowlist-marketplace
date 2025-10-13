const express = require('express');
const router = express.Router();

// Mock product data
let products = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    description: 'Classic blue denim jacket with vintage wash',
    price: 45.99,
    originalPrice: 89.99,
    category: 'Outerwear',
    size: 'M',
    condition: 'Excellent',
    images: ['/images/jacket1.jpg', '/images/jacket2.jpg'],
    sellerId: '1',
    aiGenerated: true,
    aiDescription: 'This vintage-inspired denim jacket features a classic blue wash with subtle fading and authentic distressing. Perfect for layering over casual outfits.',
    aiPricing: {
      suggested: 45.99,
      confidence: 0.85,
      marketRange: [40, 60]
    },
    tags: ['vintage', 'denim', 'casual', 'jacket'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Silk Blouse',
    description: 'Elegant silk blouse in navy blue',
    price: 32.50,
    originalPrice: 65.00,
    category: 'Tops',
    size: 'S',
    condition: 'Like New',
    images: ['/images/blouse1.jpg'],
    sellerId: '1',
    aiGenerated: true,
    aiDescription: 'Luxurious silk blouse with a sophisticated navy blue color. Features a classic collar and button-down design perfect for professional or elegant occasions.',
    aiPricing: {
      suggested: 32.50,
      confidence: 0.92,
      marketRange: [25, 45]
    },
    tags: ['silk', 'blouse', 'professional', 'elegant'],
    createdAt: new Date().toISOString()
  }
];

// Get all products
router.get('/', (req, res) => {
  const { category, minPrice, maxPrice, search } = req.query;
  
  let filteredProducts = products;
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  res.json(filteredProducts);
});

// Get single product
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Create new product (for sellers)
router.post('/', (req, res) => {
  const newProduct = {
    id: (products.length + 1).toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  res.json(newProduct);
});

// Update product
router.put('/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex !== -1) {
    products[productIndex] = { ...products[productIndex], ...req.body };
    res.json(products[productIndex]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Delete product
router.delete('/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    res.json({ message: 'Product deleted successfully' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

module.exports = router;
