const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

// Mock chat data - In production, use MongoDB
let chatSessions = [
  {
    id: '1',
    buyerId: '2',
    sellerId: '1',
    productId: '1',
    messages: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to get session with product and user info
const enrichSession = async (session) => {
  try {
    const product = await Product.findById(session.productId);
    const buyer = await User.findById(session.buyerId);
    const seller = await User.findById(session.sellerId);
    
    return {
      ...session,
      productTitle: product?.title || 'Product',
      productPrice: product?.price || 0,
      originalPrice: product?.originalPrice || null,
      productImage: product?.images?.[0] || null,
      buyerName: buyer?.name || 'Buyer',
      sellerName: seller?.name || 'Seller'
    };
  } catch (error) {
    console.error('Error enriching session:', error);
    return session;
  }
};

// Get chat sessions for a user
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userSessions = chatSessions.filter(session => 
      session.buyerId === userId || session.sellerId === userId
    );
    
    // Enrich sessions with product and user info
    const enrichedSessions = await Promise.all(
      userSessions.map(async (session) => {
        const enriched = await enrichSession(session);
        const lastMessage = session.messages && session.messages.length > 0
          ? session.messages[session.messages.length - 1]
          : null;
        
        // Determine other user name
        const otherUserId = session.buyerId === userId ? session.sellerId : session.buyerId;
        const otherUser = await User.findById(otherUserId);
        
        return {
          _id: session.id,
          id: session.id,
          productId: session.productId,
          productTitle: enriched.productTitle,
          productPrice: enriched.productPrice,
          otherUserName: otherUser?.name || 'User',
          lastMessageTime: lastMessage?.timestamp || session.updatedAt,
          activeBargain: session.messages?.some(m => m.type === 'bargain_offer' && m.status === 'pending') || false,
          messages: session.messages || []
        };
      })
    );
    
    res.json(enrichedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Failed to fetch chat sessions' });
  }
});

// Get a specific chat session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = chatSessions.find(s => s.id === req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    
    const enriched = await enrichSession(session);
    const buyer = await User.findById(session.buyerId);
    const seller = await User.findById(session.sellerId);
    
    res.json({
      ...enriched,
      _id: session.id,
      id: session.id,
      otherUserName: enriched.buyerName || enriched.sellerName || 'User'
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Failed to fetch session' });
  }
});

// Get messages for a specific chat session
router.get('/:sessionId/messages', (req, res) => {
  const session = chatSessions.find(s => s.id === req.params.sessionId);
  
  if (session) {
    res.json(session.messages || []);
  } else {
    res.status(404).json({ message: 'Chat session not found' });
  }
});

// Send a message
router.post('/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params;
  const { sender, message } = req.body;
  
  const session = chatSessions.find(s => s.id === sessionId);
  
  if (session) {
    const newMessage = {
      id: (session.messages.length + 1).toString(),
      _id: (session.messages.length + 1).toString(),
      sender,
      message,
      type: 'message',
      timestamp: new Date().toISOString()
    };
    
    if (!session.messages) {
      session.messages = [];
    }
    session.messages.push(newMessage);
    session.updatedAt = new Date().toISOString();
    
    res.json(newMessage);
  } else {
    res.status(404).json({ message: 'Chat session not found' });
  }
});

// Send a bargain offer
router.post('/:sessionId/bargain/offer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { offerPrice } = req.body;
    
    const session = chatSessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    
    // Get product price
    const product = await Product.findById(session.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (offerPrice >= product.price) {
      return res.status(400).json({ message: 'Bargain price must be lower than original price' });
    }
    
    // Mark any existing pending bargains as expired
    if (session.messages) {
      session.messages.forEach(msg => {
        if (msg.type === 'bargain_offer' && msg.status === 'pending') {
          msg.status = 'expired';
        }
      });
    }
    
    const bargainMessage = {
      id: (session.messages.length + 1).toString(),
      _id: (session.messages.length + 1).toString(),
      sender: 'buyer',
      type: 'bargain_offer',
      offerPrice: parseFloat(offerPrice),
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    if (!session.messages) {
      session.messages = [];
    }
    session.messages.push(bargainMessage);
    session.updatedAt = new Date().toISOString();
    
    res.json(bargainMessage);
  } catch (error) {
    console.error('Error sending bargain offer:', error);
    res.status(500).json({ message: 'Failed to send bargain offer' });
  }
});

