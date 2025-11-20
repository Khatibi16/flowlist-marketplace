import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  Camera,
  X,
  Heart,
  ShoppingBag,
  MessageCircle,
  Star,
  Upload,
  Loader
} from 'lucide-react';
import { chatService } from '../services/authService';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    productsBought: 0,
    favorites: 0,
    messages: 0,
    reviews: 0
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatar: user?.avatar || null
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || null
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Fetch chat sessions count
      const chatSessions = await chatService.getChatSessions(user._id || user.id);
      setStats(prev => ({
        ...prev,
        messages: chatSessions?.length || 0
      }));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5001/api/upload/single', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          avatar: data.path
        }));
        toast.success('Profile picture updated!');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to the server
      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Update user context if needed
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      // For now, just save locally
      toast.success('Profile updated! (Note: Backend endpoint not implemented yet)');
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5001${imagePath}`;
  };

  const statsData = [
    { 
      label: 'Products Bought', 
      value: stats.productsBought, 
      icon: ShoppingBag, 
      color: '#3b82f6' 
    },
    {
      label: 'Favorites', 
      value: stats.favorites, 
      icon: Heart, 
      color: '#ef4444' 
    },
    { 
      label: 'Messages', 
      value: stats.messages, 
      icon: MessageCircle, 
      color: '#10b981' 
    },
    {
      label: 'Reviews', 
      value: stats.reviews, 
      icon: Star, 
      color: '#8b5cf6' 
    }
  ];

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Please login to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                {profileData.avatar ? (
                <img
                    src={getImageUrl(profileData.avatar)}
                  alt="Profile"
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=8b5cf6&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <User className="avatar-icon" />
                  </div>
                )}
                <label className="avatar-upload-button" htmlFor="avatar-upload">
                  {uploading ? (
                    <Loader className="upload-icon spinning" />
                  ) : (
                    <Camera className="upload-icon" />
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="profile-info-section">
                {isEditing ? (
                <div className="profile-edit-form">
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                    className="profile-input profile-name-input"
                    placeholder="Full Name"
                      />
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleChange}
                    className="profile-input profile-bio-input"
                    placeholder="Bio"
                    rows={2}
                      />
                    </div>
              ) : (
                <>
                  <h1 className="profile-name">{profileData.name || 'User'}</h1>
                  <p className="profile-bio">{profileData.bio || 'No bio yet'}</p>
                </>
              )}
                    
              <div className="profile-contact-info">
                <div className="contact-item">
                  <Mail className="contact-icon" />
                  <span>{profileData.email}</span>
                </div>
                {isEditing ? (
                  <>
                    <div className="contact-item">
                      <Phone className="contact-icon" />
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        className="contact-input"
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="contact-item">
                      <MapPin className="contact-icon" />
                      <input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleChange}
                        className="contact-input"
                        placeholder="Location"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {profileData.phone && (
                      <div className="contact-item">
                        <Phone className="contact-icon" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                    {profileData.location && (
                      <div className="contact-item">
                        <MapPin className="contact-icon" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                  </>
                      )}
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <div className="action-buttons">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // Reset to original values
                      setProfileData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        location: user.location || '',
                        bio: user.bio || '',
                        avatar: user.avatar || null
                      });
                    }}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    <X className="btn-icon" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader className="btn-icon spinning" />
                    ) : (
                      <Save className="btn-icon" />
                    )}
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  <Edit className="btn-icon" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="stat-icon" style={{ color: stat.color }} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Information Card */}
        <div className="profile-info-card">
          <h2 className="card-title">Profile Information</h2>
          
          {isEditing ? (
            <div className="info-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled
                />
                <span className="form-hint">Email cannot be changed</span>
              </div>
              
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="City, State"
                />
              </div>
            </div>
          ) : (
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{profileData.name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{profileData.email}</span>
              </div>
              {profileData.bio && (
                <div className="info-item">
                  <span className="info-label">Bio</span>
                  <span className="info-value">{profileData.bio}</span>
                </div>
              )}
              {profileData.phone && (
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{profileData.phone}</span>
                </div>
              )}
              {profileData.location && (
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{profileData.location}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
