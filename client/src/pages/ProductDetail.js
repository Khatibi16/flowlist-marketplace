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
  Check,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  X
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [bargainPrice, setBargainPrice] = useState(null);

  useEffect(() => {
    fetchProduct();
    // Check for bargain price in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const bargainPriceParam = urlParams.get('bargainPrice');
    if (bargainPriceParam) {
      setBargainPrice(parseFloat(bargainPriceParam));
    }
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

  const getProductUrl = () => {
    return `${window.location.origin}/product/${id}`;
  };

  const handleShare = async () => {
    const url = getProductUrl();
    const title = product.title;
    const text = `Check out ${title} on FlowList!`;

    // Try Web Share API first (works on mobile and some desktop browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url
        });
        return;
      } catch (error) {
        // User cancelled or error occurred, fall back to modal
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }

    // Fall back to share modal
    setShowShareModal(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      toast.success('Link copied to clipboard!');
      setShowShareModal(false);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const shareToSocial = (platform) => {
    const url = encodeURIComponent(getProductUrl());
    const title = encodeURIComponent(product.title);
    const text = encodeURIComponent(`Check out ${product.title} on FlowList!`);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareModal(false);
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

    if (!product) {
      toast.error('Product information not available');
      return;
    }

    try {
      // Get seller ID - handle both populated and non-populated sellerId
      let sellerId = null;
      if (product.sellerId) {
        // sellerId might be an object (populated) or just an ID string
        sellerId = product.sellerId._id || product.sellerId.id || product.sellerId;
      } else if (product.seller) {
        sellerId = product.seller._id || product.seller.id || product.seller;
      }

      if (!sellerId) {
        toast.error('Seller information not available');
        return;
      }

      const buyerId = user._id || user.id;
      const productId = product._id || product.id;

      console.log('Creating chat session:', { buyerId, sellerId, productId });

      const session = await chatService.createChatSession(
        buyerId,
        sellerId,
        productId
      );

      console.log('Chat session created:', session);

      if (session && (session._id || session.id)) {
        const sessionIdToUse = session._id || session.id;
        console.log('Navigating to chat:', sessionIdToUse);
        navigate(`/chat/${sessionIdToUse}`);
      } else {
        console.error('Invalid session response - no ID found:', session);
        toast.error('Invalid session response. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create chat session:', error);
      console.error('Error details:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start chat. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    const price = bargainPrice || product.price;
    toast.success(bargainPrice ? `Added to cart at bargained price $${price}!` : 'Added to cart!');
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
                  <span className="rating-value">
                    {product.ratings?.average ? product.ratings.average.toFixed(1) : '0.0'}
                  </span>
                  <span className="rating-count">
                    ({product.ratings?.count || 0} {product.ratings?.count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                <button onClick={handleShare} className="share-button">
                  <Share2 className="icon" />
                  Share
                </button>
              </div>
            </div>

            {/* Price Section */}
            <div className="price-section">
              <div className="price-row">
                {bargainPrice ? (
                  <>
                    <span className="current-price">${bargainPrice}</span>
                    <span className="original-price">${product.price}</span>
                    <span className="save-badge" style={{ backgroundColor: '#10b981', color: 'white' }}>
                      Bargained Price - Save ${(product.price - bargainPrice).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <>
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
                {bargainPrice ? `Buy at $${bargainPrice}` : 'Add to Cart'}
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Product</h3>
              <button onClick={() => setShowShareModal(false)} className="close-button">
                <X className="icon" />
              </button>
            </div>
            <div className="share-modal-content">
              <button onClick={copyLink} className="share-option">
                <Copy className="icon" />
                <span>Copy Link</span>
              </button>
              <button onClick={() => shareToSocial('facebook')} className="share-option">
                <Facebook className="icon" />
                <span>Facebook</span>
              </button>
              <button onClick={() => shareToSocial('twitter')} className="share-option">
                <Twitter className="icon" />
                <span>Twitter</span>
              </button>
              <button onClick={() => shareToSocial('linkedin')} className="share-option">
                <Linkedin className="icon" />
                <span>LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
