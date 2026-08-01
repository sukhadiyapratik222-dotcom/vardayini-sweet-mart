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
          {/* Breadcrumb */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
            <Link href="/" className="hover:text-gold-dark">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-gold-dark">Products</Link>
            <span>/</span>
            <span className="text-gold-dark font-extrabold">{product.category?.name || product.category || 'Special Sweets'}</span>
            <span>/</span>
            <span className="text-[#0B1B3D] truncate">{product.name}</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
            
            {/* Left Column: Interactive Image Gallery with Hover Zoom */}
            <section className="space-y-4">
              <div 
                className="group relative overflow-hidden rounded-3xl border-2 border-gold/30 bg-white shadow-lg cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoomPos({ x: 0, y: 0, isZoomed: false })}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={imageUrls[selectedImage]}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/sweet-1.jpg';
                    }}
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

                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                  🔍 Hover photo to zoom
                </div>
              </div>

              {/* Thumbnails */}
              {imageUrls.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imageUrls.map((imageUrl: string, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                        selectedImage === index ? 'border-gold ring-2 ring-gold/40 scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} thumbnail`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/sweet-1.jpg';
                        }}
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

            {/* Right Column: Product Details, Variant Picker, Stepper & CTA */}
            <section className="rounded-3xl border-2 border-gold/30 bg-white p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-gold-dark bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
                  {product.category?.name || product.category || 'Vardayini Special'}
                </span>

                <h1 className="mt-3 text-2xl sm:text-4xl font-black text-[#0B1B3D] leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Reviews Summary */}
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
                  Inclusive of all taxes & protective tin box packaging. Select weight variant below to auto-update pricing.
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
                          className={`p-3 rounded-2xl border-2 text-left transition-all ${
                            isSelected
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
                  {((selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50) <= 0) ? (
                    <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-md text-xs font-black uppercase">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-green-700">
                      In Stock (Qty: {selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50})
                    </span>
                  )}
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
                    <span className="px-5 font-black text-sm text-[#0B1B3D] min-w-12 text-center">{quantity}</span>
                    <button
                      type="button"
                      disabled={(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50) <= 0}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-3 text-gray-700 hover:bg-gold/20 transition font-bold disabled:opacity-30"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <span className="text-xs text-gray-500 font-semibold">Total: <strong className="text-[#0B1B3D] font-black">{formatPrice(displayPrice * quantity)}</strong></span>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  disabled={(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50) <= 0}
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 shadow-lg border disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed ${
                    isAdded
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-[#0B1B3D] text-gold hover:bg-[#162C5B] border-gold/40'
                  }`}
                >
                  {(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50) <= 0 ? (
                    <span>Out of Stock</span>
                  ) : isAdded ? (
                    <>
                      <Check size={18} />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50) <= 0}
                  onClick={handleBuyNow}
                  className="w-full bg-gold text-[#0B1B3D] hover:bg-gold-light py-4 rounded-2xl font-black text-sm shadow-lg transition border border-gold text-center disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                >
                  {(selectedVariant?.stockQty ?? selectedVariant?.stock ?? 50) <= 0 ? "Out of Stock" : "⚡ Buy Now"}
                </button>
              </div>

              {/* Tabs Section */}
              <div className="pt-6 border-t border-gold/20 space-y-4">
                <div className="flex border-b border-gray-200">
                  {(['description', 'nutrition', 'reviews'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`py-2.5 px-4 font-black text-xs uppercase tracking-wider transition border-b-2 -mb-px ${
                        activeTab === tab
                          ? 'border-[#0B1B3D] text-[#0B1B3D]'
                          : 'border-transparent text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'nutrition' ? 'Ingredients & Nutrition' : tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
                    </button>
                  ))}
                </div>

                <div className="bg-amber-50/50 p-5 rounded-2xl border border-gold/20 text-xs text-gray-700 leading-relaxed">
                  {/* Description Tab */}
                  {activeTab === 'description' && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-[#0B1B3D]">
                        {product.description || 'Authentic traditional sweet prepared in small batches using 100% pure desi ghee, premium grade nuts, and organic spices.'}
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-600 font-medium">
                        <li>Made with pure A2 Desi Cow Ghee & premium dry fruits</li>
                        <li>Zero artificial preservatives, colorings or synthetic flavors</li>
                        <li>Hygienically packed in airtight food-grade tin boxes</li>
                        <li>Shelf life: 45 days from date of manufacturing</li>
                      </ul>
                    </div>
                  )}

                  {/* Nutrition Tab */}
                  {activeTab === 'nutrition' && (
                    <div className="space-y-4">
                      <p className="font-bold text-[#0B1B3D]">Nutritional information per 100g serving:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {nutritionRows.map(([label, value]) => (
                          <div key={label} className="bg-white p-3 rounded-xl border border-gold/20 shadow-sm">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">{label}</span>
                            <span className="text-xs font-black text-[#0B1B3D]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Reviews & Post Review Form Tab */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      {/* Review submission feedback */}
                      {reviewSubmitted && (
                        <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-xl font-bold">
                          ✓ Thank you! Your review has been published.
                        </div>
                      )}

                      {/* Add Review Form */}
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
                              <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                              <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                              <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                              <option value={2}>★★☆☆☆ (2 Stars - Poor)</option>
                              <option value={1}>★☆☆☆☆ (1 Star - Terrible)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Review Comment</label>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Describe taste, freshness, packaging quality..."
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

                      {/* Existing Reviews list */}
                      <div className="space-y-3">
                        {reviews.map((rev) => (
                          <div key={rev.id} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[#0B1B3D] text-xs">{rev.user?.name || 'Verified Customer'}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={`${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed font-medium">{rev.comment}</p>
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
      </div>

      <Footer />
    </div>
  );
}