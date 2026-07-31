'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../data';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`slider-${title}`);
    if (container) {
      const scrollAmount = 320;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        setScrollPosition(scrollPosition - scrollAmount);
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setScrollPosition(scrollPosition + scrollAmount);
      }
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

  return (
    <section className="py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D] flex items-center gap-2">
            <span className="h-6 w-1 bg-gold rounded-full"></span>
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-gray-600 text-sm font-medium">{subtitle}</p>}
        </div>
        {categoryLink && (
          <Link
            href={categoryLink}
            className="text-sm font-bold text-[#0B1B3D] hover:text-gold-dark transition border-b border-gold/40 pb-0.5"
          >
            {t.viewAll}
          </Link>
        )}
      </div>

      {/* Slider Container */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        {/* Slider */}
        <div
          id={`slider-${title}`}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {products.map((product) => {
            const selectedWeight = selectedVariants[product.id] || product.variants[0].weight;
            const variant = product.variants.find((v) => v.weight === selectedWeight);
            const displayPrice = variant ? variant.discountedPrice || variant.price : product.variants[0].price;

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-72 group"
              >
                <article className="overflow-hidden rounded-xl border border-gold/20 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-gold/60 h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative h-52 overflow-hidden bg-gray-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Badges */}
                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                      {product.isBestSeller && (
                        <span className="bg-[#0B1B3D] text-gold px-2.5 py-1 rounded-md text-[11px] font-bold shadow border border-gold/40">
                          {t.bestSellerBadge}
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-gold text-[#0B1B3D] px-2.5 py-1 rounded-md text-[11px] font-extrabold shadow">
                          {t.newBadge}
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition"
                    >
                      <Heart
                        size={17}
                        className={`transition ${
                          wishlist.has(product.id) ? 'fill-[#0B1B3D] text-[#0B1B3D]' : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3 flex-grow flex flex-col bg-white">
                    {/* Title */}
                    <Link href={`/products/${product.slug}`} className="block">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#0B1B3D] transition">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < Math.floor(product.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">({product.reviews})</span>
                    </div>

                    {/* Weight Variants Chips */}
                    <div className="flex flex-wrap gap-1">
                      {product.variants.slice(0, 3).map((variant) => (
                        <button
                          key={variant.weight}
                          onClick={() =>
                            setSelectedVariants({ ...selectedVariants, [product.id]: variant.weight })
                          }
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition ${
                            selectedWeight === variant.weight
                              ? 'bg-[#0B1B3D] text-gold border-[#0B1B3D]'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gold'
                          }`}
                        >
                          {variant.weight}
                        </button>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-extrabold text-[#0B1B3D]">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      {variant?.discountedPrice && (
                        <span className="text-xs text-gray-400 line-through font-medium">
                          ₹{variant.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button className="w-full bg-[#0B1B3D] text-gold px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#162C5B] transition flex items-center justify-center gap-2 mt-auto shadow-sm border border-gold/30">
                      <ShoppingCart size={16} />
                      {t.addToCart}
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
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-white border border-gold/30 rounded-full p-2.5 shadow-lg hover:bg-gold/10 transition z-10 hidden lg:flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-[#0B1B3D]" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-white border border-gold/30 rounded-full p-2.5 shadow-lg hover:bg-gold/10 transition z-10 hidden lg:flex items-center justify-center"
        >
          <ChevronRight size={20} className="text-[#0B1B3D]" />
        </button>
      </div>

    </section>
  );
}
