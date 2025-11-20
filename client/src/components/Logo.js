import React from 'react';
import { LOGO_CONFIG } from '../config/logo';

const Logo = ({ 
  size = 24, 
  showText = true, 
  className = '',
  textColor = LOGO_CONFIG.textColor,
  iconColor = LOGO_CONFIG.iconColor,
  logoUrl = LOGO_CONFIG.logoUrl // Uses config file or can be overridden
}) => {
  const textSize = size * 0.75; // Text size
  const iconSize = textSize * 3; // Logo size is 3x the text size

  return (
    <div 
      className={`logo-container ${className}`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: showText ? 10 : 0 
      }}
    >
      {/* Logo image - using actual image file or URL */}
      <img
        src={logoUrl}
        alt="FlowList Logo"
        className="logo-icon"
        style={{
          width: iconSize,
          height: iconSize,
          objectFit: 'contain',
          flexShrink: 0,
          display: 'block'
        }}
        onError={(e) => {
          // Fallback if image not found
          console.warn(`Logo image not found at ${logoUrl}`);
          e.target.style.display = 'none';
        }}
      />
      
      {/* FlowList text - same color as icon */}
      {showText && (
        <span 
          className="logo-text"
          style={{
            fontSize: textSize,
            fontWeight: 700,
            color: textColor,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap',
            userSelect: 'none'
          }}
        >
          FlowList
        </span>
      )}
    </div>
  );
};

export default Logo;
