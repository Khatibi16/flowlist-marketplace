#!/bin/bash
echo "Creating .env file..."
cat > .env << 'ENVFILE'
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/flowlist

# JWT Secret
JWT_SECRET=flowlist-secret-key-change-in-production-12345

# Email Configuration (Optional - for OTP verification)
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
ENVFILE
echo ".env file created!"
echo ""
echo "Next steps:"
echo "1. Install MongoDB: brew tap mongodb/brew && brew install mongodb-community"
echo "2. Start MongoDB: brew services start mongodb-community"
echo "3. Restart your server"
