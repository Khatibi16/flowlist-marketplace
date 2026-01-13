# Quick Start Guide

## Current Status
- ✅ Frontend (React) is running on http://localhost:3000
- ✅ Backend server is running on http://localhost:5000
- ❌ MongoDB is NOT installed
- ❌ .env file is missing

## What You Need to Do

### Step 1: Install MongoDB (Choose ONE option)

#### Option A: Install MongoDB Locally (Recommended for Development)

```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

#### Option B: Use MongoDB Atlas (Cloud - Free, No Installation Needed)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0 - Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/flowlist`)
6. Replace `<password>` with your database password
7. Use this connection string in your `.env` file

### Step 2: Create .env File

Create a file named `.env` in the root directory (`/Users/aaqibkhatibi/flowlist-marketplace/.env`) with this content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/flowlist

# OR for MongoDB Atlas, use your connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flowlist

# JWT Secret
JWT_SECRET=flowlist-secret-key-change-in-production-12345

# Email Configuration (Optional - for OTP verification)
# In development mode, OTP will be shown in console if email is not configured
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
```

### Step 3: Restart the Server

After creating the `.env` file, restart your backend server:

```bash
# Stop the current server (Ctrl+C in the terminal running the server)
# Then restart it:
cd server
npm start
```

### Step 4: Test It!

1. Open http://localhost:3000
2. Click "Register" or go to http://localhost:3000/register
3. Fill in the registration form
4. Click "Send Verification Code"
5. **In development mode**: Check the browser console or server terminal for the OTP code
6. Enter the OTP and complete registration

## Quick MongoDB Installation (if using Option A)

Run these commands:

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list | grep mongodb
```

## Troubleshooting

### "Cannot connect to MongoDB" error
- Make sure MongoDB is running: `brew services list | grep mongodb`
- If using MongoDB Atlas, check your connection string and IP whitelist

### "OTP not received"
- In development mode, OTP is shown in the browser console (F12) and server terminal
- Email configuration is optional for development

### Server won't start
- Make sure `.env` file exists in the root directory
- Check that MongoDB is running
- Look at server terminal for error messages

## What Works Right Now

✅ Frontend UI is running
✅ Backend server is running
⏳ Waiting for MongoDB connection
⏳ Waiting for .env file

Once you complete Steps 1-3, everything will work!

