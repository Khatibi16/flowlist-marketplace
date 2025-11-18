import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  ShoppingBag, 
  Star, 
  Grid, 
  List,
  Sparkles,
  Camera,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import { productService } from '../services/authService';
import toast from 'react-hot-toast';

const BuyerDashboard = () => {
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
    // In a real app, this would create a chat session
    toast.success(`Starting chat about ${product.title}`);
  };

  const handleViewProduct = (productId) => {
    window.location.href = `/product/${productId}`;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      default:
        return 0;
    }
  });

  const categories = ['all', 'Tops', 'Outerwear', 'Bottoms', 'Dresses', 'Accessories'];
  const conditions = ['all', 'New', 'Like New', 'Good', 'Fair'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Amazing Products
          </h1>
          <p className="text-gray-600">
            AI-powered recommendations and chat-based shopping experience
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, brands, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-4 flex gap-4">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Based on your preferences, we recommend these trending items:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Vintage Denim
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Sustainable Fashion
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Designer Accessories
            </span>
          </div>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length === 0 ? (
          <div className="card p-12 text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all products
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {sortedProducts.map((product) => (
              <div key={product._id || product.id} className="card group">
                {viewMode === 'grid' ? (
                  <div className="p-6">
                    <div className="aspect-w-16 aspect-h-12 mb-4 bg-gray-100 rounded-lg overflow-hidden relative">
                      <img
                        src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : '/placeholder-image.jpg'}
                        alt={product.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => handleFavorite(product._id || product.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full ${
                          favorites.has(product._id || product.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white text-gray-600 hover:bg-red-50'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(product._id || product.id) ? 'fill-current' : ''}`} />
                      </button>
                      {product.aiGenerated && (
                        <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xl font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{product.category}</span>
                      <span>{product.size}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {product.condition}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewProduct(product._id || product.id)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleStartChat(product)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : '/placeholder-image.jpg'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleFavorite(product._id || product.id)}
                        className={`absolute top-2 right-2 p-1 rounded-full ${
                          favorites.has(product._id || product.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white text-gray-600'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${favorites.has(product._id || product.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {product.title}
                          </h3>
                          <p className="text-gray-600 text-sm truncate">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {product.aiGenerated && (
                            <Sparkles className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="text-xl font-bold text-gray-900">${product.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{product.category}</span>
                          <span>{product.size}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            {product.condition}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>4.8</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewProduct(product._id || product.id)}
                            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleStartChat(product)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
