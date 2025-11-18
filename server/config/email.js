const nodemailer = require('nodemailer');

// Create transporter - using Gmail as default (you can configure with your email service)
const createTransporter = () => {
  // For development, you can use Gmail or other services
  // For production, use services like SendGrid, AWS SES, etc.
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  }

  // Default: Use SMTP (works with most email providers)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD
    }
  });
};

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@flowlist.com',
      to: email,
      subject: 'FlowList - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6d28d9, #2563eb); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">FlowList</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #0f172a; margin-top: 0;">Email Verification</h2>
            <p style="color: #475569; font-size: 16px;">
              Thank you for registering with FlowList! Please use the following OTP to verify your email address:
            </p>
            <div style="background: white; border: 2px dashed #6d28d9; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h1 style="color: #6d28d9; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #475569; font-size: 14px;">
              This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          <div style="padding: 20px; background: #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} FlowList. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    // For development, if email fails, we'll still allow registration
    // In production, you should handle this properly
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Email sending failed, but continuing...');
      return { success: true, devMode: true };
    }
    throw error;
  }
};

module.exports = { sendOTPEmail };

