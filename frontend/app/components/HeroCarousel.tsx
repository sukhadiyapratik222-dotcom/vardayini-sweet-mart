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
      className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 relative max-w-7xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${slide.bgGradient} border-2 border-gold/50 p-6 sm:p-12 shadow-2xl transition-all duration-700 min-h-[380px] sm:min-h-[440px] flex items-center`}>
        {/* Traditional Ornate Golden Corner Motifs - Set on all 4 corners like the logo banner design */}
        <CornerMotif position="all" size={130} />

        {/* Subtle Background Radial Glow Elements */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gold/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 w-full px-2 sm:px-6">
          {/* Text Content Left Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-1.5 border border-gold/50 backdrop-blur-sm shadow-md">
              <Sparkles size={14} className="text-gold-light animate-pulse" />
              <span className="text-gold-light text-xs font-black uppercase tracking-widest">{slide.tag}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gold-light leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {slide.title}
            </h1>

            <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-xl font-medium">
              {slide.subtitle}
            </p>

            <div className="pt-3 flex flex-wrap gap-4 items-center">
              <Link
                href={slide.primaryCtaLink}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5E5A3] via-[#D4AF37] to-[#AA7C11] text-[#0B1B3D] px-7 py-3.5 text-sm sm:text-base font-extrabold shadow-xl hover:brightness-110 transition-all transform hover:-translate-y-0.5 border border-gold"
              >
                <span>{slide.primaryCtaText}</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href={slide.secondaryCtaLink}
                className="inline-flex items-center gap-2 rounded-xl bg-black/30 backdrop-blur-md text-gold-light px-6 py-3.5 text-sm sm:text-base font-bold transition hover:bg-gold/20 border border-gold/60"
              >
                <span>{slide.secondaryCtaText}</span>
              </Link>
            </div>
          </div>

          {/* Image & Showcase Right Column */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs sm:max-w-sm lg:w-80 h-48 sm:h-60 lg:h-72 rounded-2xl overflow-hidden border-2 border-gold/60 shadow-2xl group">
              <CornerMotif position="bottom-corners" size={70} />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white z-20">
                <span className="bg-gold text-[#0B1B3D] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">Featured Authentic Sweet</span>
                <p className="text-xs font-bold mt-1 text-[#F5E5A3] truncate">{slide.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-gold hover:text-[#0B1B3D] text-gold p-3 rounded-full backdrop-blur-md border border-gold/50 transition z-30 shadow-lg"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-gold hover:text-[#0B1B3D] text-gold p-3 rounded-full backdrop-blur-md border border-gold/50 transition z-30 shadow-lg"
          aria-label="Next Slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Carousel Indicators / Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === index ? 'w-8 bg-gold shadow-md' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
