'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import CornerMotif from './CornerMotif';

const slides = [
  {
    id: 1,
    tag: "WELCOME TO VARDAYINI SWEET MART",
    title: "Step into a World of Mithaas",
    subtitle: "Authentic sweets and crispy namkeens, crafted with pure ingredients and lots of prem.",
    primaryCtaText: "Explore Sweets",
    primaryCtaLink: "/categories/sweets",
    secondaryCtaText: "Shop Namkeen",
    secondaryCtaLink: "/categories/namkeen",
    bgGradient: "from-[#FBF3D5] via-[#FFF8E7] to-[#FDF4DC]",
    image: "/images/hero-world-of-mithaas.png"
  },
  {
    id: 2,
    tag: "ROYAL FESTIVE SELECTIONS",
    title: "Luxury Corporate & Festival Gift Boxes",
    subtitle: "Elevate your celebrations with custom-packed assortment of Kaju Katli, Turkish Baklava, Roasted Dry Fruits & Savories.",
    primaryCtaText: "Explore Gift Boxes",
    primaryCtaLink: "/categories/corporate-gift-boxes",
    secondaryCtaText: "Custom Packaging",
    secondaryCtaLink: "/categories/dry-fruits-nuts",
    bgGradient: "from-[#0A1C5C] via-[#0B2580] to-[#081745]",
    image: "/images/sweet-10.jpg"
  },
  {
    id: 3,
    tag: "PREMIUM CRISPY SAVORIES",
    title: "Authentic Gujarati Namkeen & Roasted Khakhra",
    subtitle: "From Ratlami Sev and spiced Farali chivda to oven-baked whole wheat khakhra — crispy perfection in every bite.",
    primaryCtaText: "Shop Namkeen",
    primaryCtaLink: "/categories/namkeen",
    secondaryCtaText: "View Bakery Specials",
    secondaryCtaLink: "/categories/bakery",
    bgGradient: "from-[#0D226B] via-[#162C5B] to-[#07122A]",
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

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <section
      className="w-full relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full bg-[#FDF4DC]">
        <Link href={slide.primaryCtaLink} className="block w-full">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full block"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </Link>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={(e) => { e.preventDefault(); prevSlide(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full border border-white/30 transition z-30 shadow-2xl"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); nextSlide(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full border border-white/30 transition z-30 shadow-2xl"
          aria-label="Next Slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Carousel Indicators / Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30 bg-black/30 px-4 py-2 rounded-full border border-white/20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === index ? 'w-8 bg-amber-500 shadow-md' : 'w-2.5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
