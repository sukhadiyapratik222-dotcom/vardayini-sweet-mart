'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, Check, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const WHATSAPP_NUMBER = '919825012345'; // TODO: replace with real WhatsApp number

interface ProductVariant {
  id?: string;
  weight?: string;
  weightLabel?: string;
  price: number;
  discountedPrice?: number;
  stock?: number;
  stockQty?: number;
  sku?: string;
}

interface CategoryProductCardProps {
  product: any;
  isTodoPlaceholder?: boolean;
}

export default function CategoryProductCard({ product, isTodoPlaceholder = false }: CategoryProductCardProps) {
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const { addToCart, setIsOpen } = useCart();

  const variants: ProductVariant[] = product.variants || [];
  const selectedVariant = variants[selectedVariantIdx] || { price: product.price || 0 };

  const displayPrice = selectedVariant.discountedPrice || selectedVariant.price;
  const originalPrice = selectedVariant.discountedPrice ? selectedVariant.price : null;
  const discount =
    originalPrice && displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : null;

  const weightLabel =
    (selectedVariant as any).weight || (selectedVariant as any).weightLabel || '';

  const primaryImage =
    product.productImages?.[0]?.imageUrl ||
    (Array.isArray(product.images) && product.images[0]) ||
    (Array.isArray(product.imageUrls) && product.imageUrls[0]) ||
    product.primaryImage ||
    product.image ||
    '/images/sweet-1.jpg';

  const rating = product.ratingAvg || product.rating || 4.8;
  const reviewCount = product.ratingCount || product.reviews || 0;

  const whatsappMsg = `Hello! I'm interested in *${product.name}*${weightLabel ? ` (${weightLabel})` : ''}. Price: ₹${displayPrice}. Please let me know availability.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`;

  const handleAddToCart = () => {
    if (!variants.length) return;

    const variantId = selectedVariant.id || `${product.id}-${selectedVariantIdx}`;
    addToCart(variantId, 1);


    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsOpen(true);
    }, 800);
  };

  const inStock =
    (selectedVariant.stock ?? (selectedVariant as any).stockQty ?? 99) > 0;

  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${
        isTodoPlaceholder
          ? 'border-amber-200 border-dashed border-2'
          : 'border-gray-100'
      }`}
    >
      {/* TODO placeholder badge */}
      {isTodoPlaceholder && (
        <div className="absolute top-2 left-2 z-20 bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
          TODO: Replace
        </div>
      )}

      {/* Discount badge */}
      {discount && discount > 0 && (
        <div className="absolute top-2 right-2 z-20 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
          -{discount}%
        </div>
      )}

      {/* Wishlist button */}
      <button
        onClick={() => setWishlisted((v) => !v)}
        aria-label="Add to wishlist"
        className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center transition hover:scale-110"
        style={{ display: isTodoPlaceholder ? 'none' : 'flex' }}
      >
        <Heart
          size={16}
          className={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}
        />
      </button>

      {/* Product image */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative overflow-hidden bg-gray-50"
        style={{ aspectRatio: '4/3' }}
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 text-xs font-black px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Name & rating */}
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-bold text-[#0B1B3D] leading-snug hover:text-[#D4AF37] transition line-clamp-2"
          >
            {product.name}
          </Link>

          {reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-bold text-gray-700">{Number(rating).toFixed(1)}</span>
              <span className="text-[11px] text-gray-400">({reviewCount})</span>
            </div>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Weight selector */}
        {variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariantIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  selectedVariantIdx === idx
                    ? 'bg-[#0B1B3D] text-white border-[#0B1B3D]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                {(v as any).weight || (v as any).weightLabel || `${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-lg font-black text-[#0B1B3D]">₹{displayPrice}</span>
          {originalPrice && (
            <span className="text-xs text-gray-400 line-through font-medium">₹{originalPrice}</span>
          )}
          {weightLabel && !variants.length && (
            <span className="text-[11px] text-gray-500 font-medium">/{weightLabel}</span>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2">
          {/* WhatsApp enquiry */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            id={`whatsapp-card-${product.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition hover:scale-105"
            style={{ background: '#25D36620', color: '#128C7E', border: '1px solid #25D36640' }}
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>

          {/* Add to cart */}
          {inStock ? (
            <button
              onClick={handleAddToCart}
              id={`add-to-cart-${product.slug}`}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-[#0B1B3D] text-[#D4AF37] hover:bg-[#162C5B]'
              }`}
            >
              {added ? (
                <>
                  <Check size={14} />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  Add to Cart
                </>
              )}
            </button>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              Pre-Order
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
