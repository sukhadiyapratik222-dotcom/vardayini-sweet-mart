'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { Product } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products: Product[];
  categoryLink?: string;
}

export default function ProductSlider({
  title,
  subtitle,
  products,
  categoryLink,
}: ProductSliderProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { addToCart, setIsOpen } = useCart();

  // True infinite loop: auto-scroll every 5s, silently reset at halfway point
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const container = sliderRef.current;
      if (!container) return;
      const half = container.scrollWidth / 2;
      // If we've scrolled past the first copy, silently jump back to start
      if (container.scrollLeft >= half - 10) {
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = 0;
        // Re-enable smooth scroll after reset
        requestAnimationFrame(() => {
          container.style.scrollBehavior = 'smooth';
        });
      } else {
        container.scrollBy({ left: 270, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    const container = sliderRef.current;
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const handleAddToCart = async (product: Product, selectedWeight: string) => {
    const variant = product.variants.find((v) => v.weight === selectedWeight) || product.variants[0];
    const targetVariantId = variant.id || `${product.id}-${variant.weight}`;

    await addToCart(targetVariantId, 1);

    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);

    if (setIsOpen) {
      setIsOpen(true);
    }
  };

  return (
    <section className="py-8 sm:py-10">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl sm:text-4xl font-black">
          {(() => {
            const words = title.replace(/[🔥✨👑🎁]/g, '').trim().split(' ');
            const first = words[0];
            const rest = words.slice(1).join(' ');
            return (
              <>
                <span style={{ color: '#1a1a1a' }}>{first} </span>
                <span style={{ color: '#e07b27' }}>{rest}</span>
              </>
            );
          })()}
        </h2>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-4 pt-1 px-4"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {products.length === 0 && (
            // Skeleton loader for empty state
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-52 sm:w-64 md:w-72">
                <div className="rounded-2xl border-2 border-gold/10 bg-white overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded-xl mt-4" />
                  </div>
                </div>
              </div>
            ))
          )}
          {/* Render products TWICE for seamless infinite loop */}
          {products.length > 0 && [...products, ...products].map((product, loopIndex) => {
            const selectedWeight = selectedVariants[product.id];
            const variant = selectedWeight ? product.variants.find((v) => v.weight === selectedWeight) : undefined;
            const totalStock = product.variants.reduce((sum, v: any) => sum + Number(v.stockQty ?? v.stock ?? 0), 0);
            const isOutOfStock = totalStock <= 0;

            const minPrice = Math.min(...product.variants.map((v) => v.discountedPrice || v.price));
            const maxPrice = Math.max(...product.variants.map((v) => v.price));
            const priceRange = minPrice === maxPrice ? `₹${minPrice.toLocaleString('en-IN')}` : `₹${minPrice.toLocaleString('en-IN')}–₹${maxPrice.toLocaleString('en-IN')}`;

            const displayPrice = variant ? `₹${(variant.discountedPrice || variant.price).toLocaleString('en-IN')}` : priceRange;
            const isAdded = addedItems[product.id];

            return (
              <div key={`${product.id}-${loopIndex}`} className="flex-shrink-0 w-44 sm:w-52 md:w-60 group">
                <article className="flex flex-col transition-all duration-300 h-full">

                  {/* Image Container */}
                  <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
                    <img
                      src={(product as any).image || (product as any).primaryImage || (product as any).imageUrls?.[0] || (product as any).productImages?.[0]?.imageUrl || '/images/sweet-1.jpg'}
                      alt={product.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/sweet-1.jpg'; }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                      {isOutOfStock && <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">Out of Stock</span>}
                      {!isOutOfStock && product.isBestSeller && <span className="bg-[#1a3a6b] text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">Best Seller</span>}
                      {!isOutOfStock && product.isNew && <span className="bg-amber-400 text-[#1a3a6b] px-2 py-0.5 rounded text-[10px] font-black">NEW</span>}
                    </div>
                    {/* Wishlist */}
                    <button onClick={() => toggleWishlist(product.id)} className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-white transition z-10" aria-label="Wishlist">
                      <Heart size={14} className={wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                    </button>
                  </div>

                  {/* Clean Minimal Text Details directly below image box */}
                  <div className="pt-2.5 flex flex-col gap-1 flex-grow">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 fill-gray-300'} />
                      ))}
                    </div>

                    {/* Product Title */}
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-sm font-semibold text-gray-900 hover:text-[#1a3a6b] transition line-clamp-1">{product.name}</h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-gray-900">{displayPrice}</span>
                      {variant?.discountedPrice && <span className="text-xs text-gray-400 line-through">₹{variant.price.toLocaleString('en-IN')}</span>}
                    </div>

                    {/* Weight Chips */}
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {product.variants.map((v) => (
                        <button
                          key={v.weight}
                          onClick={() => setSelectedVariants({ ...selectedVariants, [product.id]: v.weight })}
                          className={`px-2 py-0.5 text-[11px] font-medium rounded border transition ${
                            selectedWeight === v.weight
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'
                          }`}
                        >
                          {v.weight}
                        </button>
                      ))}
                    </div>

                    {/* Add to Cart */}
                    <button
                      disabled={isOutOfStock}
                      onClick={() => handleAddToCart(product, selectedWeight || product.variants[0].weight)}
                      className={`mt-auto w-full py-2 rounded text-xs font-bold uppercase tracking-wide transition flex items-center justify-center gap-1 ${
                        isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isAdded ? 'bg-green-600 text-white'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : isAdded ? <><Check size={14} /> Added</> : 'Add to Cart'}
                    </button>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-white border-2 border-gold/40 rounded-full p-2.5 shadow-xl hover:bg-gold/20 transition z-10 hidden lg:flex items-center justify-center"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-[#0B1B3D]" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-white border-2 border-gold/40 rounded-full p-2.5 shadow-xl hover:bg-gold/20 transition z-10 hidden lg:flex items-center justify-center"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-[#0B1B3D]" />
        </button>
      </div>
    </section>
  );
}

