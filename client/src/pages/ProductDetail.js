import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  ShoppingBag, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Sparkles,
  Camera,
  Tag,
  Calendar,
  ArrowLeft,
  Check
} from 'lucide-react';
import { productService, chatService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await productService.getProduct(id);
      setProduct(data);
    } catch (error) {
      toast.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    setFavorite(!favorite);
    toast.success(favorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleStartChat = async () => {
    if (!user) {
      toast.error('Please login to chat with the seller');
      navigate('/login');
      return;
    }

    if (user.role === 'seller') {
      toast.error('You cannot chat with yourself');
      return;
    }

    try {
      const session = await chatService.createChatSession(
        user._id || user.id,
        product.seller._id || product.sellerId,
        product._id || product.id
      );
      navigate(`/chat/${session._id || session.id}`);
    } catch (error) {
      console.error('Failed to create chat session:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/buyer')} className="back-to-shop-btn">
            <ArrowLeft className="icon" />
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Back Button */}
        <button onClick={() => navigate('/buyer')} className="back-button">
          <ArrowLeft className="icon" />
          Back to Shop
        </button>

        {/* Main Product Section */}
        <div className="product-main-section">
          {/* Product Images */}
          <div className="product-images-section">
            <div className="main-image-wrapper">
              <img
                src={product.images?.[selectedImage] ? `http://localhost:5001${product.images[selectedImage]}` : '/placeholder-image.jpg'}
                alt={product.title}
                className="main-product-image"
                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
              />
              {product.aiGenerated && (
                <div className="ai-badge">
                  <Sparkles className="icon" />
                  AI Generated
                </div>
              )}
              {discount > 0 && (
                <div className="discount-badge">
                  -{discount}%
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`thumbnail-item ${selectedImage === index ? 'active' : ''}`}
                  >
                    <img
                      src={image.startsWith('http') ? image : `http://localhost:5001${image}`}
                      alt={`${product.title} ${index + 1}`}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <div className="product-title-row">
                <h1 className="product-title">{product.title}</h1>
                <button
                  onClick={handleFavorite}
                  className={`favorite-button ${favorite ? 'active' : ''}`}
                  aria-label="Add to favorites"
                >
                  <Heart className="icon" />
                </button>
              </div>
              
              <div className="product-meta">
                <div className="rating-section">
                  <Star className="icon filled" />
                  <span className="rating-value">4.8</span>
                  <span className="rating-count">(127 reviews)</span>
                </div>
                <button className="share-button">
                  <Share2 className="icon" />
                  Share
                </button>
              </div>
            </div>

            {/* Price Section */}
            <div className="price-section">
              <div className="price-row">
                <span className="current-price">${product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="original-price">${product.originalPrice}</span>
                    {discount > 0 && (
                      <span className="save-badge">
                        Save ${(product.originalPrice - product.price).toFixed(2)}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* AI Description */}
            {product.description && (
              <div className="ai-description-card">
                <div className="ai-description-header">
                  <Sparkles className="icon" />
                  <span>Product Description</span>
                </div>
                <p className="ai-description-text">{product.description}</p>
              </div>
            )}

            {/* Size Selection */}
            <div className="size-selection-section">
              <label className="section-label">Size <span className="required">*</span></label>
              <div className="size-buttons">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                  >
                    {size}
                    {selectedSize === size && <Check className="check-icon" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                onClick={handleAddToCart}
                className="add-to-cart-button"
              >
                <ShoppingBag className="icon" />
                Add to Cart
              </button>
              <button
                onClick={handleStartChat}
                className="chat-button"
              >
                <MessageCircle className="icon" />
                Chat with Seller
              </button>
            </div>

            {/* Product Details */}
            <div className="product-details-card">
              <h3 className="details-title">Product Details</h3>
              <div className="details-list">
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{product.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Condition</span>
                  <span className="detail-value">{product.condition}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Size</span>
                  <span className="detail-value">{product.size}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Listed</span>
                  <span className="detail-value">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="tags-section">
                <h4 className="tags-title">Tags</h4>
                <div className="tags-list">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="feature-card">
            <Truck className="icon" />
            <h3>Free Shipping</h3>
            <p>On orders over $50</p>
          </div>
          <div className="feature-card">
            <RotateCcw className="icon" />
            <h3>Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
          <div className="feature-card">
            <Shield className="icon" />
            <h3>Secure Payment</h3>
            <p>Protected transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
