import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Heart, 
  MessageCircle, 
  Star, 
  Grid, 
  List,
  Sparkles,
  Camera,
  TrendingUp,
  Image as ImageIcon,
  User
} from 'lucide-react';
import { productService } from '../services/authService';
import toast from 'react-hot-toast';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    condition: 'all',
    sortBy: 'newest'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts({ status: 'active' });
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(productId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  const handleStartChat = (product) => {
    toast.success(`Starting chat about ${product.title}`);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filters.category === 'all' || product.category === filters.category;
    const matchesCondition = filters.condition === 'all' || product.condition === filters.condition;
    const matchesMinPrice = !filters.minPrice || product.price >= parseFloat(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);
    
    return matchesSearch && matchesCategory && matchesCondition && matchesMinPrice && matchesMaxPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      default:
        return 0;
    }
  });

  const categories = ['all', 'Tops', 'Outerwear', 'Bottoms', 'Dresses', 'Accessories', 'Shoes', 'Other'];
  const conditions = ['all', 'New', 'Like New', 'Good', 'Fair', 'Poor'];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5001${imagePath}`;
  };

  if (loading) {
    return (
      <div className="buyer-dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading amazing products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="buyer-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="buyer-header">
          <h1>Discover Amazing Products</h1>
          <p>AI-powered recommendations and chat-based shopping experience</p>
        </div>

        {/* Search and Filters */}
        <div className="filters-section">
          <div className="search-bar-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search products, brands, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-large"
            />
          </div>

          <div className="filters-row">
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              value={filters.condition}
              onChange={(e) => setFilters({...filters, condition: e.target.value})}
              className="filter-select"
            >
              {conditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition === 'all' ? 'All Conditions' : condition}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <div className="price-range">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="price-input"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="price-input"
              />
            </div>

            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'active' : ''}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'active' : ''}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="ai-recommendations">
          <div className="ai-header">
            <Sparkles size={24} className="ai-icon" />
            <h3>AI Recommendations</h3>
          </div>
          <p>Based on your preferences, we recommend these trending items:</p>
          <div className="recommendation-tags">
            <span className="recommendation-tag tag-purple">Vintage Denim</span>
            <span className="recommendation-tag tag-blue">Sustainable Fashion</span>
            <span className="recommendation-tag tag-green">Designer Accessories</span>
            <span className="recommendation-tag tag-orange">Trending Now</span>
          </div>
        </div>

        {/* Products Count */}
        <div className="products-count">
          <p>Showing <strong>{sortedProducts.length}</strong> {sortedProducts.length === 1 ? 'product' : 'products'}</p>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Camera size={64} />
            </div>
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or browse all products</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
            {sortedProducts.map((product) => {
              const imageUrl = getImageUrl(product.images?.[0]);
              const productId = product._id || product.id;
              const isFavorite = favorites.has(productId);
              
              return (
                <div key={productId} className="product-card">
                  {viewMode === 'grid' ? (
                    <>
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
                          <ImageIcon size={48} />
                        </div>
                        
                        {/* Favorite Button */}
                        <button
                          onClick={() => handleFavorite(productId)}
                          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        >
                          <Heart size={18} className={isFavorite ? 'filled' : ''} />
                        </button>

                        {/* AI Badge */}
                        {product.aiGenerated && (
                          <div className="ai-badge">
                            <Sparkles size={12} />
                            <span>AI</span>
                          </div>
                        )}

                        {/* Discount Badge */}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="discount-badge">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>

                      <div className="product-content">
                        {/* Seller Info */}
                        {product.sellerName && (
                          <div className="seller-info">
                            <User size={14} />
                            <span>{product.sellerName}</span>
                          </div>
                        )}

                        <h3 className="product-title">{product.title}</h3>
                        <p className="product-description">{product.description}</p>

                        <div className="product-rating">
                          <Star size={16} className="star-filled" />
                          <span>4.8</span>
                          <span className="rating-count">(127)</span>
                        </div>

                        <div className="product-price-section">
                          <div className="product-price">
                            <span className="price-current">${product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="price-original">${product.originalPrice}</span>
                            )}
                          </div>
                        </div>

                        <div className="product-badges">
                          <span className="badge-category">{product.category}</span>
                          <span className={`badge-condition badge-${product.condition?.toLowerCase().replace(' ', '-')}`}>
                            {product.condition}
                          </span>
                          <span className="badge-size">Size: {product.size}</span>
                        </div>

                        <div className="product-actions">
                          <button 
                            onClick={() => handleViewProduct(productId)}
                            className="btn btn-primary btn-view"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => handleStartChat(product)}
                            className="btn btn-secondary btn-chat"
                            title="Chat with seller"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="product-list-item">
                      <div className="product-list-image">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="product-image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                          <ImageIcon size={32} />
                        </div>
                        <button
                          onClick={() => handleFavorite(productId)}
                          className={`favorite-btn-small ${isFavorite ? 'active' : ''}`}
                        >
                          <Heart size={14} className={isFavorite ? 'filled' : ''} />
                        </button>
                      </div>
                      <div className="product-list-content">
                        <div className="product-list-header">
                          <div className="product-list-info">
                            {product.sellerName && (
                              <div className="seller-info">
                                <User size={12} />
                                <span>{product.sellerName}</span>
                              </div>
                            )}
                            <h3>{product.title}</h3>
                            <p>{product.description}</p>
                            <div className="product-rating">
                              <Star size={14} className="star-filled" />
                              <span>4.8</span>
                              <span className="rating-count">(127)</span>
                            </div>
                          </div>
                          <div className="product-list-price">
                            <span className="price-current">${product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="price-original">${product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                        <div className="product-list-footer">
                          <div className="product-badges">
                            <span className="badge-category">{product.category}</span>
                            <span className="badge-size">Size: {product.size}</span>
                            <span className={`badge-condition badge-${product.condition?.toLowerCase().replace(' ', '-')}`}>
                              {product.condition}
                            </span>
                          </div>
                          <div className="product-actions">
                            <button 
                              onClick={() => handleViewProduct(productId)}
                              className="btn btn-primary"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleStartChat(product)}
                              className="btn btn-secondary"
                              title="Chat with seller"
                            >
                              <MessageCircle size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
