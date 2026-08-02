'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: "Step into a World of Mithaas",
    primaryCtaLink: "/categories/sweets",
    image: "/images/hero-world-of-mithaas.png"
  },
  {
    id: 2,
    title: "Luxury Corporate & Festival Gift Boxes",
    primaryCtaLink: "/categories/corporate-gift-boxes",
    image: "/images/sweet-10.jpg"
  },
  {
    id: 3,
    title: "Authentic Gujarati Namkeen",
    primaryCtaLink: "/categories/namkeen",
    image: "/images/sweet-3.jpg"
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const slide = slides[currentSlide];

  return (
    <div
      className="w-full relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Full width banner image — no crop, no overflow hidden */}
      <Link href={slide.primaryCtaLink}>
        <img
          key={slide.id}
          src={slide.image}
          alt={slide.title}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </Link>

      {/* Left arrow */}
      <button
        onClick={(e) => { e.preventDefault(); prevSlide(); }}
        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 30 }}
        className="bg-black/40 hover:bg-black/70 text-white p-3 rounded-full border border-white/30 transition shadow-xl"
        aria-label="Previous"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Right arrow */}
      <button
        onClick={(e) => { e.preventDefault(); nextSlide(); }}
        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 30 }}
        className="bg-black/40 hover:bg-black/70 text-white p-3 rounded-full border border-white/30 transition shadow-xl"
        aria-label="Next"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}
        className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-white/20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/60 hover:bg-white'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
