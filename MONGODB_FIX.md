# MongoDB Connection Fix

## Problem
Your MongoDB Atlas connection is failing because your IP address isn't whitelisted.

## Why Does This Keep Happening?

**Your IP address changes frequently** because:
- Most home internet connections use **dynamic IP addresses** (they change periodically)
- Your ISP (Internet Service Provider) may assign a new IP when:
  - Your router restarts
  - You disconnect/reconnect to the internet
  - Your ISP refreshes IP assignments (often daily)
  - You switch networks (home WiFi, mobile hotspot, etc.)

This is **normal behavior** for most residential internet connections.

## Solution

### ✅ **RECOMMENDED: Allow All IPs for Development** (Best for Daily Development)

Since your IP changes frequently, the easiest solution for development is to allow all IPs:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Select your cluster
4. Click on **"Network Access"** in the left sidebar
5. Click **"Add IP Address"**
6. Enter `0.0.0.0/0` (allows all IPs from anywhere)
7. Add a comment: "Development - Allow all IPs"
8. Click **"Confirm"**

⚠️ **Security Note**: 
- This is **safe for development** if you:
  - Use a strong database password
  - Don't expose your connection string publicly
  - Only use this for local development
- For **production**, you should whitelist specific IPs or use VPC peering

### Option 2: Whitelist Your Current IP (If you prefer more security)

1. Go to MongoDB Atlas → Network Access
2. Click **"Add IP Address"**
3. Add your current IP: `193.205.22.87`
   - Or click **"Add Current IP Address"** button
4. Click **"Confirm"**

⚠️ **Note**: You'll need to update this every time your IP changes (could be daily).

## After Whitelisting

### ⏱️ **IMPORTANT: Wait Time**

MongoDB Atlas takes **1-2 minutes** (sometimes up to 5 minutes) to update the IP whitelist. Be patient!

### 🔄 **CRITICAL: Restart Your Server**

After whitelisting your IP, you **MUST restart your server** for the connection to work:

1. **Stop your server** (press `Ctrl+C` in the terminal where it's running)
2. **Wait 1-2 minutes** for MongoDB Atlas to update
3. **Restart your server**:
   ```bash
   npm run dev
   # OR
   cd server && npm start
   ```

### ✅ Verify Connection

After restarting, you should see in your server logs:
```
✅ MongoDB Connected: [your-cluster-name]
```

If you see connection errors, run:
```bash
cd server
node check-mongodb-connection.js
```

This will test the connection and show you exactly what's wrong.

## Troubleshooting

### Still Not Working After Restart?

1. **Check MongoDB Atlas Status**:
   - Go to MongoDB Atlas → Network Access
   - Make sure your IP shows as "Active" (green checkmark)
   - Wait a few more minutes if it was just added

2. **Verify Connection String**:
   - Check your `.env` file has the correct `MONGODB_URI`
   - Make sure username/password are correct

3. **Test Connection Manually**:
   ```bash
   cd server
   node check-mongodb-connection.js
   ```

4. **Check Server Logs**:
   - Look for error messages when the server starts
   - Common errors:
     - `IP not whitelisted` → Wait longer or check Atlas
     - `Authentication failed` → Check username/password
     - `Connection timeout` → Check network or cluster status

## Quick Fix Summary

1. ✅ Whitelist IP in MongoDB Atlas (or use `0.0.0.0/0`)
2. ⏱️ Wait 1-2 minutes
3. 🔄 **Restart your server** (this is critical!)
4. ✅ Try logging in again
