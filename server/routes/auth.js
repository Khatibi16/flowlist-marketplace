const express = require('express');
const router = express.Router();

// Mock user data for now
const users = [
  {
    id: '1',
    email: 'seller@flowlist.com',
    password: 'password123',
    role: 'seller',
    name: 'Retail Store Owner'
  },
  {
    id: '2',
    email: 'buyer@flowlist.com',
    password: 'password123',
    role: 'buyer',
    name: 'Fashion Enthusiast'
  }
];

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      token: 'mock-jwt-token-' + user.id
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Register endpoint
router.post('/register', (req, res) => {
  const { email, password, role, name } = req.body;
  
  const newUser = {
    id: (users.length + 1).toString(),
    email,
    password,
    role,
    name
  };
  
  users.push(newUser);
  
  res.json({
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    },
    token: 'mock-jwt-token-' + newUser.id
  });
});

module.exports = router;
