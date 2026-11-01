import React from 'react';

export default function RangoliSvg({ className = 'w-64 h-64', spin = true }) {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  const innerPetals = Array.from({ length: 8 }, (_, i) => i * 45);

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${spin ? 'animate-spin-slow' : ''} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rangoliCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FF8C00" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#29104A" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {/* Outer Sacred Rings */}
      <circle cx="120" cy="120" r="112" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.55" />
      <circle cx="120" cy="120" r="98" stroke="#FF8C00" strokeWidth="1.2" strokeOpacity="0.45" />

      {/* 12 Outer Lotus Petals */}
      {petals.map((angle) => (
        <g key={`outer-${angle}`} transform={`rotate(${angle} 120 120)`}>
          <path
            d="M120 14C132 36 136 58 120 78C104 58 108 36 120 14Z"
            stroke="#FFD700"
            strokeWidth="1.6"
            fill="#FF8C00"
            fillOpacity="0.16"
          />
          <circle cx="120" cy="24" r="3" fill="#FFF4DC" fillOpacity="0.8" />
        </g>
      ))}

      {/* Middle Geometric Star */}
      <circle cx="120" cy="120" r="68" stroke="#FFD700" strokeWidth="1.8" strokeOpacity="0.65" />

      {/* 8 Inner Petals */}
      {innerPetals.map((angle) => (
        <g key={`inner-${angle}`} transform={`rotate(${angle} 120 120)`}>
          <path
            d="M120 52C130 72 130 94 120 112C110 94 110 72 120 52Z"
            stroke="#FFF4DC"
            strokeWidth="1.4"
            fill="#FFD700"
            fillOpacity="0.22"
          />
        </g>
      ))}

      {/* Center Bindu Mandala */}
      <circle cx="120" cy="120" r="26" fill="url(#rangoliCenter)" stroke="#FFD700" strokeWidth="2" />
      <circle cx="120" cy="120" r="8" fill="#FFF4DC" />
    </svg>
  );
}

