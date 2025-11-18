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
  Filter,
  Search,
  Grid,
  List,
  Sparkles,
  X,
  Loader
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
    maxSize: 5 * 1024 * 1024, // 5MB
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'blue' },
    { label: 'Active Listings', value: products.filter(p => p.status === 'active').length, icon: TrendingUp, color: 'purple' },
    { label: 'Total Views', value: '0', icon: Eye, color: 'green' },
    { label: 'Messages', value: '0', icon: MessageCircle, color: 'orange' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Manage your inventory and track your sales performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  resetForm();
                  setShowUploadModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first product to the marketplace'
              }
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowUploadModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow group">
                {viewMode === 'grid' ? (
                  <div className="p-6">
                    <div className="aspect-w-16 aspect-h-12 mb-4 bg-gray-100 rounded-lg overflow-hidden relative">
                      <img
                        src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : '/placeholder-image.jpg'}
                        alt={product.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                        {product.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xl font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {product.condition}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : '/placeholder-image.jpg'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
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
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
                  <p className="text-gray-600 text-sm">Fill in the details and upload product images</p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images *
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isDragActive ? 'Drop images here' : 'Upload Product Photos'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop images here, or click to select files
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports JPG, PNG, GIF up to 5MB each (max 5 images)
                    </p>
                  </div>
                  {uploading && (
                    <div className="mt-4 flex items-center justify-center">
                      <Loader className="w-6 h-6 animate-spin text-purple-600" />
                      <span className="ml-2 text-gray-600">Uploading...</span>
                    </div>
                  )}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`http://localhost:5000${image}`}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={productForm.title}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Vintage Denim Jacket"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="45.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price ($)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={productForm.originalPrice}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="89.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size *
                    </label>
                    <select
                      name="size"
                      value={productForm.size}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      name="condition"
                      value={productForm.condition}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe your product in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Add
                    </button>
                  </div>
                  {productForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {productForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitProduct}
                    disabled={uploading}
                    className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
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
