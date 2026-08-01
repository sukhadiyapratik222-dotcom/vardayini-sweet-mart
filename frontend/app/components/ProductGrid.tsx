'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../data';
import { useLanguage } from '../context/LanguageContext';

export default function ProductGrid({ products }: { products: Product[] }) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const { t } = useLanguage();

  const getMinPrice = (product: Product) => {
    return Math.min(...product.variants.map((v) => v.discountedPrice || v.price));
  };

  const getMaxPrice = (product: Product) => {
    return Math.max(...product.variants.map((v) => v.price));
  };

  const getPriceDisplay = (product: Product) => {
    const minPrice = getMinPrice(product);
    const maxPrice = getMaxPrice(product);

    if (minPrice === maxPrice) {
      return `₹${minPrice.toLocaleString('en-IN')}`;
    }
    return `₹${minPrice.toLocaleString('en-IN')}–₹${maxPrice.toLocaleString('en-IN')}`;
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
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => {
        const selectedWeight = selectedVariants[product.id];
        const variant = selectedWeight ? product.variants.find((v) => v.weight === selectedWeight) : undefined;
        const totalStock = product.variants.reduce((sum, v: any) => sum + Number(v.stockQty ?? v.stock ?? 0), 0);
        const isOutOfStock = totalStock <= 0;

        return (
          <article
            key={product.id}
            className="group overflow-hidden rounded-xl border border-gold/20 bg-[#0B1B3D]/5 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-gold/60 flex flex-col bg-white"
          >
            {/* Image Container */}
            <div className="relative h-52 overflow-hidden bg-gray-50">
              <img
                src={(product as any).image || (product as any).primaryImage || (product as any).imageUrls?.[0] || (product as any).productImages?.[0]?.imageUrl || '/images/sweet-1.jpg'}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/sweet-1.jpg';
                }}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                {isOutOfStock ? (
                  <span className="bg-red-600 text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow">
                    Out of Stock
                  </span>
                ) : (
                  <>
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
                  </>
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
                {product.variants.map((v) => (
                  <button
                    key={v.weight}
                    onClick={() => setSelectedVariants({ ...selectedVariants, [product.id]: v.weight })}
                    className={`px-2 py-1 text-xs font-semibold rounded-md border transition ${
                      selectedWeight === v.weight
                        ? 'bg-[#0B1B3D] text-gold border-[#0B1B3D]'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gold'
                    }`}
                  >
                    {v.weight}
                  </button>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-xl font-extrabold text-[#0B1B3D]">
                  {variant ? `₹${(variant.discountedPrice || variant.price).toLocaleString('en-IN')}` : getPriceDisplay(product)}
                </span>
                {variant?.discountedPrice && (
                  <span className="text-xs text-gray-400 line-through font-medium">
                    ₹{variant.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                disabled={isOutOfStock}
                className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 mt-auto shadow-sm border ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed'
                    : 'bg-[#0B1B3D] text-gold hover:bg-[#162C5B] border-gold/30'
                }`}
              >
                <ShoppingCart size={16} />
                {isOutOfStock ? 'Out of Stock' : t.addToCart}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}


