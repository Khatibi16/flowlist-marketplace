import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  Camera,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Heart,
  ShoppingBag,
  MessageCircle,
  TrendingUp
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Fashion enthusiast and sustainable shopping advocate',
    avatar: '/placeholder-avatar.jpg'
  });

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to the server
    console.log('Profile updated:', profileData);
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const stats = [
    { label: 'Products Bought', value: '24', icon: ShoppingBag, color: 'blue' },
    { label: 'Favorites', value: '156', icon: Heart, color: 'red' },
    { label: 'Messages', value: '89', icon: MessageCircle, color: 'green' },
    { label: 'Reviews', value: '12', icon: TrendingUp, color: 'purple' }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'purchase',
      title: 'Vintage Denim Jacket',
      date: '2 days ago',
      amount: '$45.99'
    },
    {
      id: 2,
      type: 'favorite',
      title: 'Silk Blouse',
      date: '3 days ago',
      amount: null
    },
    {
      id: 3,
      type: 'message',
      title: 'Chat with seller about leather bag',
      date: '1 week ago',
      amount: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="card p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <img
                  src={profileData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 mb-4">{profileData.bio}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{profileData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn btn-outline"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="btn btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="card p-6 text-center">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Settings */}
            <div className="lg:col-span-2">
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Full Name</span>
                      <span className="font-medium">{profileData.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{profileData.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium">{profileData.phone}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{profileData.location}</span>
                    </div>
                    <div className="flex justify-between items-start py-2">
                      <span className="text-gray-600">Bio</span>
                      <span className="font-medium text-right max-w-xs">{profileData.bio}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        {activity.type === 'purchase' && <ShoppingBag className="w-5 h-5 text-purple-600" />}
                        {activity.type === 'favorite' && <Heart className="w-5 h-5 text-purple-600" />}
                        {activity.type === 'message' && <MessageCircle className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.date}</p>
                      </div>
                      {activity.amount && (
                        <span className="font-semibold text-green-600">{activity.amount}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>General Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span>Notifications</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span>Privacy & Security</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span>Payment Methods</span>
                  </button>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full btn btn-outline text-left justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    View Favorites
                  </button>
                  <button className="w-full btn btn-outline text-left justify-start">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Order History
                  </button>
                  <button className="w-full btn btn-outline text-left justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message History
                  </button>
                </div>
              </div>

              <div className="card p-6">
                <button
                  onClick={logout}
                  className="w-full btn btn-outline text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
