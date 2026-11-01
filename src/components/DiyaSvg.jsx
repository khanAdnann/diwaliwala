import React from 'react';

export default function DiyaSvg({
  size = 64,
  lit = true,
  className = '',
  onClick,
  interactive = false,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={`${interactive ? 'cursor-pointer transition-transform duration-300 hover:scale-110' : ''} ${className}`}
      role={interactive ? 'button' : 'img'}
      aria-label={lit ? 'Glowing Diwali Diya' : 'Unlit Diwali Diya'}
    >
      <defs>
        <radialGradient id="diyaAura" cx="50%" cy="34%" r="48%">
          <stop offset="0%" stopColor="#FFF4DC" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#FFD700" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FF8C00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="diyaFlameGrad" x1="60" y1="12" x2="60" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF4DC" />
          <stop offset="52%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
        <linearGradient id="diyaClayGrad" x1="16" y1="62" x2="104" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="35%" stopColor="#D97706" />
          <stop offset="75%" stopColor="#9A3412" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>
      </defs>

      {/* Ambient Glow & Flame when Lit */}
      {lit && (
        <>
          <circle cx="60" cy="42" r="42" fill="url(#diyaAura)" className="animate-pulse" />
          <g className="diya-flame-anim">
            <path
              d="M60 14C60 14 43 36 43 49C43 58.4 50.6 65 60 65C69.4 65 77 58.4 77 49C77 36 60 14 60 14Z"
              fill="url(#diyaFlameGrad)"
            />
            <path
              d="M60 28C60 28 51 42 51 50C51 55.2 55 59 60 59C65 59 69 55.2 69 50C69 42 60 28 60 28Z"
              fill="#FFF4DC"
            />
          </g>
        </>
      )}

      {/* Cotton Wick */}
      <path d="M60 58V67" stroke={lit ? '#FFD700' : '#A8A29E'} strokeWidth="3" strokeLinecap="round" />

      {/* Ornate Clay Bowl */}
      <path
        d="M14 64C14 64 37 73 60 73C83 73 106 64 106 64C101 89 83 103 60 103C37 103 19 89 14 64Z"
        fill="url(#diyaClayGrad)"
        stroke="#FFD700"
        strokeWidth="2.8"
      />

      {/* Decorative Golden Carvings on Diya */}
      <path
        d="M25 75C40 81 80 81 95 75"
        stroke="#FFF4DC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
      <circle cx="60" cy="87" r="4" fill="#FFD700" />
      <circle cx="44" cy="85" r="2.8" fill="#FFD700" fillOpacity="0.85" />
      <circle cx="76" cy="85" r="2.8" fill="#FFD700" fillOpacity="0.85" />

      {/* Base Pedestal */}
      <ellipse cx="60" cy="105" rx="28" ry="5" fill="#FFD700" fillOpacity="0.55" />
    </svg>
  );
}

