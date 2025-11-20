import React from 'react';

const Logo = ({ size = 24, showText = false, className = '' }) => {
  const iconSize = size;
  const textSize = size * 0.75; // Text size relative to icon

  return (
    <div 
      className={`logo-container ${className}`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: showText ? 8 : 0 
      }}
    >
      {/* Blue B Logo with 3D effect */}
      <div 
        className="logo-icon"
        style={{
          position: 'relative',
          width: iconSize,
          height: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Back layer (lightest blue) */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            zIndex: 1
          }}
        >
          <path
            d="M6 4h8c2.5 0 4.5 2 4.5 4.5 0 1.5-.7 2.8-1.8 3.6 1.1.8 1.8 2.1 1.8 3.6C18 18 16 20 13.5 20H6V4z"
            fill="#87CEEB"
            stroke="none"
          />
        </svg>
        
        {/* Middle layer (medium blue) */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            top: 1,
            left: 1,
            zIndex: 2
          }}
        >
          <path
            d="M6 4h8c2.5 0 4.5 2 4.5 4.5 0 1.5-.7 2.8-1.8 3.6 1.1.8 1.8 2.1 1.8 3.6C18 18 16 20 13.5 20H6V4z"
            fill="#5B9BD5"
            stroke="none"
          />
        </svg>
        
        {/* Front layer (darkest blue) */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          style={{
            position: 'relative',
            zIndex: 3
          }}
        >
          <path
            d="M6 4h8c2.5 0 4.5 2 4.5 4.5 0 1.5-.7 2.8-1.8 3.6 1.1.8 1.8 2.1 1.8 3.6C18 18 16 20 13.5 20H6V4z"
            fill="#3B82F6"
            stroke="none"
          />
        </svg>
      </div>
      
      {/* FlowList text - only shown if showText is true */}
      {showText && (
        <span 
          className="logo-text"
          style={{
            fontSize: textSize,
            fontWeight: 700,
            color: '#3B82F6',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            letterSpacing: '-0.5px'
          }}
        >
          FlowList
        </span>
      )}
    </div>
  );
};

export default Logo;

