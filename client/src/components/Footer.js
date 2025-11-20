import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="grid grid-1 grid-2 grid-4" style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' }}>
          {/* Company Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Logo size={32} showText={true} />
            </div>
            <p className="muted" style={{ marginBottom: 16 }}>
              AI-driven marketplace helping retailers turn excess stock into sales through 
              seamlessly integrated, multi-agent AI-driven tools.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="muted" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="muted" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="muted" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="muted" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Links</h3>
            <ul style={{ display: 'grid', gap: 8 }}>
              <li>
                <Link to="/buyer" className="muted">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/seller" className="muted">
                  Sell
                </Link>
              </li>
              <li>
                <Link to="/about" className="muted">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="muted">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Support</h3>
            <ul style={{ display: 'grid', gap: 8 }}>
              <li>
                <Link to="/help" className="muted">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="muted">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="muted">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="muted">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Contact Info</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail className="w-4 h-4" />
                <span className="muted">support@flowlist.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone className="w-4 h-4" />
                <span className="muted">+1 (555) 123-4567</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin className="w-4 h-4" />
                <span className="muted">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <p className="muted" style={{ fontSize: 14 }}>
              © 2024 FlowList. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link to="/privacy" className="muted" style={{ fontSize: 14 }}>
                Privacy Policy
              </Link>
              <Link to="/terms" className="muted" style={{ fontSize: 14 }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
