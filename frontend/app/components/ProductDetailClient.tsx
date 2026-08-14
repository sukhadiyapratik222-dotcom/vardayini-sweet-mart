'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart, Star, Check, ShieldCheck, Truck, Clock, Sparkles, Send } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { ApiProduct, ApiReview } from '../lib/api';
import { useCart } from '../context/CartContext';
import { trackViewItem, trackAddToCart } from '../lib/analytics';

type ProductDetailClientProps = {
  product: any;
  initialReviews: ApiReview[];
};

const nutritionRows = [
  ['Energy (per 100g)', '412 kcal'],
  ['Carbohydrates', '52 g'],
  ['Protein', '6.8 g'],
  ['Total Fat (Pure A2 Ghee)', '19.5 g'],
  ['Saturated Fat', '11 g'],
  ['Natural Sugar', '34 g'],
];

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function ProductDetailClient({ product, initialReviews }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart, setIsOpen } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants?.[0]?.id ?? '');

  // Fire view_item analytics hook
  useEffect(() => {
    trackViewItem({
      id: product.id || product.slug,
      name: product.name,
      category: product.category?.name || product.category,
      price: product.variants?.[0]?.price || 350,
    });
  }, [product]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');
  // Related Products state
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${API_URL}/products?format=array`);
        if (res.ok) {
          const allProds = await res.json();
          const list = Array.isArray(allProds) ? allProds : (allProds.products || []);
          const filtered = list.filter((p: any) => String(p.id) !== String(product.id) && p.slug !== product.slug);
          setRelatedProducts(filtered.slice(0, 4));
        }
      } catch (e) {}
    }
    fetchRelated();
  }, [product]);

  // Interactive reviews state
  const [reviews, setReviews] = useState<ApiReview[]>(initialReviews || []);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Zoom preview state
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, isZoomed: false });

  const selectedVariant = useMemo(
    () => product.variants?.find((variant: any) => variant.id === selectedVariantId) ?? product.variants?.[0],
    [product.variants, selectedVariantId]
  );

  const displayPrice = Number(selectedVariant?.discountedPrice ?? selectedVariant?.price ?? product.price ?? 0);
  const originalPrice = Number(selectedVariant?.price ?? displayPrice);
  const imageUrls = product.images && product.images.length > 0
    ? product.images.map((image: any) => image.imageUrl)
    : [product.primaryImage || product.image || '/images/sweet-1.jpg'];

  const avgRating = product.ratingAvg || (reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 4.8);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y, isZoomed: true });
  };

  const handleAddToCart = async () => {
    const targetVariantId = selectedVariant?.id || `${product.id}-${selectedVariant?.weightLabel || 'default'}`;
    await addToCart(targetVariantId, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    if (setIsOpen) setIsOpen(true);
  };

  const handleBuyNow = async () => {
    const targetVariantId = selectedVariant?.id || `${product.id}-${selectedVariant?.weightLabel || 'default'}`;
    await addToCart(targetVariantId, quantity);
    router.push('/cart');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: ApiReview = {
      id: `rev-${Date.now()}`,
      productId: String(product.id || '1'),
      userId: `user-${Date.now()}`,
      rating: newRating,
      comment: newComment,
      createdAt: new Date().toISOString(),
      user: { id: `u-${Date.now()}`, name: userName.trim() || 'Valued Customer' }
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
    setUserName('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between">
      <div>
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Gallery */}
            <section className="space-y-4">
              <div
                className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-gold/30 bg-amber-50/50 shadow-xl cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoomPos((prev) => ({ ...prev, isZoomed: false }))}
              >
                <div className="h-full w-full overflow-hidden">
                  <img
                    src={imageUrls[selectedImage] || '/images/sweet-1.jpg'}
                    alt={product.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/sweet-1.jpg'; }}
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: zoomPos.isZoomed ? 'scale(2)' : 'scale(1)'
                    }}
                  />
                </div>

                {selectedVariant?.discountedPrice && (
                  <div className="absolute right-4 top-4 rounded-full bg-gold text-[#0B1B3D] px-4 py-1.5 text-xs font-black shadow-md border border-gold">
                    SAVE {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {imageUrls.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imageUrls.map((imageUrl: string, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${selectedImage === index ? 'border-gold ring-2 ring-gold/40 scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} thumbnail`}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/sweet-1.jpg'; }}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Purity & Guarantee Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gold/20">
                <div className="bg-amber-50 p-3 rounded-2xl border border-gold/30 text-center space-y-1">
                  <ShieldCheck size={20} className="text-gold-dark mx-auto" />
                  <p className="text-xs font-black text-[#0B1B3D]">100% Pure A2 Ghee</p>
                  <p className="text-[10px] text-gray-500 font-medium">No Palm Oil</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl border border-gold/30 text-center space-y-1">
                  <Truck size={20} className="text-gold-dark mx-auto" />
                  <p className="text-xs font-black text-[#0B1B3D]">Express Delivery</p>
                  <p className="text-[10px] text-gray-500 font-medium">Pan-India Fresh</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl border border-gold/30 text-center space-y-1">
                  <Clock size={20} className="text-gold-dark mx-auto" />
                  <p className="text-xs font-black text-[#0B1B3D]">Fresh Batch</p>
                  <p className="text-[10px] text-gray-500 font-medium">Daily Prepared</p>
                </div>
              </div>
            </section>

            {/* Right Column */}
            <section className="rounded-3xl border-2 border-gold/30 bg-white p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-gold-dark bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
                  {product.category?.name || product.category || 'Vardayini Special'}
                </span>

                <h1 className="mt-3 text-2xl sm:text-4xl font-black text-[#0B1B3D] leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < Math.floor(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-extrabold text-xs text-[#0B1B3D]">★ {Number(avgRating).toFixed(1)}</span>
                  <span className="text-xs text-gray-500 font-semibold">({product.ratingCount || reviews.length} customer reviews)</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="border-y border-gold/20 py-4 bg-amber-50/40 -mx-6 px-6 sm:-mx-8 sm:px-8 space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#0B1B3D]">{formatPrice(displayPrice)}</span>
                  {originalPrice > displayPrice && (
                    <span className="text-base text-gray-400 line-through font-semibold">{formatPrice(originalPrice)}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Inclusive of all taxes. Select weight variant below to auto-update pricing.
                </p>
              </div>

              {/* Weight Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-xs font-black text-[#0B1B3D] uppercase tracking-wider mb-2">
                    Select Weight Pack Variant:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.variants.map((v: any) => {
                      const isSelected = selectedVariant?.id === v.id || selectedVariant?.weightLabel === v.weightLabel;
                      const vPrice = Number(v.discountedPrice || v.price);
                      return (
                        <button
                          key={v.id || v.weightLabel}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all ${isSelected
                              ? 'border-[#0B1B3D] bg-[#0B1B3D] text-gold shadow-md scale-105'
                              : 'border-gray-200 bg-gray-50 text-gray-800 hover:border-gold'
                            }`}
                        >
                          <span className="block text-xs font-black">{v.weightLabel || v.weight}</span>
                          <span className={`block text-xs mt-0.5 ${isSelected ? 'text-gold-light font-bold' : 'text-green-700 font-bold'}`}>
                            {formatPrice(vPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-[#0B1B3D] uppercase tracking-wider">Quantity:</label>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-gold/40 rounded-2xl bg-white shadow-sm overflow-hidden">
                    <button
                      type="button"
                      disabled={(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50) <= 0}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-3 text-gray-700 hover:bg-gold/20 transition font-bold disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, Number(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50))}
                      value={quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') return;
                        const parsed = parseInt(val, 10);
                        const maxS = Math.max(1, Number(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50));
                        if (!isNaN(parsed) && parsed >= 1) {
                          setQuantity(Math.min(maxS, parsed));
                        }
                      }}
                      onBlur={(e) => {
                        const maxS = Math.max(1, Number(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50));
                        const parsed = parseInt(e.target.value, 10);
                        if (isNaN(parsed) || parsed < 1) {
                          setQuantity(1);
                        } else if (parsed > maxS) {
                          setQuantity(maxS);
                        }
                      }}
                      className="w-14 text-center font-black text-sm text-[#0B1B3D] bg-transparent border-none outline-none appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {(() => {
                      const variantStock = Math.max(1, Number(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50));
                      const isStockLimit = quantity >= variantStock;
                      return (
                        <button
                          type="button"
                          disabled={variantStock <= 0 || isStockLimit}
                          onClick={() => setQuantity((q) => Math.min(variantStock, q + 1))}
                          className="p-3 text-gray-700 hover:bg-gold/20 transition font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isStockLimit ? `Max available stock (${variantStock}) reached` : 'Increase quantity'}
                        >
                          <Plus size={16} />
                        </button>
                      );
                    })()}
                  </div>

                  <span className="text-xs text-gray-500 font-semibold">Total: <strong className="text-[#0B1B3D] font-black">{formatPrice(displayPrice * quantity)}</strong></span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  disabled={(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50) <= 0}
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 shadow-lg border ${isAdded ? 'bg-green-700 text-white border-green-700' : 'bg-[#0B1B3D] text-gold hover:bg-[#162C5B] border-gold/40'}`}
                >
                  <ShoppingCart size={18} />
                  <span>{isAdded ? "Added!" : "Add to Cart"}</span>
                </button>

                <button
                  type="button"
                  disabled={(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50) <= 0}
                  onClick={handleBuyNow}
                  className="w-full bg-gold text-[#0B1B3D] hover:bg-gold-light py-4 rounded-2xl font-black text-sm shadow-lg transition border border-gold text-center"
                >
                  ⚡ Buy Now
                </button>
              </div>

              {/* Tabs Section */}
              <div className="pt-6 border-t border-gold/20">
                <div className="flex border-b border-gray-200">
                  {(['description', 'nutrition', 'reviews'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`py-2.5 px-4 font-black text-xs uppercase tracking-wider transition border-b-2 -mb-px ${activeTab === tab ? 'border-[#0B1B3D] text-[#0B1B3D]' : 'border-transparent text-gray-400'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-amber-50/50 rounded-2xl text-xs text-gray-700">
                  {activeTab === 'description' && <p>{product.description || 'Premium quality traditional sweets.'}</p>}
                  {activeTab === 'nutrition' && <p>Nutrition details here...</p>}
                  
                  {/* Customer Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      {reviewSubmitted && (
                        <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-xl font-bold">
                          ✓ Thank you! Your review has been published.
                        </div>
                      )}

                      <form onSubmit={handleAddReview} className="bg-white p-4 rounded-2xl border border-gold/30 space-y-3">
                        <h4 className="font-black text-[#0B1B3D] text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={14} className="text-gold-dark" />
                          <span>Write a Customer Review</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Your Name</label>
                            <input
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              placeholder="e.g. Ananya Sharma"
                              className="w-full border border-gray-300 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Rating</label>
                            <select
                              value={newRating}
                              onChange={(e) => setNewRating(Number(e.target.value))}
                              className="w-full border border-gray-300 px-3 py-1.5 rounded-xl text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-gold"
                            >
                              <option value={5}>★★★★★ (5 Stars)</option>
                              <option value={4}>★★★★☆ (4 Stars)</option>
                              <option value={3}>★★★☆☆ (3 Stars)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Review Comment</label>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Describe taste, freshness..."
                            rows={2}
                            className="w-full border border-gray-300 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow"
                        >
                          <Send size={13} />
                          <span>Submit Review</span>
                        </button>
                      </form>

                      <div className="space-y-3">
                        {reviews.map((rev) => (
                          <div key={rev.id} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[#0B1B3D] text-xs">{rev.user?.name || 'Verified Customer'}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-gray-600">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-black text-gold-dark uppercase tracking-widest bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
                  Recommended For You
                </span>
                <h3 className="text-2xl font-black text-[#0B1B3D] mt-2">Related Products & Sweets</h3>
              </div>
              <Link href="/categories/sweets" className="text-xs font-extrabold text-[#0B1B3D] hover:text-gold-dark underline">
                View Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel: any) => {
                const relImg = rel.productImages?.[0]?.imageUrl || rel.imageUrls?.[0] || rel.primaryImage || rel.imageUrl || rel.image || '/images/sweet-1.jpg';
                const relPrice = Number(rel.price || rel.variants?.[0]?.price || 350);
                const relWeight = rel.weightLabel || rel.variants?.[0]?.weightLabel || '500g';
                return (
                  <div key={rel.id || rel.slug} className="bg-white rounded-3xl border-2 border-gold/30 p-4 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-3">
                        <img
                          src={relImg}
                          alt={rel.name}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/sweet-1.jpg'; }}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-[#0B1B3D]/80 text-gold text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-xs">
                          {relWeight}
                        </span>
                      </div>
                      <h4 className="font-black text-[#0B1B3D] text-sm line-clamp-1 group-hover:text-gold-dark transition-colors">
                        {rel.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">
                        {rel.category?.name || rel.category || 'Pure Desi Ghee'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400 font-bold block text-[10px] uppercase">PRICE</span>
                        <span className="text-base font-black text-[#0B1B3D]">{formatPrice(relPrice)}</span>
                      </div>
                      <Link
                        href={`/products/${rel.slug || rel.id}`}
                        className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-sm"
                      >
                        <span>View Item</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>

      <Footer />
    </div>
  );
}
