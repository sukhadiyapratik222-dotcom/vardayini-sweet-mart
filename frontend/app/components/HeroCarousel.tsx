'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    tag: "HANDCRAFTED SINCE 1976",
    title: "Pure Desi Ghee Sweets & Traditional Delicacies",
    subtitle: "Made with authentic recipes passed down through generations using 100% pure A2 ghee, organic saffron & premium nuts.",
    primaryCtaText: "Shop Best Sellers",
    primaryCtaLink: "/categories/sweets",
    secondaryCtaText: "Explore Combos",
    secondaryCtaLink: "/categories/namkeen",
    bgGradient: "from-[#0B1B3D] via-[#162C5B] to-[#07122A]",
    image: "/images/sweet-1.jpg"
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
    bgGradient: "from-[#1A0B2E] via-[#2D164B] to-[#0D051A]",
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
    bgGradient: "from-[#2A1608] via-[#4A2810] to-[#1A0E05]",
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
      className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.bgGradient} border-2 border-gold/40 p-6 sm:p-12 shadow-2xl transition-all duration-700 min-h-[360px] sm:min-h-[420px] flex items-center`}>
        {/* Subtle Background Glow Elements */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 w-full">
          {/* Text Content Left Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3.5 py-1 border border-gold/40">
              <Sparkles size={14} className="text-gold" />
              <span className="text-gold text-xs font-extrabold uppercase tracking-widest">{slide.tag}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gold leading-tight tracking-tight drop-shadow-md">
              {slide.title}
            </h1>

            <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-xl">
              {slide.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href={slide.primaryCtaLink}
                className="inline-flex items-center gap-2 rounded-xl bg-gold text-[#0B1B3D] px-6 py-3 text-sm sm:text-base font-extrabold shadow-lg hover:bg-gold-light transition-all transform hover:-translate-y-0.5 border border-gold"
              >
                <span>{slide.primaryCtaText}</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href={slide.secondaryCtaLink}
                className="inline-flex items-center gap-2 rounded-xl bg-transparent text-gold px-6 py-3 text-sm sm:text-base font-bold transition hover:bg-gold/10 border border-gold/50"
              >
                <span>{slide.secondaryCtaText}</span>
              </Link>
            </div>
          </div>

          {/* Image & Showcase Right Column */}
          <div className="lg:col-span-5 hidden lg:flex justify-end">
            <div className="relative w-80 h-72 rounded-2xl overflow-hidden border-2 border-gold/40 shadow-2xl group">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="bg-gold text-[#0B1B3D] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">Featured Item</span>
                <p className="text-xs font-bold mt-1 text-gold-light truncate">{slide.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-gold hover:text-[#0B1B3D] text-white p-2.5 rounded-full backdrop-blur-md border border-gold/40 transition z-20"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-gold hover:text-[#0B1B3D] text-white p-2.5 rounded-full backdrop-blur-md border border-gold/40 transition z-20"
          aria-label="Next Slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Carousel Indicators / Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === index ? 'w-8 bg-gold' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
