import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Camera, Store, ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Create your FlowList account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                sign in to your existing account
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer ${
                    formData.role === 'buyer' ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={formData.role === 'buyer'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <ShoppingBag className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium">Shop</span>
                  </label>
                  <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer ${
                    formData.role === 'seller' ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="seller"
                      checked={formData.role === 'seller'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Store className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium">Sell</span>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-purple-600 hover:text-purple-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-purple-600 hover:text-purple-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={otpLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? (
                  <div className="loading"></div>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Verify your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a 6-digit code to <strong>{formData.email}</strong>
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength="6"
                value={otp}
                onChange={handleOTPChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || otpLoading}
                className="text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || otpLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpLoading ? (
                <div className="loading"></div>
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Account Created!
          </h2>
          <p className="text-gray-600">
            Your account has been successfully created. Redirecting...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
