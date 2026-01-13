const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

// Mock chat data - In production, use MongoDB
// Note: This is in-memory storage. Sessions will be lost on server restart.
let chatSessions = [];

// Helper to get session with product and user info
const enrichSession = async (session) => {
  try {
    console.log('Enriching session:', session.id, 'productId:', session.productId);
    
    const product = await Product.findById(session.productId);
    const buyer = await User.findById(session.buyerId);
    const seller = await User.findById(session.sellerId);
    
    console.log('Product found:', !!product, 'Buyer found:', !!buyer, 'Seller found:', !!seller);
    
    const enriched = {
      ...session,
      productTitle: product?.title || 'Product',
      productPrice: product?.price || 0,
      originalPrice: product?.originalPrice || null,
      productImage: product?.images?.[0] || null,
      buyerName: buyer?.name || 'Buyer',
      sellerName: seller?.name || 'Seller'
    };
    
    console.log('Enriched session data:', enriched);
    return enriched;
  } catch (error) {
    console.error('Error enriching session:', error);
    console.error('Error stack:', error.stack);
    // Return session with defaults if enrichment fails
    return {
      ...session,
      productTitle: 'Product',
      productPrice: 0,
      originalPrice: null,
      productImage: null,
      buyerName: 'Buyer',
      sellerName: 'Seller'
    };
  }
};

// Get a specific chat session
// IMPORTANT: This route MUST come before /sessions/:userId to avoid conflicts
router.get('/session/:sessionId', async (req, res) => {
  try {
    const sessionId = decodeURIComponent(req.params.sessionId);
    console.log('=== FETCHING SESSION ===');
    console.log('Requested sessionId:', sessionId);
    console.log('Type:', typeof sessionId);
    console.log('Total sessions in memory:', chatSessions.length);
    console.log('Available session IDs:', chatSessions.map(s => ({ id: s.id, type: typeof s.id })));
    
    // Try to find session with exact match
    let session = chatSessions.find(s => {
      const sessionIdStr = String(s.id).trim();
      const requestedIdStr = String(sessionId).trim();
      return sessionIdStr === requestedIdStr;
    });
    
    // If not found, try without any prefix/suffix
    if (!session) {
      console.log('Exact match not found, trying alternative matching...');
      session = chatSessions.find(s => {
        const sessionIdStr = String(s.id).trim();
        const requestedIdStr = String(sessionId).trim();
        // Try matching just the numeric part or the full string
        return sessionIdStr.includes(requestedIdStr) || requestedIdStr.includes(sessionIdStr);
      });
    }
    
    if (!session) {
      console.error('❌ Session not found!');
      console.error('Requested ID:', sessionId);
      console.error('Requested ID (stringified):', String(sessionId));
      console.error('Available IDs:', chatSessions.map(s => String(s.id)));
      return res.status(404).json({ 
        message: 'Chat session not found',
        requestedId: sessionId,
        availableIds: chatSessions.map(s => s.id)
      });
    }
    
    console.log('✅ Session found:', session.id);
    
    console.log('Enriching session:', session.id);
    const enriched = await enrichSession(session);
    const buyer = await User.findById(session.buyerId);
    const seller = await User.findById(session.sellerId);
    
    // Determine other user name based on current user
    let otherUserName = 'User';
    if (buyer && seller) {
      // This will be determined on the frontend based on user role
      otherUserName = buyer.name || seller.name || 'User';
    }
    
    const response = {
      ...enriched,
      _id: session.id,
      id: session.id,
      buyerId: session.buyerId,
      sellerId: session.sellerId,
      otherUserName: otherUserName
    };
    
    console.log('Sending session response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching session:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Failed to fetch session', error: error.message });
  }
});

