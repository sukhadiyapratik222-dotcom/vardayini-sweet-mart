'use client';

import React from 'react';

interface CornerMotifProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-corners' | 'top-corners' | 'all';
  className?: string;
  size?: number;
  color?: string;
}

export function SingleCornerSVG({ size = 130, className = '', color = '#D4AF37' }: { size?: number; className?: string; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id="floralGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF0B3" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA7C11" />
        </linearGradient>
        <linearGradient id="floralBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8C8E8" />
          <stop offset="100%" stopColor="#6B8EC4" />
        </linearGradient>
      </defs>

      {/* Main corner vine arc - blue */}
      <path
        d="M 2,2 Q 50,8 90,40 Q 125,72 138,138"
        stroke="url(#floralBlue)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      {/* Secondary inner vine - gold */}
      <path
        d="M 2,18 Q 40,22 72,52 Q 100,80 112,138"
        stroke="url(#floralGold)"
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
      />

      {/* Large central flower */}
      <g transform="translate(52, 52)">
        {/* Petals - blue */}
        <ellipse cx="0" cy="-14" rx="5" ry="12" fill="url(#floralBlue)" opacity="0.7" transform="rotate(0)" />
        <ellipse cx="0" cy="-14" rx="5" ry="12" fill="url(#floralBlue)" opacity="0.7" transform="rotate(45)" />
        <ellipse cx="0" cy="-14" rx="5" ry="12" fill="url(#floralBlue)" opacity="0.7" transform="rotate(90)" />
        <ellipse cx="0" cy="-14" rx="5" ry="12" fill="url(#floralBlue)" opacity="0.7" transform="rotate(135)" />
        <ellipse cx="0" cy="-14" rx="5" ry="12" fill="url(#floralBlue)" opacity="0.7" transform="rotate(180)" />
        <ellipse cx="0" cy="-14" rx="5" ry="12" fill="url(#floralBlue)" opacity="0.7" transform="rotate(225)" />
        <ellipse cx="0" cy="-14" rx="5" ry="12" fill="url(#floralBlue)" opacity="0.7" transform="rotate(270)" />
        <ellipse cx="0" cy="-14" rx="5" ry="12" fill="url(#floralBlue)" opacity="0.7" transform="rotate(315)" />
        {/* Gold center */}
        <circle cx="0" cy="0" r="6" fill="url(#floralGold)" />
        <circle cx="0" cy="0" r="3" fill="#FFF0B3" />
      </g>

      {/* Smaller flower top-right branch */}
      <g transform="translate(88, 22)">
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(0)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(60)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(120)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(180)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(240)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(300)" />
        <circle cx="0" cy="0" r="4" fill="url(#floralGold)" />
        <circle cx="0" cy="0" r="2" fill="#FFF0B3" />
      </g>

      {/* Smaller flower bottom-left branch */}
      <g transform="translate(22, 88)">
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(0)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(60)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(120)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(180)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(240)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="7" fill="url(#floralBlue)" opacity="0.65" transform="rotate(300)" />
        <circle cx="0" cy="0" r="4" fill="url(#floralGold)" />
        <circle cx="0" cy="0" r="2" fill="#FFF0B3" />
      </g>

      {/* Leaf sprigs along main vine */}
      {/* Leaf 1 */}
      <ellipse cx="28" cy="18" rx="7" ry="3.5" fill="url(#floralBlue)" opacity="0.55" transform="rotate(-35 28 18)" />
      {/* Leaf 2 */}
      <ellipse cx="18" cy="28" rx="7" ry="3.5" fill="url(#floralBlue)" opacity="0.55" transform="rotate(55 18 28)" />
      {/* Leaf 3 */}
      <ellipse cx="72" cy="34" rx="7" ry="3" fill="url(#floralBlue)" opacity="0.5" transform="rotate(-20 72 34)" />
      {/* Leaf 4 */}
      <ellipse cx="34" cy="72" rx="7" ry="3" fill="url(#floralBlue)" opacity="0.5" transform="rotate(70 34 72)" />
      {/* Leaf 5 - gold accent */}
      <ellipse cx="105" cy="48" rx="6" ry="2.8" fill="url(#floralGold)" opacity="0.45" transform="rotate(-10 105 48)" />
      <ellipse cx="48" cy="105" rx="6" ry="2.8" fill="url(#floralGold)" opacity="0.45" transform="rotate(80 48 105)" />

      {/* Gold dot berries along vine */}
      <circle cx="38" cy="12" r="3" fill="url(#floralGold)" opacity="0.8" />
      <circle cx="12" cy="38" r="3" fill="url(#floralGold)" opacity="0.8" />
      <circle cx="78" cy="20" r="2.5" fill="url(#floralGold)" opacity="0.7" />
      <circle cx="20" cy="78" r="2.5" fill="url(#floralGold)" opacity="0.7" />
      <circle cx="110" cy="62" r="2" fill="url(#floralGold)" opacity="0.6" />
      <circle cx="62" cy="110" r="2" fill="url(#floralGold)" opacity="0.6" />

      {/* Tiny blue dot accent berries */}
      <circle cx="60" cy="16" r="2" fill="url(#floralBlue)" opacity="0.6" />
      <circle cx="16" cy="60" r="2" fill="url(#floralBlue)" opacity="0.6" />
      <circle cx="95" cy="32" r="2" fill="url(#floralBlue)" opacity="0.5" />
      <circle cx="32" cy="95" r="2" fill="url(#floralBlue)" opacity="0.5" />

      {/* Tiny corner tip flourish dots */}
      <circle cx="6" cy="6" r="2.5" fill="url(#floralGold)" opacity="0.9" />
      <circle cx="10" cy="6" r="1.5" fill="url(#floralBlue)" opacity="0.7" />
      <circle cx="6" cy="10" r="1.5" fill="url(#floralBlue)" opacity="0.7" />
    </svg>
  );
}

export default function CornerMotif({
  position = 'bottom-corners',
  className = '',
  size = 130,
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
