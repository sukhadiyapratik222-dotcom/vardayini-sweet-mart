'use client';

import React from 'react';

interface CornerMotifProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-corners' | 'top-corners' | 'all';
  className?: string;
  size?: number;
  color?: string;
}

export function SingleCornerSVG({ size = 150, className = '' }: { size?: number; className?: string; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id="goldVine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF5C0" />
          <stop offset="50%" stopColor="#E8C84A" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
        <linearGradient id="goldFlower" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFADC" />
          <stop offset="60%" stopColor="#F0D060" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="blueFlower" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A5FA0" />
          <stop offset="100%" stopColor="#7B9ED9" />
        </linearGradient>
      </defs>

      {/* === MAIN VINE STEMS === */}
      {/* Primary large curving stem from corner outward */}
      <path d="M 4,4 C 20,12 40,30 55,55 C 65,72 70,92 68,115" stroke="url(#goldVine)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Secondary stem branching right */}
      <path d="M 4,4 C 18,10 42,18 68,28 C 90,38 112,50 128,68" stroke="url(#goldVine)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Branch stem top */}
      <path d="M 22,8 C 35,5 55,8 70,18 C 85,28 95,45 95,62" stroke="url(#goldVine)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Branch stem left */}
      <path d="M 8,22 C 5,35 8,55 18,70 C 28,85 45,95 62,95" stroke="url(#goldVine)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Small curling tendrils */}
      <path d="M 55,55 C 60,48 70,44 78,50 C 84,55 82,65 75,68" stroke="url(#goldVine)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M 68,28 C 75,22 85,22 90,30 C 94,38 88,48 80,48" stroke="url(#goldVine)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M 28,68 C 22,75 22,85 30,90 C 38,94 48,88 48,80" stroke="url(#goldVine)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

      {/* === GOLD TULIP FLOWERS === */}
      {/* Big tulip at center - main flower */}
      <g transform="translate(68, 68)">
        {/* Stem base */}
        <line x1="0" y1="0" x2="0" y2="14" stroke="url(#goldVine)" strokeWidth="2"/>
        {/* Left petal */}
        <path d="M -3,12 C -14,4 -16,-10 -6,-18 C -2,-21 2,-20 4,-16 C 6,-10 4,0 -3,12 Z" fill="url(#goldFlower)" opacity="0.95"/>
        {/* Right petal */}
        <path d="M 3,12 C 14,4 16,-10 6,-18 C 2,-21 -2,-20 -4,-16 C -6,-10 -4,0 3,12 Z" fill="url(#goldFlower)" opacity="0.95"/>
        {/* Center petal (taller) */}
        <path d="M 0,10 C -5,0 -5,-14 0,-22 C 5,-14 5,0 0,10 Z" fill="#FFF8D0" opacity="0.9"/>
        {/* Gold base sepal */}
        <path d="M -5,12 Q 0,18 5,12 L 3,14 Q 0,20 -3,14 Z" fill="url(#goldFlower)"/>
      </g>

      {/* Medium tulip top-right area */}
      <g transform="translate(110, 35)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="url(#goldVine)" strokeWidth="1.8"/>
        <path d="M -2.5,9 C -10,3 -12,-7 -5,-14 C -2,-16 2,-15 3,-12 C 5,-8 3,1 -2.5,9 Z" fill="url(#goldFlower)" opacity="0.9"/>
        <path d="M 2.5,9 C 10,3 12,-7 5,-14 C 2,-16 -2,-15 -3,-12 C -5,-8 -3,1 2.5,9 Z" fill="url(#goldFlower)" opacity="0.9"/>
        <path d="M 0,8 C -4,0 -4,-10 0,-16 C 4,-10 4,0 0,8 Z" fill="#FFF8D0" opacity="0.85"/>
        <path d="M -4,9 Q 0,14 4,9 L 2,11 Q 0,16 -2,11 Z" fill="url(#goldFlower)"/>
      </g>

      {/* Medium tulip left-bottom area */}
      <g transform="translate(35, 110)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="url(#goldVine)" strokeWidth="1.8"/>
        <path d="M -2.5,9 C -10,3 -12,-7 -5,-14 C -2,-16 2,-15 3,-12 C 5,-8 3,1 -2.5,9 Z" fill="url(#goldFlower)" opacity="0.9"/>
        <path d="M 2.5,9 C 10,3 12,-7 5,-14 C 2,-16 -2,-15 -3,-12 C -5,-8 -3,1 2.5,9 Z" fill="url(#goldFlower)" opacity="0.9"/>
        <path d="M 0,8 C -4,0 -4,-10 0,-16 C 4,-10 4,0 0,8 Z" fill="#FFF8D0" opacity="0.85"/>
        <path d="M -4,9 Q 0,14 4,9 L 2,11 Q 0,16 -2,11 Z" fill="url(#goldFlower)"/>
      </g>

      {/* Small tulip on side branch */}
      <g transform="translate(82, 18)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="url(#goldVine)" strokeWidth="1.5"/>
        <path d="M -2,7 C -8,2 -9,-5 -4,-10 C -2,-12 2,-11 3,-9 C 4,-6 3,0 -2,7 Z" fill="url(#goldFlower)" opacity="0.88"/>
        <path d="M 2,7 C 8,2 9,-5 4,-10 C 2,-12 -2,-11 -3,-9 C -4,-6 -3,0 2,7 Z" fill="url(#goldFlower)" opacity="0.88"/>
        <path d="M 0,6 C -3,0 -3,-7 0,-12 C 3,-7 3,0 0,6 Z" fill="#FFF8D0" opacity="0.8"/>
      </g>
      <g transform="translate(18, 82)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="url(#goldVine)" strokeWidth="1.5"/>
        <path d="M -2,7 C -8,2 -9,-5 -4,-10 C -2,-12 2,-11 3,-9 C 4,-6 3,0 -2,7 Z" fill="url(#goldFlower)" opacity="0.88"/>
        <path d="M 2,7 C 8,2 9,-5 4,-10 C 2,-12 -2,-11 -3,-9 C -4,-6 -3,0 2,7 Z" fill="url(#goldFlower)" opacity="0.88"/>
        <path d="M 0,6 C -3,0 -3,-7 0,-12 C 3,-7 3,0 0,6 Z" fill="#FFF8D0" opacity="0.8"/>
      </g>

      {/* === BLUE ROUND FLOWERS === */}
      {/* Large blue flower - upper branch */}
      <g transform="translate(95, 62)">
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(60)"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(120)"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(180)"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(240)"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(300)"/>
        <circle cx="0" cy="0" r="5" fill="#2A3A78"/>
        <circle cx="0" cy="0" r="2.5" fill="#E8D070"/>
      </g>

      {/* Large blue flower - left branch */}
      <g transform="translate(62, 95)">
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(60)"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(120)"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(180)"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(240)"/>
        <circle cx="0" cy="-9" r="5" fill="url(#blueFlower)" opacity="0.85" transform="rotate(300)"/>
        <circle cx="0" cy="0" r="5" fill="#2A3A78"/>
        <circle cx="0" cy="0" r="2.5" fill="#E8D070"/>
      </g>

      {/* Small blue flower mid-right */}
      <g transform="translate(128, 50)">
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8"/>
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8" transform="rotate(72)"/>
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8" transform="rotate(144)"/>
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8" transform="rotate(216)"/>
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8" transform="rotate(288)"/>
        <circle cx="0" cy="0" r="3.5" fill="#2A3A78"/>
        <circle cx="0" cy="0" r="1.8" fill="#E8D070"/>
      </g>

      {/* Small blue flower mid-bottom */}
      <g transform="translate(50, 128)">
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8"/>
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8" transform="rotate(72)"/>
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8" transform="rotate(144)"/>
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8" transform="rotate(216)"/>
        <circle cx="0" cy="-6" r="3.5" fill="url(#blueFlower)" opacity="0.8" transform="rotate(288)"/>
        <circle cx="0" cy="0" r="3.5" fill="#2A3A78"/>
        <circle cx="0" cy="0" r="1.8" fill="#E8D070"/>
      </g>

      {/* Tiny blue flower near corner */}
      <g transform="translate(40, 28)">
        <circle cx="0" cy="-4.5" r="2.8" fill="url(#blueFlower)" opacity="0.75"/>
        <circle cx="0" cy="-4.5" r="2.8" fill="url(#blueFlower)" opacity="0.75" transform="rotate(90)"/>
        <circle cx="0" cy="-4.5" r="2.8" fill="url(#blueFlower)" opacity="0.75" transform="rotate(180)"/>
        <circle cx="0" cy="-4.5" r="2.8" fill="url(#blueFlower)" opacity="0.75" transform="rotate(270)"/>
        <circle cx="0" cy="0" r="2.8" fill="#2A3A78"/>
        <circle cx="0" cy="0" r="1.2" fill="#E8D070"/>
      </g>
      <g transform="translate(28, 40)">
        <circle cx="0" cy="-4.5" r="2.8" fill="url(#blueFlower)" opacity="0.75"/>
        <circle cx="0" cy="-4.5" r="2.8" fill="url(#blueFlower)" opacity="0.75" transform="rotate(90)"/>
        <circle cx="0" cy="-4.5" r="2.8" fill="url(#blueFlower)" opacity="0.75" transform="rotate(180)"/>
        <circle cx="0" cy="-4.5" r="2.8" fill="url(#blueFlower)" opacity="0.75" transform="rotate(270)"/>
        <circle cx="0" cy="0" r="2.8" fill="#2A3A78"/>
        <circle cx="0" cy="0" r="1.2" fill="#E8D070"/>
      </g>

      {/* === GOLD LEAVES === */}
      <ellipse cx="45" cy="42" rx="10" ry="4.5" fill="url(#goldFlower)" opacity="0.7" transform="rotate(-40 45 42)"/>
      <ellipse cx="42" cy="45" rx="10" ry="4.5" fill="url(#goldFlower)" opacity="0.7" transform="rotate(50 42 45)"/>
      <ellipse cx="80" cy="42" rx="8" ry="3.5" fill="url(#goldFlower)" opacity="0.65" transform="rotate(-20 80 42)"/>
      <ellipse cx="42" cy="80" rx="8" ry="3.5" fill="url(#goldFlower)" opacity="0.65" transform="rotate(70 42 80)"/>
      <ellipse cx="112" cy="70" rx="7" ry="3" fill="url(#goldFlower)" opacity="0.6" transform="rotate(-10 112 70)"/>
      <ellipse cx="70" cy="112" rx="7" ry="3" fill="url(#goldFlower)" opacity="0.6" transform="rotate(80 70 112)"/>

      {/* === GOLD DOT BERRIES / ACCENT DOTS === */}
      <circle cx="58" cy="22" r="3" fill="#F0D060" opacity="0.9"/>
      <circle cx="22" cy="58" r="3" fill="#F0D060" opacity="0.9"/>
      <circle cx="100" cy="20" r="2.5" fill="#F0D060" opacity="0.85"/>
      <circle cx="20" cy="100" r="2.5" fill="#F0D060" opacity="0.85"/>
      <circle cx="140" cy="55" r="2.2" fill="#F0D060" opacity="0.8"/>
      <circle cx="55" cy="140" r="2.2" fill="#F0D060" opacity="0.8"/>
      <circle cx="75" cy="75" r="2" fill="#FFF8A0" opacity="0.7"/>
      <circle cx="90" cy="80" r="1.5" fill="#F0D060" opacity="0.65"/>
      <circle cx="80" cy="90" r="1.5" fill="#F0D060" opacity="0.65"/>

      {/* Blue dot accents */}
      <circle cx="72" cy="15" r="2.2" fill="#6B8ED9" opacity="0.8"/>
      <circle cx="15" cy="72" r="2.2" fill="#6B8ED9" opacity="0.8"/>
      <circle cx="115" cy="38" r="1.8" fill="#6B8ED9" opacity="0.7"/>
      <circle cx="38" cy="115" r="1.8" fill="#6B8ED9" opacity="0.7"/>
      <circle cx="145" cy="75" r="1.5" fill="#6B8ED9" opacity="0.65"/>
      <circle cx="75" cy="145" r="1.5" fill="#6B8ED9" opacity="0.65"/>

      {/* Corner anchor dot */}
      <circle cx="5" cy="5" r="3" fill="#F0D060" opacity="0.95"/>
      <circle cx="12" cy="5" r="2" fill="#6B8ED9" opacity="0.8"/>
      <circle cx="5" cy="12" r="2" fill="#6B8ED9" opacity="0.8"/>
    </svg>
  );
}

export default function CornerMotif({
  position = 'bottom-corners',
  className = '',
  size = 150,
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
