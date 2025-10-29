import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', width: 48, height: 48 }} className="brand-badge">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h2 style={{ marginTop: 16, fontSize: 28, fontWeight: 700, color: '#0f172a' }}>Sign in to FlowList</h2>
          <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
            Or <Link to="/register" className="nav-link" style={{ color: 'var(--color-primary)' }}>create a new account</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card padded">
          <div className="form-field">
            <label htmlFor="email" className="label">Email address</label>
            <div className="input-icon-left">
              <Mail className="icon" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password" className="label">Password</label>
            <div className="input-icon-left" style={{ position: 'relative' }}>
              <Lock className="icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Enter your password"
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <label htmlFor="remember-me" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#111827' }}>
              <input id="remember-me" name="remember-me" type="checkbox" />
              Remember me
            </label>
            <div>
              <Link to="/forgot-password" className="nav-link" style={{ color: 'var(--color-primary)', fontSize: 14 }}>
                Forgot your password?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
            {loading ? <div className="loading"></div> : 'Sign in'}
          </button>

          <div style={{ marginTop: 16 }}>
            <div style={{ height: 1, background: '#e5e7eb', marginBottom: 8 }} />
            <div style={{ textAlign: 'center', fontSize: 12 }} className="muted">Demo Credentials</div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
              <div className="card padded" style={{ textAlign: 'center' }}>
                <p className="muted" style={{ fontSize: 12 }}>Seller Account</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>seller@flowlist.com</p>
                <p className="muted" style={{ fontSize: 12 }}>password123</p>
              </div>
              <div className="card padded" style={{ textAlign: 'center' }}>
                <p className="muted" style={{ fontSize: 12 }}>Buyer Account</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>buyer@flowlist.com</p>
                <p className="muted" style={{ fontSize: 12 }}>password123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
