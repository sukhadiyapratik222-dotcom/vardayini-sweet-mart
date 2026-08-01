'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, Truck, Gift, Sparkles, Tag, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, applyCoupon, removeCoupon, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponFeedback(res);
    if (res.success) setCouponCode('');
    setTimeout(() => setCouponFeedback(null), 4000);
  };

  const freeDeliveryPercent = cart ? Math.min(100, Math.round((cart.subtotal / cart.freeDeliveryThreshold) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between">
      <div>
        <Header />

        {/* Page Banner Header */}
        <section className="border-b border-gold/30 bg-[#0B1B3D] text-white px-4 py-8 sm:px-6 lg:px-8 shadow-inner">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gold uppercase tracking-widest mb-2">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span>Shopping Cart</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gold">Shopping Cart</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              Review your items, apply coupon codes, and proceed to secure checkout.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {cart && cart.items && cart.items.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              
              {/* Left Column: Items Table & Free Shipping Banner */}
              <div className="space-y-6">
                
                {/* Free Delivery Bar */}
                <div className="bg-white p-5 rounded-2xl border-2 border-gold/30 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0B1B3D]">
                    <span className="flex items-center gap-2">
                      <Truck size={18} className="text-gold-dark" />
                      {cart.amountForFreeDelivery > 0 ? (
                        <span>Add <strong className="text-gold-dark font-black">₹{cart.amountForFreeDelivery.toLocaleString('en-IN')}</strong> more for FREE Pan-India Shipping!</span>
                      ) : (
                        <span className="text-green-700 font-black">🎉 Congratulations! You unlocked FREE Express Shipping!</span>
                      )}
                    </span>
                    <span className="text-xs font-extrabold text-gold-dark">{freeDeliveryPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden border border-gold/20">
                    <div
                      className="bg-gold h-full transition-all duration-500 rounded-full"
                      style={{ width: `${freeDeliveryPercent}%` }}
                    />
                  </div>
                </div>

                {/* Items List Card */}
                <div className="bg-white rounded-2xl border-2 border-gold/30 shadow-sm overflow-hidden divide-y divide-gray-100">
                  <div className="bg-[#0B1B3D] text-gold px-6 py-3 text-xs font-black uppercase tracking-wider hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-4">
                    <span>Product Details</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Subtotal</span>
                    <span className="text-center">Action</span>
                  </div>

                  {cart.items.map((item) => {
                    const itemImage = item.productVariant?.product?.imageUrls?.[0] || '/images/sweet-1.jpg';
                    const itemTitle = item.productVariant?.product?.name || 'Vardayini Sweets';
                    const weight = item.productVariant?.weightLabel || '500g';
                    const unitPrice = Number(item.productVariant?.discountedPrice || item.productVariant?.price || 250);
                    const itemTotal = unitPrice * item.quantity;

                    return (
                      <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center">
                        {/* Product info */}
                        <div className="flex gap-3 items-center w-full">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gold/30">
                            <img src={itemImage} alt={itemTitle} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm text-[#0B1B3D]">{itemTitle}</h3>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                              Weight: {weight}
                            </span>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">
                              Unit Price: ₹{unitPrice.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-center border-2 border-gold/40 rounded-xl bg-white shadow-xs overflow-hidden shrink-0">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={loading}
                            className="p-2 hover:bg-gold/20 text-[#0B1B3D] transition disabled:opacity-40"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="px-3 text-xs font-black text-[#0B1B3D]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={loading}
                            className="p-2 hover:bg-gold/20 text-[#0B1B3D] transition disabled:opacity-40"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right sm:text-right w-full sm:w-auto">
                          <span className="text-xs text-gray-400 font-semibold block sm:hidden">Subtotal:</span>
                          <span className="text-base font-black text-[#0B1B3D]">₹{itemTotal.toLocaleString('en-IN')}</span>
                        </div>

                        {/* Remove */}
                        <div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Order Summary & Coupons */}
              <div className="space-y-6">
                
                {/* Coupon Code Section */}
                <div className="bg-white p-5 rounded-2xl border-2 border-gold/30 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-[#0B1B3D] uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={15} className="text-gold-dark" />
                    <span>Apply Coupon Code</span>
                  </h3>

                  {cart.appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-300 px-3.5 py-2 rounded-xl text-xs font-bold text-green-900">
                      <span>Coupon <strong>{cart.appliedCoupon}</strong> Applied</span>
                      <button onClick={removeCoupon} className="text-red-600 hover:underline text-[11px] font-extrabold">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code..."
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-[#0B1B3D] text-gold px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-[#162C5B] transition shadow"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponFeedback && (
                    <p className={`text-xs font-bold ${couponFeedback.success ? 'text-green-700' : 'text-red-600'}`}>
                      {couponFeedback.message}
                    </p>
                  )}

                  {/* Available promo codes pills */}
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Available Offers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['SWEET10', 'FESTIVE5'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setCouponCode(code)}
                          className="bg-amber-50 hover:bg-gold/20 text-[#0B1B3D] border border-gold/40 px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition"
                        >
                          🏷️ {code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-white p-6 rounded-2xl border-2 border-gold/30 shadow-lg space-y-4">
                  <h3 className="text-sm font-black text-[#0B1B3D] uppercase tracking-wider border-b border-gold/20 pb-3">
                    Order Summary
                  </h3>

                  {cart.subtotal >= 5000 && (
                    <div className="bg-green-100 p-2.5 rounded-xl border border-green-300 flex items-center gap-2 text-xs text-green-900 font-bold">
                      <Gift size={16} className="text-green-700 shrink-0" />
                      <span>🎉 5% Bulk Order Discount Included!</span>
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="font-bold text-[#0B1B3D]">₹{cart.subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {cart.discountAmount > 0 && (
                      <div className="flex justify-between text-green-700 font-bold">
                        <span>Total Discounts</span>
                        <span>-₹{cart.discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery Charges</span>
                      <span className="font-bold">
                        {cart.deliveryFee === 0 ? <strong className="text-green-700 font-black">FREE</strong> : `₹${cart.deliveryFee}`}
                      </span>
                    </div>

                    <div className="border-t border-gold/20 pt-3 flex justify-between text-base font-black text-[#0B1B3D]">
                      <span>Grand Total</span>
                      <span className="text-xl text-[#0B1B3D]">₹{cart.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Link
                      href="/checkout"
                      className="w-full bg-gold text-[#0B1B3D] hover:bg-gold-light py-3.5 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 border border-gold text-center"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      href="/categories"
                      className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl font-bold text-xs transition text-center block"
                    >
                      Continue Shopping
                    </Link>
                  </div>

                  <div className="pt-3 border-t border-gray-100 text-center text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1">
                    <ShieldCheck size={14} className="text-green-700" />
                    <span>Safe & Secure 256-Bit SSL Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gold/40 p-16 text-center space-y-4 max-w-lg mx-auto my-12">
              <div className="w-20 h-20 bg-gold/15 text-gold-dark rounded-full flex items-center justify-center mx-auto border border-gold/30">
                <ShoppingBag size={40} />
              </div>
              <h2 className="text-2xl font-black text-[#0B1B3D]">Your Shopping Cart is Empty</h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                Looks like you haven&apos;t added any delicious sweets or savories yet. Browse our collections and place your order today!
              </p>
              <Link
                href="/categories"
                className="inline-block bg-[#0B1B3D] text-gold px-8 py-3.5 rounded-xl text-xs font-black hover:bg-[#162C5B] transition shadow-lg border border-gold/30"
              >
                Start Shopping Now →
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

