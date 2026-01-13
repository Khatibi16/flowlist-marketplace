import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Camera, Store, ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import './Register.css';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification, 3: Success
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setOtpLoading(true);

    try {
      const result = await authService.sendOTP(formData.email);
      if (result.success) {
        toast.success(result.message || 'OTP sent to your email!');
        setStep(2);
        setResendTimer(60); // 60 seconds countdown
        
        // Start countdown timer
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // In development, show OTP in console
        if (result.otp) {
          console.log('Development OTP:', result.otp);
          toast.success(`Development mode: OTP is ${result.otp}`, { duration: 10000 });
        }
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setOtpLoading(true);
    try {
      const result = await authService.sendOTP(formData.email);
      if (result.success) {
        toast.success('OTP resent to your email!');
        setResendTimer(60);
        
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        if (result.otp) {
          console.log('Development OTP:', result.otp);
          toast.success(`Development mode: OTP is ${result.otp}`, { duration: 10000 });
        }
      } else {
        toast.error(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);

    try {
      const verifyResult = await authService.verifyOTP(formData.email, otp);
      if (verifyResult.success) {
        // OTP verified, now register
        const result = await register(formData.email, formData.password, formData.role, formData.name, otp);
      if (result.success) {
        toast.success('Registration successful!');
          setStep(3);
          setTimeout(() => {
        navigate('/');
          }, 2000);
        } else {
          toast.error(result.message || 'Registration failed');
        }
      } else {
        toast.error(verifyResult.message || 'Invalid OTP');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  // Step 1: Registration Form
  if (step === 1) {
  return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-header">
            <div className="register-logo">
            <Logo size={48} showText={false} />
          </div>
            <h1>Create your FlowList account</h1>
            <p>
            Or{' '}
              <Link to="/login" className="login-link">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
          <form className="register-form" onSubmit={handleSendOTP}>
            {/* Role Selection */}
            <div className="form-section">
              <label className="section-label">I want to:</label>
              <div className="role-selection">
                <label className={`role-option ${formData.role === 'buyer' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={formData.role === 'buyer'}
                    onChange={handleChange}
                    className="role-input"
                  />
                  <ShoppingBag className="icon" />
                  <span>Shop</span>
                </label>
                <label className={`role-option ${formData.role === 'seller' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === 'seller'}
                    onChange={handleChange}
                    className="role-input"
                  />
                  <Store className="icon" />
                  <span>Sell</span>
                </label>
              </div>
            </div>

            {/* Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <User className="label-icon" />
                Full Name
              </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                className="form-input"
                  placeholder="Enter your full name"
                />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail className="label-icon" />
                Email address
              </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                className="form-input"
                  placeholder="Enter your email"
                />
            </div>
            
            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock className="label-icon" />
                Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock className="label-icon" />
                Confirm Password
              </label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                </button>
            </div>
          </div>

            {/* Terms */}
            <div className="terms-checkbox">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
                className="checkbox-input"
            />
              <label htmlFor="agree-terms" className="checkbox-label">
              I agree to the{' '}
                <a href="#" className="link">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="link">Privacy Policy</a>
            </label>
          </div>

            <button
              type="submit"
              disabled={otpLoading}
              className="submit-button"
            >
              {otpLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (step === 2) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-header">
            <div className="register-logo">
              <Mail className="icon" />
            </div>
            <h1>Verify your email</h1>
            <p>
              We've sent a 6-digit code to <strong>{formData.email}</strong>
            </p>
          </div>

          <div className="otp-section">
            <label htmlFor="otp" className="otp-label">
              Enter verification code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={otp}
              onChange={handleOTPChange}
              className="otp-input"
              placeholder="000000"
              autoFocus
            />

            <div className="otp-actions">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="back-button"
              >
                <ArrowLeft className="icon" />
                Back
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || otpLoading}
                className="resend-button"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || otpLoading}
              className="submit-button"
            >
              {otpLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Verify & Create Account'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="register-page">
      <div className="register-container">
        <div className="success-section">
          <div className="success-icon">
            <CheckCircle className="icon" />
          </div>
          <h1>Account Created!</h1>
          <p>Your account has been successfully created. Redirecting...</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
