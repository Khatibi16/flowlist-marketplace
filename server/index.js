const express = require('express');
const cors = require('cors');
const path = require('path');
// Load .env from root directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/database');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid AirPlay conflict

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/marketplace', require('./routes/marketplace'));

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
