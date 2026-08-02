'use client';

import React from 'react';

interface CornerMotifProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-corners' | 'top-corners' | 'all';
  className?: string;
  size?: number; // Size in px for individual corner SVGs
  color?: string;
}

export function SingleCornerSVG({ size = 96, className = '', color = '#D4AF37' }: { size?: number; className?: string; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)] ${className}`}
    >
      <defs>
        <linearGradient id="goldMotifGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF0B3" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="80%" stopColor="#AA7C11" />
          <stop offset="100%" stopColor="#694C05" />
        </linearGradient>
        <radialGradient id="glowGlow" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#F5E5A3" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow */}
      <circle cx="0" cy="0" r="70" fill="url(#glowGlow)" />

      {/* Main Outer Arching Floral Scroll */}
      <path
        d="M 5,5 Q 60,10 85,35 Q 105,60 115,115 C 105,80 80,45 45,30 C 25,20 10,12 5,5 Z"
        fill="url(#goldMotifGrad)"
        opacity="0.95"
      />

      {/* Inner Ornate Paisley Curve */}
      <path
        d="M 5,20 C 25,25 55,40 65,70 C 72,90 75,105 75,115 C 70,95 60,80 45,60 C 30,42 18,28 5,20 Z"
        fill="url(#goldMotifGrad)"
        opacity="0.85"
      />

      {/* Traditional Indian Mandala Flower Petals at Origin */}
      <g transform="translate(18, 18)">
        {/* Central Lotus Petal */}
        <path d="M 0,0 C 8,12 18,22 30,30 C 20,24 10,14 0,0 Z" fill="url(#goldMotifGrad)" />
        <path d="M 0,0 C 14,8 24,18 32,32 C 24,20 14,10 0,0 Z" fill="url(#goldMotifGrad)" opacity="0.9" />
        <path d="M 0,0 Q 25,5 38,18 Q 20,15 0,0 Z" fill="url(#goldMotifGrad)" opacity="0.8" />
        <path d="M 0,0 Q 5,25 18,38 Q 15,20 0,0 Z" fill="url(#goldMotifGrad)" opacity="0.8" />

        {/* Small Decorative Beads/Dots */}
        <circle cx="28" cy="8" r="2.5" fill="#FFF0B3" />
        <circle cx="36" cy="16" r="3" fill="#FFD700" />
        <circle cx="42" cy="26" r="2.5" fill="#D4AF37" />
        <circle cx="8" cy="28" r="2.5" fill="#FFF0B3" />
        <circle cx="16" cy="36" r="3" fill="#FFD700" />
        <circle cx="26" cy="42" r="2.5" fill="#D4AF37" />
      </g>

      {/* Elegant Leaf Swirl Accents */}
      <path
        d="M 12,5 C 35,5 65,22 80,48 C 65,32 40,18 12,5 Z"
        fill="url(#goldMotifGrad)"
        opacity="0.9"
      />
      <path
        d="M 5,12 C 5,35 22,65 48,80 C 32,65 18,40 5,12 Z"
        fill="url(#goldMotifGrad)"
        opacity="0.9"
      />

      {/* Decorative Outer Star / Sparkle Ring */}
      <g transform="translate(92, 92)">
        <path d="M 0,-6 L 2,-2 L 6,0 L 2,2 L 0,6 L -2,2 L -6,0 L -2,-2 Z" fill="#FFF0B3" />
      </g>
      <g transform="translate(68, 68)">
        <circle cx="0" cy="0" r="2" fill="#FFF0B3" />
      </g>
    </svg>
  );
}

export default function CornerMotif({
  position = 'bottom-corners',
  className = '',
  size = 110,
  color = '#D4AF37',
}: CornerMotifProps) {
  const showTopLeft = position === 'top-left' || position === 'top-corners' || position === 'all';
  const showTopRight = position === 'top-right' || position === 'top-corners' || position === 'all';
  const showBottomLeft = position === 'bottom-left' || position === 'bottom-corners' || position === 'all';
  const showBottomRight = position === 'bottom-right' || position === 'bottom-corners' || position === 'all';

  return (
    <>
      {showTopLeft && (
        <div className={`absolute top-0 left-0 pointer-events-none z-10 ${className}`}>
          <SingleCornerSVG size={size} color={color} />
        </div>
      )}

      {showTopRight && (
        <div className={`absolute top-0 right-0 pointer-events-none z-10 transform scale-x-[-1] ${className}`}>
          <SingleCornerSVG size={size} color={color} />
        </div>
      )}

      {showBottomLeft && (
        <div className={`absolute bottom-0 left-0 pointer-events-none z-10 transform scale-y-[-1] ${className}`}>
          <SingleCornerSVG size={size} color={color} />
        </div>
      )}

      {showBottomRight && (
        <div className={`absolute bottom-0 right-0 pointer-events-none z-10 transform scale-x-[-1] scale-y-[-1] ${className}`}>
          <SingleCornerSVG size={size} color={color} />
        </div>
      )}
    </>
  );
}
