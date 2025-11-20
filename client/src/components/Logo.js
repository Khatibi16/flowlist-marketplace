import React from 'react';

const Logo = ({ 
  size = 24, 
  showText = true, 
  className = '',
  textColor = '#3B82F6',
  iconColor = '#3B82F6'
}) => {
  const iconSize = size;
  const textSize = size * 0.75; // Text size relative to icon

  // Very rounded B path with smooth, fluid curves
  const bPath = "M5.5 3c-.28 0-.5.22-.5.5v17c0 .28.22.5.5.5h7.5c2.76 0 5-2.24 5-5 0-1.38-.56-2.63-1.46-3.54.9-.91 1.46-2.16 1.46-3.54 0-2.76-2.24-5-5-5H5.5zm1 1h6.5c1.93 0 3.5 1.57 3.5 3.5 0 1.03-.45 1.96-1.16 2.6.71.64 1.16 1.57 1.16 2.6 0 1.93-1.57 3.5-3.5 3.5H6.5V4zm2 2v5h4.5c.83 0 1.5-.67 1.5-1.5S13.33 8 12.5 8H8.5V6zm0 6v5h4.5c.83 0 1.5-.67 1.5-1.5S13.33 15 12.5 15H8.5v-3z";

  return (
    <div 
      className={`logo-container ${className}`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: showText ? 10 : 0 
      }}
    >
      {/* Blue B Logo with 3D layered effect - exact rounded B design */}
      <div 
        className="logo-icon"
        style={{
          position: 'relative',
          width: iconSize,
          height: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {/* Back layer (lightest blue - sky blue #87CEEB) - offset bottom right for depth */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            top: 2.5,
            left: 2.5,
            zIndex: 1
          }}
        >
          <path
            d={bPath}
            fill="#87CEEB"
            stroke="none"
          />
        </svg>
        
        {/* Middle layer (medium blue #5B9BD5) - slight offset */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            top: 1.5,
            left: 1.5,
            zIndex: 2
          }}
        >
          <path
            d={bPath}
            fill="#5B9BD5"
            stroke="none"
          />
        </svg>
        
        {/* Front layer (darkest blue) - main logo, no offset */}
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
            d={bPath}
            fill={iconColor}
            stroke="none"
          />
        </svg>
      </div>
      
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
