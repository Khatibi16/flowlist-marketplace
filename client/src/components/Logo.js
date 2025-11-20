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

  return (
    <div 
      className={`logo-container ${className}`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: showText ? 10 : 0 
      }}
    >
      {/* Blue B Logo with 3D layered effect - rounded modern design */}
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
        {/* Back layer (lightest blue) - offset bottom right for depth */}
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
            d="M5 3.5c0-.28.22-.5.5-.5h8.5c2.49 0 4.5 2.01 4.5 4.5 0 1.3-.55 2.47-1.43 3.3.88.83 1.43 2 1.43 3.3 0 2.49-2.01 4.5-4.5 4.5H5.5c-.28 0-.5-.22-.5-.5V3.5zm1 1v14h8c1.93 0 3.5-1.57 3.5-3.5 0-1.16-.57-2.19-1.45-2.83l.9-.67c.88-.64 1.45-1.67 1.45-2.83 0-1.93-1.57-3.5-3.5-3.5H6zm2 2h6c.83 0 1.5.67 1.5 1.5S14.83 10 14 10H8V6.5zm0 4.5h6c.83 0 1.5.67 1.5 1.5S14.83 13.5 14 13.5H8V11z"
            fill="#87CEEB"
            stroke="none"
          />
        </svg>
        
        {/* Middle layer (medium blue) - slight offset */}
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
            d="M5 3.5c0-.28.22-.5.5-.5h8.5c2.49 0 4.5 2.01 4.5 4.5 0 1.3-.55 2.47-1.43 3.3.88.83 1.43 2 1.43 3.3 0 2.49-2.01 4.5-4.5 4.5H5.5c-.28 0-.5-.22-.5-.5V3.5zm1 1v14h8c1.93 0 3.5-1.57 3.5-3.5 0-1.16-.57-2.19-1.45-2.83l.9-.67c.88-.64 1.45-1.67 1.45-2.83 0-1.93-1.57-3.5-3.5-3.5H6zm2 2h6c.83 0 1.5.67 1.5 1.5S14.83 10 14 10H8V6.5zm0 4.5h6c.83 0 1.5.67 1.5 1.5S14.83 13.5 14 13.5H8V11z"
            fill="#5B9BD5"
            stroke="none"
          />
        </svg>
        
        {/* Front layer (darkest blue) - main logo */}
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
            d="M5 3.5c0-.28.22-.5.5-.5h8.5c2.49 0 4.5 2.01 4.5 4.5 0 1.3-.55 2.47-1.43 3.3.88.83 1.43 2 1.43 3.3 0 2.49-2.01 4.5-4.5 4.5H5.5c-.28 0-.5-.22-.5-.5V3.5zm1 1v14h8c1.93 0 3.5-1.57 3.5-3.5 0-1.16-.57-2.19-1.45-2.83l.9-.67c.88-.64 1.45-1.67 1.45-2.83 0-1.93-1.57-3.5-3.5-3.5H6zm2 2h6c.83 0 1.5.67 1.5 1.5S14.83 10 14 10H8V6.5zm0 4.5h6c.83 0 1.5.67 1.5 1.5S14.83 13.5 14 13.5H8V11z"
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
