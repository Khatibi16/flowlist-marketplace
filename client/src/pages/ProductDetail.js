import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Calendar
} from 'lucide-react';
import { productService } from '../services/authService';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [showChat, setShowChat] = useState(false);

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

  const handleStartChat = () => {
    setShowChat(true);
    toast.success('Starting chat with seller');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images?.[selectedImage] ? `http://localhost:5000${product.images[selectedImage]}` : '/placeholder-image.jpg'}
                  alt={product.title}
                  className="w-full h-96 object-cover"
                />
                {product.aiGenerated && (
                  <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Generated
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discount}%
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-purple-500' : ''
                      }`}
                    >
                      <img
                        src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                  <button
                    onClick={handleFavorite}
                    className={`p-2 rounded-full ${
                      favorite ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">4.8</span>
                    <span className="text-gray-600">(127 reviews)</span>
                  </div>
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-purple-600">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                )}
                {discount > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {product.aiDescription && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">AI Description</span>
                  </div>
                  <p className="text-gray-700">{product.aiDescription}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <div className="grid grid-cols-6 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 px-3 border rounded-lg text-center ${
                          selectedSize === size
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="btn btn-primary flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleStartChat}
                    className="btn btn-secondary flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat with Seller</span>
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-medium">{product.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium">{product.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed</span>
                    <span className="font-medium">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Pricing Info */}
              {product.aiPricing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">AI Pricing Analysis</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Suggested Price</span>
                      <span className="font-medium">${product.aiPricing.suggested}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Confidence</span>
                      <span className="font-medium">{(product.aiPricing.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Market Range</span>
                      <span className="font-medium">
                        ${product.aiPricing.marketRange[0]} - ${product.aiPricing.marketRange[1]}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <Truck className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">On orders over $50</p>
            </div>
            <div className="card p-6 text-center">
              <RotateCcw className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600 text-sm">30-day return policy</p>
            </div>
            <div className="card p-6 text-center">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Protected transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