// Get chat sessions for a user
router.get('/sessions/:userId', async (req, res) => {
  try {
  const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Convert userId to string for comparison
    const userIdStr = String(userId);
    console.log('Fetching sessions for userId:', userIdStr);
    console.log('Available sessions:', chatSessions.length);
    
    const userSessions = chatSessions.filter(session => {
      const buyerMatch = String(session.buyerId) === userIdStr;
      const sellerMatch = String(session.sellerId) === userIdStr;
      return buyerMatch || sellerMatch;
    });
    
    console.log('Found sessions for user:', userSessions.length);
    
    // If no sessions, return empty array
    if (userSessions.length === 0) {
      return res.json([]);
    }
    
    // Enrich sessions with product and user info
    const enrichedSessions = await Promise.all(
      userSessions.map(async (session) => {
        try {
          const enriched = await enrichSession(session);
          const lastMessage = session.messages && session.messages.length > 0
            ? session.messages[session.messages.length - 1]
            : null;
          
          // Determine other user name
          const otherUserId = String(session.buyerId) === userIdStr ? session.sellerId : session.buyerId;
          const otherUser = await User.findById(otherUserId);
          
          return {
            _id: session.id,
            id: session.id,
            productId: session.productId,
            productTitle: enriched.productTitle || 'Product',
            productPrice: enriched.productPrice || 0,
            otherUserName: otherUser?.name || 'User',
            lastMessageTime: lastMessage?.timestamp || session.updatedAt,
            activeBargain: session.messages?.some(m => m.type === 'bargain_offer' && m.status === 'pending') || false,
            messages: session.messages || []
          };
        } catch (error) {
          console.error('Error enriching session:', error);
          // Return basic session info even if enrichment fails
          return {
            _id: session.id,
            id: session.id,
            productId: session.productId,
            productTitle: 'Product',
            productPrice: 0,
            otherUserName: 'User',
            lastMessageTime: session.updatedAt,
            activeBargain: false,
            messages: session.messages || []
          };
        }
      })
    );
    
    res.json(enrichedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Failed to fetch chat sessions', error: error.message });
  }
});


// Get messages for a specific chat session
router.get('/:sessionId/messages', (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    console.log('Fetching messages for session:', sessionId);
    const session = chatSessions.find(s => String(s.id) === String(sessionId));
  
  if (session) {
      console.log('Found session, returning messages:', session.messages?.length || 0);
      res.json(session.messages || []);
  } else {
      console.error('Session not found for messages:', sessionId);
    res.status(404).json({ message: 'Chat session not found' });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/:sessionId/messages', (req, res) => {
  try {
  const { sessionId } = req.params;
  const { sender, message } = req.body;
  
    console.log('Sending message to session:', sessionId);
    const session = chatSessions.find(s => String(s.id) === String(sessionId));
  
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
      
      console.log('Message added to session');
      res.json(newMessage);
    } else {
      console.error('Session not found for sending message:', sessionId);
      res.status(404).json({ message: 'Chat session not found' });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
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
    
    console.log('Creating chat session request:', { buyerId, sellerId, productId });
    
    if (!buyerId || !sellerId || !productId) {
      console.error('Missing required fields:', { buyerId: !!buyerId, sellerId: !!sellerId, productId: !!productId });
      return res.status(400).json({ message: 'buyerId, sellerId, and productId are required' });
    }
    
    // Convert IDs to strings for comparison and storage
    const buyerIdStr = String(buyerId);
    const sellerIdStr = String(sellerId);
    const productIdStr = String(productId);
    
    console.log('Converted IDs:', { buyerIdStr, sellerIdStr, productIdStr });
    
    // Check if session already exists
    const existingSession = chatSessions.find(s => 
      String(s.buyerId) === buyerIdStr && 
      String(s.sellerId) === sellerIdStr && 
      String(s.productId) === productIdStr
    );
    
    if (existingSession) {
      console.log('Found existing session:', existingSession.id);
      const enriched = await enrichSession(existingSession);
      // Ensure _id is set for frontend compatibility
      const response = {
        ...enriched,
        _id: enriched.id || enriched._id || existingSession.id,
        id: enriched.id || existingSession.id
      };
      return res.json(response);
    }
    
    // Generate unique session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newSession = {
      id: sessionId,
      buyerId: buyerIdStr,
      sellerId: sellerIdStr,
      productId: productIdStr,
    messages: [],
    status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
  };
  
    console.log('Creating new session:', newSession);
  chatSessions.push(newSession);
    console.log('Total sessions:', chatSessions.length);
    
    const enriched = await enrichSession(newSession);
    console.log('Enriched session:', enriched);
    
    // Ensure _id is set for frontend compatibility
    const response = {
      ...enriched,
      _id: enriched.id || enriched._id || sessionId,
      id: enriched.id || sessionId
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error creating session:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Failed to create chat session', error: error.message });
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