// Respond to a bargain offer
router.post('/:sessionId/bargain/respond', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { bargainId, action, counterPrice } = req.body;
    
    const session = chatSessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    
    const bargainMessage = session.messages.find(m => (m.id === bargainId || m._id === bargainId) && m.type === 'bargain_offer');
    
    if (!bargainMessage) {
      return res.status(404).json({ message: 'Bargain offer not found' });
    }
    
    if (action === 'accept') {
      bargainMessage.status = 'accepted';
      
      const acceptMessage = {
        id: (session.messages.length + 1).toString(),
        _id: (session.messages.length + 1).toString(),
        sender: 'seller',
        type: 'bargain_accepted',
        acceptedPrice: bargainMessage.offerPrice,
        originalBargainId: bargainId,
        timestamp: new Date().toISOString()
      };
      session.messages.push(acceptMessage);
    } else if (action === 'reject') {
      bargainMessage.status = 'rejected';
      
      const rejectMessage = {
        id: (session.messages.length + 1).toString(),
        _id: (session.messages.length + 1).toString(),
        sender: 'seller',
        type: 'bargain_rejected',
        originalBargainId: bargainId,
        timestamp: new Date().toISOString()
      };
      session.messages.push(rejectMessage);
    } else if (action === 'counter') {
      if (!counterPrice || counterPrice <= 0) {
        return res.status(400).json({ message: 'Invalid counter price' });
      }
      
      bargainMessage.status = 'countered';
      
      const counterMessage = {
        id: (session.messages.length + 1).toString(),
        _id: (session.messages.length + 1).toString(),
        sender: 'seller',
        type: 'bargain_counter',
        counterPrice: parseFloat(counterPrice),
        originalBargainId: bargainId,
        timestamp: new Date().toISOString()
      };
      session.messages.push(counterMessage);
    }
    
    session.updatedAt = new Date().toISOString();
    res.json({ success: true, message: session.messages[session.messages.length - 1] });
  } catch (error) {
    console.error('Error responding to bargain:', error);
    res.status(500).json({ message: 'Failed to respond to bargain offer' });
  }
});

// Create new chat session
router.post('/sessions', async (req, res) => {
  try {
    const { buyerId, sellerId, productId } = req.body;
    
    // Check if session already exists
    const existingSession = chatSessions.find(s => 
      s.buyerId === buyerId && s.sellerId === sellerId && s.productId === productId
    );
    
    if (existingSession) {
      const enriched = await enrichSession(existingSession);
      return res.json(enriched);
    }
    
    const newSession = {
      id: (chatSessions.length + 1).toString(),
      buyerId,
      sellerId,
      productId,
      messages: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    chatSessions.push(newSession);
    
    const enriched = await enrichSession(newSession);
    res.json(enriched);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Failed to create chat session' });
  }
});

// AI chat recommendations (keeping for backward compatibility)
router.post('/ai/recommendations', (req, res) => {
  const { message, productId } = req.body;
  
  // Mock AI responses
  let aiResponse = '';
  
  if (message.toLowerCase().includes('size')) {
    aiResponse = 'Based on your preferences, I recommend checking our size guide. This item runs true to size.';
  } else if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
    aiResponse = 'This item is currently priced competitively. You can also make a price offer to the seller!';
  } else if (message.toLowerCase().includes('style') || message.toLowerCase().includes('outfit')) {
    aiResponse = 'This item pairs perfectly with various styles. Feel free to ask the seller for styling tips!';
  } else {
    aiResponse = 'I\'d be happy to help! Could you tell me more about what you\'re looking for?';
  }
  
  res.json({
    aiResponse,
    suggestions: [
      'Ask about sizing',
      'Request more photos',
      'Check shipping options',
      'See similar items'
    ]
  });
});

module.exports = router;
