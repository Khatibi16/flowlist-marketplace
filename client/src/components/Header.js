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
    <header className="site-header">
      <div className="container">
        <div className="navbar">
          {/* Logo */}
          <Link to="/" className="brand">
            <div className="brand-badge">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-gradient" style={{ fontWeight: 700, fontSize: 18 }}>FlowList</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="searchbar" aria-label="Search products">
            <div style={{ position: 'relative' }}>
              <Search className="icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: 16, height: 16 }} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>

          {/* Navigation */}
          <nav className="nav-links" aria-label="Primary">
            <Link to="/buyer" className="nav-link">Shop</Link>
            {user ? (
              <>
                {user.role === 'seller' && (
                  <Link to="/seller" className="nav-link">Dashboard</Link>
                )}
                <Link to="/chat" className="nav-link" aria-label="Messages">
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link to="/profile" className="nav-link" aria-label="Profile">
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={logout} className="btn btn-primary" type="button">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button (non-functional placeholder without Tailwind) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            style={{ display: 'none' }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
