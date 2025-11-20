import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/authService';
import { 
  Shirt, 
  Sparkles, 
  MessageCircle, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  Users,
  ShoppingBag,
  Heart,
  Tag,
  Crown,
  Wand2,
  Palette,
  Scissors,
  ShoppingCart,
  Sparkle,
  Image as ImageIcon
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const products = await productService.getProducts({ status: 'active' });
      // Get first 6 products as featured
      setFeaturedProducts(products.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  };

  const fashionCategories = [
    {
      icon: <Shirt className="w-8 h-8" />,
      name: "Tops",
      color: "#667eea",
      image: "👔"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      name: "Bags",
      color: "#764ba2",
      image: "👜"
    },
    {
      icon: <Crown className="w-8 h-8" />,
      name: "Accessories",
      color: "#2563eb",
      image: "👑"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      name: "Outerwear",
      color: "#10b981",
      image: "🧥"
    }
  ];

  const features = [
    {
      icon: <Wand2 className="w-10 h-10" />,
      title: "AI Style Assistant",
      description: "Get instant fashion recommendations and styling tips powered by AI.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      icon: <Sparkles className="w-10 h-10" />,
      title: "Smart Listing",
      description: "Upload photos and AI generates perfect descriptions and pricing.",
      gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
    },
    {
      icon: <MessageCircle className="w-10 h-10" />,
      title: "Personal Shopping",
      description: "Chat with AI to find your perfect style match and bargain prices.",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      title: "Trend Tracking",
      description: "Discover trending styles and get notified about new arrivals.",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    }
  ];

  const whatWeProvide = [
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: "AI-Powered Listings",
      description: "Upload photos and get instant, accurate product descriptions, pricing suggestions, and smart categorization powered by advanced AI.",
      color: "#667eea"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Smart Bargaining",
      description: "Chat directly with sellers, negotiate prices in real-time, and get the best deals through our integrated messaging system.",
      color: "#764ba2"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Multi-Marketplace Listing",
      description: "List your products on Amazon, Shopify, eBay, Etsy, and more - all from one platform. Maximize your reach effortlessly.",
      color: "#2563eb"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Personalized Recommendations",
      description: "AI analyzes your preferences and browsing history to suggest products that match your unique style and budget.",
      color: "#10b981"
    }
  ];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5001${imagePath}`;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Fashion Marketplace</span>
            </div>
            <h1 className="hero-title">
              Discover Your
              <span className="gradient-text"> Perfect Style</span>
          </h1>
            <p className="hero-subtitle">
              Shop pre-loved fashion, get AI-powered styling advice, and find unique pieces 
              that match your personality. Bargain, chat, and discover your next favorite look.
          </p>
            <div className="hero-buttons">
              <Link to="/buyer" className="btn-hero btn-primary-hero">
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
                <ArrowRight className="w-5 h-5" />
            </Link>
              <Link to="/register" className="btn-hero btn-secondary-hero">
                <Tag className="w-5 h-5" />
                Start Selling
            </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="fashion-showcase">
              <div className="showcase-item showcase-1">
                <div className="showcase-icon">👗</div>
                <div className="showcase-label">Trending</div>
              </div>
              <div className="showcase-item showcase-2">
                <div className="showcase-icon">👠</div>
                <div className="showcase-label">New</div>
              </div>
              <div className="showcase-item showcase-3">
                <div className="showcase-icon">👜</div>
                <div className="showcase-label">Hot</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Provide Section */}
      <section className="home-what-we-provide">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">Everything you need for a seamless fashion marketplace experience</p>
          </div>
          <div className="provide-grid">
            {whatWeProvide.map((item, index) => (
              <div key={index} className="provide-card">
                <div 
                  className="provide-icon-wrapper"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  {item.icon}
                </div>
                <h3 className="provide-title">{item.title}</h3>
                <p className="provide-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fashion Categories */}
      <section className="home-categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Explore our curated fashion collections</p>
          </div>
          <div className="categories-grid">
            {fashionCategories.map((category, index) => (
              <Link 
                key={index} 
                to={`/buyer?category=${category.name}`}
                className="category-card"
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon-wrapper" style={{ background: `${category.color}15` }}>
                  <div className="category-emoji">{category.image}</div>
                  {category.icon}
                </div>
                <h3 className="category-name">{category.name}</h3>
                <div className="category-arrow">
                  <ArrowRight className="w-5 h-5" />
              </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="home-featured">
        <div className="container">
            <div className="section-header">
              <h2 className="section-title">Trending Now</h2>
              <p className="section-subtitle">Discover what's hot in fashion right now</p>
            </div>
            <div className="products-grid">
              {featuredProducts.map((product) => {
                const imageUrl = getImageUrl(product.images?.[0]);
                return (
                  <Link 
                    key={product._id || product.id} 
                    to={`/product/${product._id || product.id}`}
                    className="product-card-featured"
                  >
                    <div className="product-image-wrapper">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.title}
                          className="product-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="product-image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                        <ImageIcon className="w-12 h-12" />
          </div>
                      {product.aiGenerated && (
                        <div className="product-badge-ai">
                          <Sparkles className="w-3 h-3" />
                          AI
              </div>
                      )}
              </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.title}</h3>
                      <div className="product-price-row">
                        <span className="product-price">${product.price}</span>
                        {product.originalPrice && (
                          <span className="product-original-price">${product.originalPrice}</span>
                        )}
            </div>
                      <div className="product-meta">
                        <span className="product-category">{product.category}</span>
                        <span className="product-condition">{product.condition}</span>
              </div>
              </div>
                  </Link>
                );
              })}
            </div>
            <div className="section-footer">
              <Link to="/buyer" className="btn-view-all">
                View All Products
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="home-cta">
        <div className="cta-background">
          <div className="cta-pattern"></div>
        </div>
        <div className="container cta-content">
          <div className="cta-icon-wrapper">
            <Sparkles className="w-16 h-16" />
          </div>
          <h2 className="cta-title">Ready to Transform Your Fashion Experience?</h2>
          <p className="cta-subtitle">
            Join thousands of fashion lovers discovering unique styles and great deals every day.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta btn-cta-primary">
              <Crown className="w-5 h-5" />
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/buyer" className="btn-cta btn-cta-secondary">
              <ShoppingBag className="w-5 h-5" />
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
