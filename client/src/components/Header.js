import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, MessageCircle, User, Menu, X, Camera, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buyer?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">FlowList</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/buyer" className="text-gray-600 hover:text-purple-600 transition-colors">
              Shop
            </Link>
            {user ? (
              <>
                {user.role === 'seller' && (
                  <Link to="/seller" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Dashboard
                  </Link>
                )}
                <Link to="/chat" className="text-gray-600 hover:text-purple-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-purple-600 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-purple-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </form>
            
            <nav className="flex flex-col space-y-4">
              <Link to="/buyer" className="text-gray-600 hover:text-purple-600 transition-colors">
                Shop
              </Link>
              {user ? (
                <>
                  {user.role === 'seller' && (
                    <Link to="/seller" className="text-gray-600 hover:text-purple-600 transition-colors">
                      Dashboard
                    </Link>
                  )}
                  <Link to="/chat" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Messages
                  </Link>
                  <Link to="/profile" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="text-left text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary w-full text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
