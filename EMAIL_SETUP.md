# Email Setup Guide for OTP Verification

## Quick Answer

**For Development/Testing:** You can leave the email fields empty! The OTP will be shown in:
- Browser console (F12)
- Server terminal

**For Production:** You need to configure email to send OTP codes to users.

## Email Configuration Fields

In your `.env` file, you have:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=          # Your Gmail address
EMAIL_PASSWORD=      # Gmail App Password (NOT your regular password!)
EMAIL_FROM=          # Sender email (usually same as EMAIL_USER)
```

## Option 1: Set Up Gmail (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as device
4. Enter "FlowList" as the name
5. Click "Generate"
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop    # The 16-char App Password (no spaces)
EMAIL_FROM=your-email@gmail.com
```

**Important:** Use the App Password, NOT your regular Gmail password!

## Option 2: Use Other Email Providers

If you want to use a different email provider (not Gmail), update the `.env`:

```env
# Remove EMAIL_SERVICE=gmail
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@your-provider.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@your-provider.com
```

Common providers:
- **Outlook/Hotmail:** `smtp-mail.outlook.com`, port 587
- **Yahoo:** `smtp.mail.yahoo.com`, port 587
- **Custom SMTP:** Check your email provider's documentation

## Option 3: Skip Email (Development Mode)

**You can leave all email fields empty for now!**

The system will:
- Still generate OTP codes
- Show them in the browser console (F12)
- Show them in the server terminal
- Allow registration to work

This is perfect for development and testing.

## Testing Email Setup

After configuring email, test it:

1. Restart your server
2. Try registering a new account
3. Check your email inbox for the OTP code
4. If it doesn't work, check server terminal for error messages

## Troubleshooting

### "Invalid login" error
- Make sure you're using App Password, not regular password
- For Gmail, 2FA must be enabled

### "Connection timeout"
- Check your internet connection
- Verify SMTP host and port are correct

### OTP not received
- Check spam folder
- Verify email address is correct
- Check server terminal for errors
- In development, OTP is always shown in console

## Current Status

Right now, your email fields are empty, which means:
- ✅ OTP codes are still generated
- ✅ OTP codes are shown in console/terminal
- ✅ Registration works perfectly
- ❌ OTP codes are NOT sent via email

**You can use the app right now without email setup!** Email is only needed if you want OTP codes sent to users' email addresses.

