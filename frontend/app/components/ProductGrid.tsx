'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Star, Check } from 'lucide-react';
import { Product } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

export default function ProductGrid({ products }: { products: Product[] }) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const { t } = useLanguage();
  const { addToCart, setIsOpen } = useCart();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_wishlist_ids");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setWishlist(new Set(parsed));
        } catch (e) {}
      }
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      fetch(`${API_BASE}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const ids = data.map((item: any) => String(item.productId || item.product?.id || item.id));
            setWishlist(new Set(ids));
            if (typeof window !== "undefined") {
              localStorage.setItem("user_wishlist_ids", JSON.stringify(ids));
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const toggleWishlist = async (productId: string) => {
    const newWishlist = new Set(wishlist);
    const isLiking = !newWishlist.has(productId);

    if (isLiking) {
      newWishlist.add(productId);
    } else {
      newWishlist.delete(productId);
    }

    setWishlist(newWishlist);

    if (typeof window !== "undefined") {
      localStorage.setItem("user_wishlist_ids", JSON.stringify(Array.from(newWishlist)));
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      try {
        if (isLiking) {
          await fetch(`${API_BASE}/wishlist`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
          });
        } else {
          await fetch(`${API_BASE}/wishlist/${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (err) {}
    }
  };

  const handleAddToCart = async (product: Product, selectedWeight: string) => {
    const variant = product.variants.find((v) => v.weight === selectedWeight) || product.variants[0];
    const targetVariantId = variant.id || `${product.id}-${variant.weight}`;
    await addToCart(targetVariantId, 1);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
    if (setIsOpen) setIsOpen(true);
  };

  return (
    <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {products.map((product) => {
        const selectedWeight = selectedVariants[product.id];
        const variant = selectedWeight ? product.variants.find((v) => v.weight === selectedWeight) : undefined;
        const totalStock = product.variants.reduce((sum, v: any) => sum + Number(v.stockQty ?? v.stock ?? 0), 0);
        const isOutOfStock = totalStock <= 0;
        const isAdded = addedItems[product.id];

        const minPrice = Math.min(...product.variants.map((v) => v.discountedPrice || v.price));
        const maxPrice = Math.max(...product.variants.map((v) => v.price));
        const priceDisplay = variant
          ? `₹${(variant.discountedPrice || variant.price).toLocaleString('en-IN')}`
          : minPrice === maxPrice
          ? `₹${minPrice.toLocaleString('en-IN')}`
          : `₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`;

        return (
          <article
            key={product.id}
            className="group flex flex-col transition-all duration-300"
          >
            {/* Image Container */}
            <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
              <img
                src={(product as any).productImages?.[0]?.imageUrl || (product as any).imageUrls?.[0] || (product as any).primaryImage || (product as any).image || '/images/sweet-1.jpg'}
                alt={product.name}
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/sweet-1.jpg'; }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
                {isOutOfStock && (
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow">Out of Stock</span>
                )}
                {!isOutOfStock && product.isBestSeller && (
                  <span className="bg-[#1a3a6b] text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold shadow">Best Seller</span>
                )}
                {!isOutOfStock && product.isNew && (
                  <span className="bg-amber-400 text-[#1a3a6b] px-2 py-0.5 rounded text-[10px] font-black shadow">NEW</span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-white transition z-10"
                aria-label="Wishlist"
              >
                <Heart size={14} className={wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
              </button>
            </div>

            {/* Clean Minimal Text Details directly below image box */}
            <div className="pt-3 flex flex-col gap-1">
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 fill-gray-300'}
                  />
                ))}
              </div>

              {/* Product Title */}
              <Link href={`/products/${product.slug}`}>
                <h3 className="text-sm font-semibold text-gray-900 hover:text-[#1a3a6b] transition line-clamp-1">
                  {product.name}
                </h3>
              </Link>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-gray-900">{priceDisplay}</span>
                {variant?.discountedPrice && (
                  <span className="text-xs text-gray-400 line-through">₹{variant.price.toLocaleString('en-IN')}</span>
                )}
              </div>

              {/* Weight Chips */}
              <div className="flex flex-wrap gap-1 mt-1">
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

              {/* Add to Cart Button */}
              <button
                disabled={isOutOfStock}
                onClick={() => handleAddToCart(product, selectedWeight || product.variants[0].weight)}
                className={`mt-2 w-full py-2 rounded text-xs font-bold uppercase tracking-wide transition flex items-center justify-center gap-1 ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isAdded
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : isAdded ? <><Check size={14} /> Added</> : 'Add to Cart'}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
