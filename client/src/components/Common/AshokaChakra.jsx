import React from 'react';

const AshokaChakra = ({ size = 120, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`inline-block ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle
        cx="60"
        cy="60"
        r="58"
        stroke="#000080"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Inner circle */}
      <circle
        cx="60"
        cy="60"
        r="45"
        stroke="#000080"
        strokeWidth="1"
        fill="none"
      />
      
      {/* 24 spokes */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i * 15) * (Math.PI / 180); // 360/24 = 15 degrees each
        const outerX = 60 + 45 * Math.cos(angle);
        const outerY = 60 + 45 * Math.sin(angle);
        const innerX = 60 + 15 * Math.cos(angle);
        const innerY = 60 + 15 * Math.sin(angle);
        
        return (
          <line
            key={i}
            x1={innerX}
            y1={innerY}
            x2={outerX}
            y2={outerY}
            stroke="#000080"
            strokeWidth="1.5"
          />
        );
      })}
      
      {/* Center hub */}
      <circle
        cx="60"
        cy="60"
        r="8"
        fill="#000080"
      />
    </svg>
  );
};

export default AshokaChakra;
