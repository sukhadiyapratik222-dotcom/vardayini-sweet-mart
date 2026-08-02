'use client';

import React from 'react';

interface CornerMotifProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-corners' | 'top-corners' | 'all';
  className?: string;
  size?: number;
  color?: string;
}

export function SingleCornerSVG({ size = 160, className = '' }: { size?: number; className?: string; color?: string }) {
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
        {/* Soft blue-gray for vines and leaves */}
        <linearGradient id="blueVine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8B8D8" />
          <stop offset="100%" stopColor="#7090B8" />
        </linearGradient>
        {/* Yellow-gold for flowers */}
        <linearGradient id="yellowFlower" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E270" />
          <stop offset="60%" stopColor="#E8C840" />
          <stop offset="100%" stopColor="#C8A020" />
        </linearGradient>
        {/* Soft gold for accents */}
        <linearGradient id="softGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8EFA0" />
          <stop offset="100%" stopColor="#D4B840" />
        </linearGradient>
      </defs>

      {/* === MAIN CURVING VINE STEMS (blue-gray) === */}
      {/* Large outer arc from corner */}
      <path d="M 2,2 C 22,14 50,38 70,68 C 85,90 92,118 88,148"
        stroke="url(#blueVine)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.75"/>
      {/* Upper branch arc */}
      <path d="M 2,2 C 16,10 45,20 78,32 C 108,44 135,62 152,88"
        stroke="url(#blueVine)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.75"/>
      {/* Mid inner stem */}
      <path d="M 18,6 C 32,10 58,26 78,50 C 95,70 100,95 98,120"
        stroke="url(#blueVine)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
      {/* Inner left stem */}
      <path d="M 6,18 C 10,32 26,58 50,78 C 70,95 95,100 120,98"
        stroke="url(#blueVine)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
      {/* Curling tendril top-right */}
      <path d="M 78,32 C 88,24 100,24 106,34 C 110,42 104,54 96,56"
        stroke="url(#blueVine)" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65"/>
      {/* Curling tendril bottom-left */}
      <path d="M 32,78 C 24,88 24,100 34,106 C 42,110 54,104 56,96"
        stroke="url(#blueVine)" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65"/>
      {/* Small side curls */}
      <path d="M 50,22 C 56,16 66,16 70,24 C 73,30 68,40 62,40"
        stroke="url(#blueVine)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.55"/>
      <path d="M 22,50 C 16,56 16,66 24,70 C 30,73 40,68 40,62"
        stroke="url(#blueVine)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.55"/>

      {/* === YELLOW ROUND FLOWERS === */}
      {/* Large flower - center of design */}
      <g transform="translate(70, 70)">
        {/* 8 petals */}
        <ellipse cx="0" cy="-13" rx="5.5" ry="11" fill="url(#yellowFlower)" opacity="0.85"/>
        <ellipse cx="0" cy="-13" rx="5.5" ry="11" fill="url(#yellowFlower)" opacity="0.85" transform="rotate(45)"/>
        <ellipse cx="0" cy="-13" rx="5.5" ry="11" fill="url(#yellowFlower)" opacity="0.85" transform="rotate(90)"/>
        <ellipse cx="0" cy="-13" rx="5.5" ry="11" fill="url(#yellowFlower)" opacity="0.85" transform="rotate(135)"/>
        <ellipse cx="0" cy="-13" rx="5.5" ry="11" fill="url(#yellowFlower)" opacity="0.85" transform="rotate(180)"/>
        <ellipse cx="0" cy="-13" rx="5.5" ry="11" fill="url(#yellowFlower)" opacity="0.85" transform="rotate(225)"/>
        <ellipse cx="0" cy="-13" rx="5.5" ry="11" fill="url(#yellowFlower)" opacity="0.85" transform="rotate(270)"/>
        <ellipse cx="0" cy="-13" rx="5.5" ry="11" fill="url(#yellowFlower)" opacity="0.85" transform="rotate(315)"/>
        {/* Center */}
        <circle cx="0" cy="0" r="7" fill="#C8A020"/>
        <circle cx="0" cy="0" r="4" fill="#F5E270"/>
        <circle cx="0" cy="0" r="2" fill="#FFF8C0"/>
      </g>

      {/* Medium flower - upper right */}
      <g transform="translate(108, 36)">
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(0)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(60)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(120)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(180)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(240)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(300)"/>
        <circle cx="0" cy="0" r="5" fill="#C8A020"/>
        <circle cx="0" cy="0" r="2.5" fill="#F5E270"/>
      </g>

      {/* Medium flower - lower left */}
      <g transform="translate(36, 108)">
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(0)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(60)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(120)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(180)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(240)"/>
        <ellipse cx="0" cy="-9" rx="4" ry="8" fill="url(#yellowFlower)" opacity="0.82" transform="rotate(300)"/>
        <circle cx="0" cy="0" r="5" fill="#C8A020"/>
        <circle cx="0" cy="0" r="2.5" fill="#F5E270"/>
      </g>

      {/* Small flower - along top vine */}
      <g transform="translate(140, 60)">
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(0)"/>
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(72)"/>
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(144)"/>
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(216)"/>
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(288)"/>
        <circle cx="0" cy="0" r="4" fill="#C8A020"/>
        <circle cx="0" cy="0" r="2" fill="#F5E270"/>
      </g>

      {/* Small flower - along left vine */}
      <g transform="translate(60, 140)">
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(0)"/>
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(72)"/>
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(144)"/>
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(216)"/>
        <ellipse cx="0" cy="-7" rx="3" ry="6" fill="url(#yellowFlower)" opacity="0.78" transform="rotate(288)"/>
        <circle cx="0" cy="0" r="4" fill="#C8A020"/>
        <circle cx="0" cy="0" r="2" fill="#F5E270"/>
      </g>

      {/* Tiny flowers near corner */}
      <g transform="translate(38, 28)">
        <ellipse cx="0" cy="-5" rx="2.2" ry="4.5" fill="url(#yellowFlower)" opacity="0.75" transform="rotate(0)"/>
        <ellipse cx="0" cy="-5" rx="2.2" ry="4.5" fill="url(#yellowFlower)" opacity="0.75" transform="rotate(90)"/>
        <ellipse cx="0" cy="-5" rx="2.2" ry="4.5" fill="url(#yellowFlower)" opacity="0.75" transform="rotate(180)"/>
        <ellipse cx="0" cy="-5" rx="2.2" ry="4.5" fill="url(#yellowFlower)" opacity="0.75" transform="rotate(270)"/>
        <circle cx="0" cy="0" r="3" fill="#C8A020"/>
        <circle cx="0" cy="0" r="1.5" fill="#F5E270"/>
      </g>
      <g transform="translate(28, 38)">
        <ellipse cx="0" cy="-5" rx="2.2" ry="4.5" fill="url(#yellowFlower)" opacity="0.75" transform="rotate(0)"/>
        <ellipse cx="0" cy="-5" rx="2.2" ry="4.5" fill="url(#yellowFlower)" opacity="0.75" transform="rotate(90)"/>
        <ellipse cx="0" cy="-5" rx="2.2" ry="4.5" fill="url(#yellowFlower)" opacity="0.75" transform="rotate(180)"/>
        <ellipse cx="0" cy="-5" rx="2.2" ry="4.5" fill="url(#yellowFlower)" opacity="0.75" transform="rotate(270)"/>
        <circle cx="0" cy="0" r="3" fill="#C8A020"/>
        <circle cx="0" cy="0" r="1.5" fill="#F5E270"/>
      </g>

      {/* === BLUE-GRAY LEAVES === */}
      {/* Large leaves at main junction */}
      <ellipse cx="46" cy="44" rx="12" ry="5" fill="url(#blueVine)" opacity="0.6" transform="rotate(-40 46 44)"/>
      <ellipse cx="44" cy="46" rx="12" ry="5" fill="url(#blueVine)" opacity="0.6" transform="rotate(50 44 46)"/>
      {/* Leaf pair mid-upper */}
      <ellipse cx="84" cy="42" rx="9" ry="4" fill="url(#blueVine)" opacity="0.55" transform="rotate(-20 84 42)"/>
      <ellipse cx="86" cy="44" rx="9" ry="4" fill="url(#blueVine)" opacity="0.55" transform="rotate(30 86 44)"/>
      {/* Leaf pair mid-left */}
      <ellipse cx="42" cy="84" rx="9" ry="4" fill="url(#blueVine)" opacity="0.55" transform="rotate(70 42 84)"/>
      <ellipse cx="44" cy="86" rx="9" ry="4" fill="url(#blueVine)" opacity="0.55" transform="rotate(120 44 86)"/>
      {/* Leaf outer right */}
      <ellipse cx="118" cy="68" rx="8" ry="3.5" fill="url(#blueVine)" opacity="0.5" transform="rotate(-10 118 68)"/>
      {/* Leaf outer bottom */}
      <ellipse cx="68" cy="118" rx="8" ry="3.5" fill="url(#blueVine)" opacity="0.5" transform="rotate(80 68 118)"/>
      {/* Tiny leaves near corner */}
      <ellipse cx="18" cy="28" rx="6" ry="2.5" fill="url(#blueVine)" opacity="0.5" transform="rotate(-50 18 28)"/>
      <ellipse cx="28" cy="18" rx="6" ry="2.5" fill="url(#blueVine)" opacity="0.5" transform="rotate(40 28 18)"/>
      {/* Extra leaf clusters */}
      <ellipse cx="55" cy="94" rx="7" ry="3" fill="url(#blueVine)" opacity="0.48" transform="rotate(60 55 94)"/>
      <ellipse cx="94" cy="55" rx="7" ry="3" fill="url(#blueVine)" opacity="0.48" transform="rotate(-30 94 55)"/>

      {/* === BLUE-GRAY ROUND BERRY DOTS (small) === */}
      <circle cx="56" cy="18" r="3" fill="url(#blueVine)" opacity="0.7"/>
      <circle cx="18" cy="56" r="3" fill="url(#blueVine)" opacity="0.7"/>
      <circle cx="98" cy="20" r="2.5" fill="url(#blueVine)" opacity="0.65"/>
      <circle cx="20" cy="98" r="2.5" fill="url(#blueVine)" opacity="0.65"/>
      <circle cx="148" cy="68" r="2.2" fill="url(#blueVine)" opacity="0.6"/>
      <circle cx="68" cy="148" r="2.2" fill="url(#blueVine)" opacity="0.6"/>
      <circle cx="128" cy="40" r="2" fill="url(#blueVine)" opacity="0.55"/>
      <circle cx="40" cy="128" r="2" fill="url(#blueVine)" opacity="0.55"/>

      {/* === GOLD ACCENT DOTS === */}
      <circle cx="82" cy="14" r="3" fill="url(#softGold)" opacity="0.85"/>
      <circle cx="14" cy="82" r="3" fill="url(#softGold)" opacity="0.85"/>
      <circle cx="158" cy="76" r="2.5" fill="url(#softGold)" opacity="0.8"/>
      <circle cx="76" cy="158" r="2.5" fill="url(#softGold)" opacity="0.8"/>
      <circle cx="110" cy="8" r="2.2" fill="url(#softGold)" opacity="0.75"/>
      <circle cx="8" cy="110" r="2.2" fill="url(#softGold)" opacity="0.75"/>
      <circle cx="170" cy="96" r="2" fill="url(#softGold)" opacity="0.7"/>
      <circle cx="96" cy="170" r="2" fill="url(#softGold)" opacity="0.7"/>

      {/* === CORNER ANCHOR === */}
      <circle cx="4" cy="4" r="3.5" fill="url(#softGold)" opacity="0.9"/>
      <circle cx="11" cy="4" r="2" fill="url(#blueVine)" opacity="0.75"/>
      <circle cx="4" cy="11" r="2" fill="url(#blueVine)" opacity="0.75"/>
    </svg>
  );
}

export default function CornerMotif({
  position = 'bottom-corners',
  className = '',
  size = 160,
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
