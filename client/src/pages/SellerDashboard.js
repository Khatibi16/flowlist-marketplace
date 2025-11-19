import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Camera, 
  Upload, 
  Eye, 
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
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { productService, uploadService } from '../services/authService';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import './SellerDashboard.css';

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
    { label: 'Total Products', value: products.length, icon: Package },
    { label: 'Active Listings', value: products.filter(p => p.status === 'active').length, icon: TrendingUp },
    { label: 'Total Views', value: '0', icon: Eye },
    { label: 'Messages', value: '0', icon: MessageCircle }
  ];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5001${imagePath}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader className="w-12 h-12 animate-spin" style={{ color: '#667eea', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '18px' }}>Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Seller'}! 👋</h1>
          <p>Manage your inventory and track your sales performance</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
                <div className="stat-icon">
                  <stat.icon size={32} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="action-bar">
              <button
            onClick={handleOpenModal}
            className="btn btn-primary add-product-btn"
              >
            <Plus size={20} />
                Add New Product
              </button>

          <div className="action-controls">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              className="category-select"
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

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Camera size={64} />
            </div>
            <h3>No products found</h3>
            <p>
              {searchQuery || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first product to the marketplace'
              }
            </p>
            <button onClick={handleOpenModal} className="btn btn-primary">
              <Plus size={20} />
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
            {filteredProducts.map((product) => {
              const imageUrl = getImageUrl(product.images?.[0]);
              return (
                <div key={product._id} className="product-card">
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
                        <div className="product-status">
                          <span className={product.status === 'active' ? 'status-active' : 'status-inactive'}>
                            {product.status || 'active'}
                          </span>
                        </div>
                      </div>

                      <div className="product-content">
                        <h3 className="product-title">{product.title}</h3>
                        <p className="product-description">{product.description}</p>

                        <div className="product-price-section">
                          <div className="product-price">
                            <span className="price-current">${product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="price-original">${product.originalPrice}</span>
                            )}
                          </div>
                          <div className="product-badges">
                            <span className="badge-category">{product.category}</span>
                            <span className={`badge-condition badge-${product.condition?.toLowerCase().replace(' ', '-')}`}>
                        {product.condition}
                      </span>
                            <span className="badge-size">Size: {product.size}</span>
                          </div>
                    </div>

                        <div className="product-actions">
                          <button 
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="btn btn-secondary"
                          >
                            <Eye size={16} />
                        View
                      </button>
                      <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="btn-delete"
                      >
                            <Trash2 size={16} />
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
                      </div>
                      <div className="product-list-content">
                        <div className="product-list-header">
                          <div>
                            <h3>{product.title}</h3>
                            <p>{product.description}</p>
                          </div>
                          <div className="product-list-price">
                            <span className="price-current">${product.price}</span>
                            {product.originalPrice && (
                              <span className="price-original">${product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                        <div className="product-list-footer">
                          <div className="product-badges">
                            <span className="badge-category">{product.category}</span>
                            <span>Size: {product.size}</span>
                            <span className={`badge-condition badge-${product.condition?.toLowerCase().replace(' ', '-')}`}>
                            {product.condition}
                          </span>
                        </div>
                          <div className="product-actions">
                            <button 
                              onClick={() => navigate(`/product/${product._id}`)}
                              className="btn btn-secondary"
                            >
                              <Eye size={16} />
                          </button>
                          <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              className="btn-delete"
                          >
                              <Trash2 size={16} />
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
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUploadModal(false);
                resetForm();
              }
            }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h2>Add New Product</h2>
                  <p>Fill in the details and upload product images</p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  className="modal-close"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                {/* Image Upload */}
                <div className="form-section">
                  <label>
                    Product Images <span className="required">*</span>
                  </label>
                  <div
                    {...getRootProps()}
                    className={`upload-area ${isDragActive ? 'drag-active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <div className="upload-content">
                      <div className="upload-icon">
                        <Camera size={40} />
                      </div>
                      <h3>{isDragActive ? 'Drop images here' : 'Upload Product Photos'}</h3>
                      <p>Drag and drop images here, or click to select files</p>
                      <button type="button" className="btn btn-primary">
                        <Upload size={18} />
                    Choose Files
                  </button>
                      <p className="upload-hint">Supports JPG, PNG, GIF up to 5MB each (max 5 images)</p>
                    </div>
                  </div>
                  {uploading && (
                    <div className="upload-loading">
                      <Loader size={20} className="animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                  {uploadedImages.length > 0 && (
                    <div className="uploaded-images">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="uploaded-image-item">
                          <img src={`http://localhost:5001${image}`} alt={`Upload ${index + 1}`} />
                          <button onClick={() => removeImage(index)} className="remove-image">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Form */}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Title <span className="required">*</span></label>
                    <input
                      type="text"
                      name="title"
                      value={productForm.title}
                      onChange={handleFormChange}
                      placeholder="e.g., Vintage Denim Jacket"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category <span className="required">*</span></label>
                    <select name="category" value={productForm.category} onChange={handleFormChange}>
                      <option value="Tops">Tops</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Dresses">Dresses</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price ($) <span className="required">*</span></label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="45.99"
                    />
                  </div>
                  <div className="form-group">
                    <label>Original Price ($)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={productForm.originalPrice}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="89.99"
                    />
                  </div>
                  <div className="form-group">
                    <label>Size <span className="required">*</span></label>
                    <select name="size" value={productForm.size} onChange={handleFormChange}>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Condition <span className="required">*</span></label>
                    <select name="condition" value={productForm.condition} onChange={handleFormChange}>
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleFormChange}
                    rows="5"
                    placeholder="Describe your product in detail..."
                  />
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <div className="tag-input-wrapper">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag and press Enter"
                    />
                    <button type="button" onClick={addTag} className="btn btn-secondary">Add</button>
                  </div>
                  {productForm.tags.length > 0 && (
                    <div className="tags-list">
                      {productForm.tags.map((tag, index) => (
                        <span key={index} className="tag-item">
                          {tag}
                          <button onClick={() => removeTag(tag)}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitProduct}
                    disabled={uploading}
                    className="btn btn-primary"
                  >
                    {uploading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
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
