const express = require('express');
const router = express.Router();

// Mock chat data
let chatSessions = [
  {
    id: '1',
    buyerId: '2',
    sellerId: '1',
    productId: '1',
    messages: [
      {
        id: '1',
        sender: 'buyer',
        message: 'Hi! I love this jacket. What size is it?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        sender: 'seller',
        message: 'Hello! It\'s a medium size. The measurements are...',
        timestamp: new Date(Date.now() - 3500000).toISOString()
      }
    ],
    status: 'active',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Get chat sessions for a user
router.get('/sessions/:userId', (req, res) => {
  const { userId } = req.params;
  const userSessions = chatSessions.filter(session => 
    session.buyerId === userId || session.sellerId === userId
  );
  
  res.json(userSessions);
});

// Get messages for a specific chat session
router.get('/:sessionId/messages', (req, res) => {
  const session = chatSessions.find(s => s.id === req.params.sessionId);
  
  if (session) {
    res.json(session.messages);
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
      sender,
      message,
      timestamp: new Date().toISOString()
    };
    
    session.messages.push(newMessage);
    res.json(newMessage);
  } else {
    res.status(404).json({ message: 'Chat session not found' });
  }
});

// Create new chat session
router.post('/sessions', (req, res) => {
  const { buyerId, sellerId, productId } = req.body;
  
  const newSession = {
    id: (chatSessions.length + 1).toString(),
    buyerId,
    sellerId,
    productId,
    messages: [],
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  chatSessions.push(newSession);
  res.json(newSession);
});

// AI chat recommendations
router.post('/ai/recommendations', (req, res) => {
  const { message, productId } = req.body;
  
  // Mock AI responses based on message content
  let aiResponse = '';
  
  if (message.toLowerCase().includes('size')) {
    aiResponse = 'Based on your preferences, I recommend checking our size guide. This item runs true to size.';
  } else if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
    aiResponse = 'This item is currently priced at $45.99, which is 49% off the original retail price. Great value!';
  } else if (message.toLowerCase().includes('style') || message.toLowerCase().includes('outfit')) {
    aiResponse = 'This vintage denim jacket pairs perfectly with white tees, black jeans, or even over a dress for a casual-chic look.';
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
