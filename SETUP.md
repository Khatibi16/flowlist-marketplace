# FlowList Marketplace Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Set Up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017` by default

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/flowlist

# JWT Secret (Change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for OTP verification)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 4. Email Setup (for OTP Verification)

#### For Gmail:
1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail"
4. Use this App Password as `EMAIL_PASSWORD` in `.env`

#### For Other Email Providers:
Update the SMTP settings in `.env`:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@your-provider.com
SMTP_PASSWORD=your-password
```

**Note:** In development mode, if email sending fails, the OTP will be shown in the console and in a toast notification for testing purposes.

### 5. Create Uploads Directory

The uploads directory should be created automatically, but if it's missing:

```bash
cd server
mkdir -p uploads
```

### 6. Start the Application

#### Terminal 1 - Start Backend Server:
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

#### Terminal 2 - Start Frontend:
```bash
cd client
npm start
```

The client will run on `http://localhost:3000`

### 7. Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Features Implemented

✅ **User Registration with Email OTP Verification**
- Users must verify their email with a 6-digit OTP code
- OTP expires in 10 minutes
- Resend OTP functionality

✅ **User Authentication**
- JWT-based authentication
- Login/Logout functionality
- Protected routes

✅ **Product Management**
- Sellers can upload products with images
- Multiple image upload support
- Product CRUD operations
- Product listing with filters and search

✅ **Marketplace Features**
- Browse all products
- View product details
- Search and filter products
- Seller information displayed
- Product categories and conditions

✅ **Image Upload**
- Drag and drop image upload
- Multiple image support (up to 5 images)
- Image preview
- Images stored in `server/uploads/` directory

## Testing the Application

### 1. Register a New Account
1. Go to http://localhost:3000/register
2. Fill in your details
3. Select role (Buyer or Seller)
4. Click "Send Verification Code"
5. Check your email for OTP (or check console in dev mode)
6. Enter OTP and complete registration

### 2. Create a Product (Seller)
1. Login as a seller
2. Go to Seller Dashboard
3. Click "Add New Product"
4. Upload product images
5. Fill in product details
6. Click "Create Product"

### 3. Browse Products (Buyer)
1. Login as a buyer (or browse without login)
2. Go to Buyer Dashboard
3. Browse products
4. Use search and filters
5. Click on a product to view details

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Email Not Sending
- Check email credentials in `.env`
- For Gmail, make sure you're using an App Password
- In development mode, OTP will be shown in console/toast

### Images Not Displaying
- Make sure `server/uploads/` directory exists
- Check that images are being uploaded to the correct path
- Verify the server is serving static files from `/uploads`

### Port Already in Use
- Change `PORT` in `.env` for server
- Change `PORT` in `client/package.json` for client (or use `PORT=3001 npm start`)

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Use a production MongoDB instance
4. Configure proper email service (SendGrid, AWS SES, etc.)
5. Set up proper file storage (AWS S3, Cloudinary, etc.)
6. Enable HTTPS
7. Set up environment variables securely
8. Build the React app: `cd client && npm run build`

## Support

For issues or questions, please check:
- MongoDB logs
- Server console output
- Browser console for frontend errors
- Network tab for API errors

