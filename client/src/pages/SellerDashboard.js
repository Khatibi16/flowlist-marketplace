import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Camera, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Package, 
  MessageCircle,
  Search,
  Grid,
  List,
  X,
  Loader,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { productService, uploadService } from '../services/authService';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Tops',
    size: 'M',
    condition: 'Good',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'seller') {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getMyProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (uploading) return;
    
    setUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(file => uploadService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const imagePaths = results.map(result => result.path);
      setUploadedImages([...uploadedImages, ...imagePaths]);
      toast.success(`${results.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: true
  });

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !productForm.tags.includes(tagInput.trim())) {
      setProductForm({
        ...productForm,
        tags: [...productForm.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setProductForm({
      ...productForm,
      tags: productForm.tags.filter(t => t !== tag)
    });
  };

  const handleSubmitProduct = async () => {
    if (!uploadedImages.length) {
      toast.error('Please upload at least one product image');
      return;
    }

    if (!productForm.title || !productForm.description || !productForm.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        images: uploadedImages,
        aiGenerated: false
      };

      await productService.createProduct(productData);
      toast.success('Product created successfully!');
      setShowUploadModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create product';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'Tops',
      size: 'M',
      condition: 'Good',
      tags: []
    });
    setUploadedImages([]);
    setTagInput('');
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleOpenModal = () => {
    resetForm();
    setShowUploadModal(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'blue', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Active Listings', value: products.filter(p => p.status === 'active').length, icon: TrendingUp, color: 'purple', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Total Views', value: '0', icon: Eye, color: 'green', bgColor: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Messages', value: '0', icon: MessageCircle, color: 'orange', bgColor: 'bg-orange-50', iconColor: 'text-orange-600' }
  ];

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5001${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section - Centered */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Welcome back, {user?.name?.split(' ')[0] || 'Seller'}! 👋
          </h1>
          <p className="text-gray-600 text-xl">
            Manage your inventory and track your sales performance
          </p>
        </div>

        {/* Stats Cards - Centered Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-2xl shadow-sm`}>
                  <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar - Centered with better spacing */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Add Product Button - Prominent */}
            <button
              onClick={handleOpenModal}
              className="w-full lg:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add New Product
            </button>

            {/* Search and Filters - Right aligned */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:justify-end">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white font-medium"
              >
                <option value="all">All Categories</option>
                <option value="Tops">Tops</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Dresses">Dresses</option>
                <option value="Accessories">Accessories</option>
                <option value="Shoes">Shoes</option>
                <option value="Other">Other</option>
              </select>

              {/* View Mode */}
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-5 py-3 transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-5 py-3 border-l-2 border-gray-200 transition-all ${
                    viewMode === 'list' 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List - Centered */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Camera className="w-16 h-16 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No products found</h3>
            <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg">
              {searchQuery || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first product to the marketplace'
              }
            </p>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
            : 'space-y-6'
          }>
            {filteredProducts.map((product) => {
              const imageUrl = getImageUrl(product.images?.[0]);
              return (
                <div key={product._id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                  {viewMode === 'grid' ? (
                    <>
                      {/* Image */}
                      <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
                          <ImageIcon className="w-20 h-20 text-gray-400" />
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                            product.status === 'active' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-500 text-white'
                          }`}>
                            {product.status || 'active'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                            {product.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                            {product.description}
                          </p>
                        </div>

                        {/* Price and Category */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-3 mb-3">
                            <span className="text-3xl font-bold text-gray-900">
                              ${product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-lg text-gray-500 line-through">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="inline-block px-3 py-1.5 bg-purple-100 text-purple-700 text-sm font-bold rounded-lg">
                              {product.category}
                            </span>
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                              product.condition === 'New' ? 'bg-green-100 text-green-800' :
                              product.condition === 'Like New' ? 'bg-blue-100 text-blue-800' :
                              product.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {product.condition}
                            </span>
                            <span className="text-sm text-gray-600 font-medium">
                              Size: {product.size}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button 
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                          >
                            <Eye className="w-5 h-5 mr-2" />
                            View
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 flex items-center gap-6">
                      <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
                          <ImageIcon className="w-16 h-16 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">
                              {product.title}
                            </h3>
                            <p className="text-gray-600 line-clamp-2 mb-3">
                              {product.description}
                            </p>
                          </div>
                          <div className="ml-6 text-right">
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              ${product.price}
                            </div>
                            {product.originalPrice && (
                              <div className="text-lg text-gray-500 line-through">
                                ${product.originalPrice}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
                              {product.category}
                            </span>
                            <span className="text-gray-600 font-medium">Size: {product.size}</span>
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                              product.condition === 'New' ? 'bg-green-100 text-green-800' :
                              product.condition === 'Like New' ? 'bg-blue-100 text-blue-800' :
                              product.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {product.condition}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => navigate(`/product/${product._id}`)}
                              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
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

        {/* Upload Modal */}
        {showUploadModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUploadModal(false);
                resetForm();
              }
            }}
          >
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Add New Product</h2>
                  <p className="text-gray-600 text-sm mt-1">Fill in the details and upload product images</p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4 text-lg">
                    Product Images <span className="text-red-500">*</span>
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                      isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                        isDragActive ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <Camera className={`w-10 h-10 ${isDragActive ? 'text-purple-600' : 'text-gray-400'}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {isDragActive ? 'Drop images here' : 'Upload Product Photos'}
                      </h3>
                      <p className="text-gray-600 mb-6 text-lg">
                        Drag and drop images here, or click to select files
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose Files
                      </button>
                      <p className="text-sm text-gray-500 mt-4">
                        Supports JPG, PNG, GIF up to 5MB each (max 5 images)
                      </p>
                    </div>
                  </div>
                  {uploading && (
                    <div className="mt-6 flex items-center justify-center gap-3 text-purple-600">
                      <Loader className="w-6 h-6 animate-spin" />
                      <span className="text-base font-semibold">Uploading...</span>
                    </div>
                  )}
                  {uploadedImages.length > 0 && (
                    <div className="mt-6 grid grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={`http://localhost:5001${image}`}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 shadow-md"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Product Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={productForm.title}
                      onChange={handleFormChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="e.g., Vintage Denim Jacket"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleFormChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="Tops">Tops</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Dresses">Dresses</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="45.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Original Price ($)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={productForm.originalPrice}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="89.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="size"
                      value={productForm.size}
                      onChange={handleFormChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="condition"
                      value={productForm.condition}
                      onChange={handleFormChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleFormChange}
                    rows="5"
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none bg-gray-50 focus:bg-white"
                    placeholder="Describe your product in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Tags
                  </label>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {productForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {productForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-bold"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-3 text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetForm();
                    }}
                    className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitProduct}
                    disabled={uploading}
                    className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
