import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/authService';
import { 
  Camera, 
  Sparkles, 
  MessageCircle, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  Users,
  ShoppingBag
} from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const products = await productService.getProducts({ status: 'active' });
      // Get first 4 products as featured
      setFeaturedProducts(products.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  };

  const features = [
    {
      icon: <Camera className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Listing",
      description: "Snap photos and get instant descriptions, pricing suggestions, and smart categorization."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "Chat-Based Shopping",
      description: "Guided shopping experience with mix-and-match styling and smart recommendations."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Smart Pricing",
      description: "AI-driven price optimization and market analysis for maximum sales potential."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Secure Transactions",
      description: "Safe and secure payment processing with buyer protection and seller guarantees."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Sellers" },
    { number: "50K+", label: "Products Listed" },
    { number: "95%", label: "AI Accuracy" },
    { number: "4.9★", label: "User Rating" }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container" style={{ textAlign: 'center', maxWidth: 900 }}>
          <h1>
            Turn Excess Stock Into
            <span className="block" style={{ color: '#fde68a' }}>Sales</span>
          </h1>
          <p className="subtitle">
            AI-driven marketplace helping retailers sell faster with intelligent automation,
            smart pricing, and seamless buyer experiences.
          </p>
          <div className="button-row">
            <Link to="/register" className="btn btn-light">
              Start Selling <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/buyer" className="btn btn-invert">
              Start Shopping <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat">
                <div className="num">{stat.number}</div>
                <div className="muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Powered by Advanced AI</h2>
            <p className="muted" style={{ fontSize: 18, maxWidth: 800, margin: '0 auto' }}>
              Our multi-agent AI system automates listing, pricing, and customer interactions to make resale fast,
              personalized, and profitable.
            </p>
          </div>
          <div className="grid grid-4">
            {features.map((feature, index) => (
              <div key={index} className="card padded" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{feature.title}</h3>
                <p className="muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>How FlowList Works</h2>
            <p className="muted" style={{ fontSize: 18 }}>Simple, fast, and intelligent selling and buying experience</p>
          </div>
          <div className="grid grid-3">
            <div style={{ textAlign: 'center' }}>
              <div className="card padded" style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center', background: '#ede9fe', marginBottom: 12 }}>
                <Camera className="w-8 h-8" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>For Sellers</h3>
              <div style={{ display: 'grid', gap: 8, textAlign: 'left', maxWidth: 360, margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong className="btn btn-primary" style={{ padding: '0 10px' }}>1</strong><p>Snap photos of your items</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong className="btn btn-primary" style={{ padding: '0 10px' }}>2</strong><p>AI generates descriptions and pricing</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong className="btn btn-primary" style={{ padding: '0 10px' }}>3</strong><p>List automatically across channels</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong className="btn btn-primary" style={{ padding: '0 10px' }}>4</strong><p>AI handles customer interactions</p></div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="card padded" style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center', background: '#dbeafe', marginBottom: 12 }}>
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>For Buyers</h3>
              <div style={{ display: 'grid', gap: 8, textAlign: 'left', maxWidth: 360, margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong className="btn btn-secondary" style={{ padding: '0 10px' }}>1</strong><p>Chat with AI shopping assistant</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong className="btn btn-secondary" style={{ padding: '0 10px' }}>2</strong><p>Get personalized recommendations</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong className="btn btn-secondary" style={{ padding: '0 10px' }}>3</strong><p>Mix and match styling options</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong className="btn btn-secondary" style={{ padding: '0 10px' }}>4</strong><p>Secure checkout and delivery</p></div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="card padded" style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center', background: '#dcfce7', marginBottom: 12 }}>
                <Zap className="w-8 h-8" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>AI Benefits</h3>
              <div style={{ display: 'grid', gap: 8, textAlign: 'left', maxWidth: 360, margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Sparkles className="w-5 h-5" /><p>Automated listing generation</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><TrendingUp className="w-5 h-5" /><p>Dynamic pricing optimization</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><MessageCircle className="w-5 h-5" /><p>Intelligent customer support</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Shield className="w-5 h-5" /><p>Fraud detection and prevention</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #6d28d9, #2563eb)' , color: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Ready to Transform Your Retail Business?</h2>
          <p className="muted" style={{ color: '#e9e9ff', fontSize: 18, marginBottom: 16 }}>
            Join thousands of retailers already using FlowList to maximize their sales potential.
          </p>
          <div className="button-row">
            <Link to="/register" className="btn btn-light">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/buyer" className="btn btn-invert">
              Explore Products <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
