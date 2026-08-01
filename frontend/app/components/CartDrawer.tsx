'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, Truck, Gift, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, applyCoupon, removeCoupon, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Container */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l-2 border-gold/30">
        
        {/* Drawer Header */}
        <div className="bg-[#0B1B3D] text-white px-6 py-4 flex items-center justify-between border-b border-gold/30">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gold">Your Shopping Cart</h2>
            <span className="bg-gold/20 text-gold text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-gold/30">
              {cart?.itemCount || 0} Items
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-gold/20 text-gold rounded-xl transition"
            title="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Progress Bar Ribbon */}
        {cart && (
          <div className="bg-amber-50 px-6 py-3 border-b border-gold/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#0B1B3D]">
                <Truck size={15} className="text-gold-dark" />
                {cart.amountForFreeDelivery > 0 ? (
                  <span>Add <strong className="text-gold-dark font-black">₹{cart.amountForFreeDelivery.toLocaleString('en-IN')}</strong> for FREE Delivery!</span>
                ) : (
                  <span className="text-green-700 font-black">🎉 You unlocked FREE Delivery!</span>
                )}
              </span>
              <span className="text-[10px] text-gray-500 font-extrabold">{freeDeliveryPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden border border-gold/20">
              <div
                className="bg-gold h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 divide-y divide-gray-100">
          {cart && cart.items && cart.items.length > 0 ? (
            cart.items.map((item) => {
              const itemImage = item.productVariant?.product?.imageUrls?.[0] || '/images/sweet-1.jpg';
              const itemTitle = item.productVariant?.product?.name || 'Vardayini Sweets';
              const weight = item.productVariant?.weightLabel || '500g';
              const unitPrice = Number(item.productVariant?.discountedPrice || item.productVariant?.price || 250);
              const itemTotal = unitPrice * item.quantity;

              return (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gold/30">
                    <img src={itemImage} alt={itemTitle} className="h-full w-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-xs text-[#0B1B3D] truncate">{itemTitle}</h3>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-0.5 inline-block">
                      {weight}
                    </span>
                    <p className="text-xs font-black text-[#0B1B3D] mt-1">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center border border-gold/40 rounded-xl bg-white shadow-xs overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={loading}
                        className="p-1 hover:bg-gold/20 text-[#0B1B3D] transition disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-2.5 text-xs font-black text-[#0B1B3D]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="p-1 hover:bg-gold/20 text-[#0B1B3D] transition disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      disabled={loading}
                      className="text-[#0B1B3D] hover:text-red-700 p-1 transition"
                      title="Remove Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-gold/15 text-gold-dark rounded-full flex items-center justify-center mx-auto border border-gold/30">
                <Gift size={32} />
              </div>
              <h3 className="text-base font-black text-[#0B1B3D]">Your Cart is Empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Explore our fresh sweets and namkeen collections to add items to your cart.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-[#0B1B3D] text-gold px-6 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#162C5B] transition shadow"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary & Coupons */}
        {cart && cart.items && cart.items.length > 0 && (
          <div className="border-t-2 border-gold/30 bg-amber-50/40 p-5 space-y-3">
            
            {/* Bulk Order Special Messaging */}
            {cart.subtotal < 5000 ? (
              <div className="bg-amber-100/70 p-2.5 rounded-xl border border-gold/30 flex items-center gap-2 text-xs text-[#0B1B3D] font-bold">
                <Sparkles size={16} className="text-gold-dark shrink-0" />
                <span>Bulk Offer: Add ₹{(5000 - cart.subtotal).toLocaleString('en-IN')} more to get <strong>5% OFF</strong> on orders above ₹5,000!</span>
              </div>
            ) : (
              <div className="bg-green-100 p-2.5 rounded-xl border border-green-300 flex items-center gap-2 text-xs text-green-900 font-bold">
                <Gift size={16} className="text-green-700 shrink-0" />
                <span>🎉 Bulk Special Applied: 5% Bulk Discount included!</span>
              </div>
            )}

            {/* Coupon Code Input */}
            <div>
              {cart.appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-300 px-3 py-1.5 rounded-xl text-xs font-bold text-green-800">
                  <span className="flex items-center gap-1.5">
                    <Tag size={14} />
                    <span>Coupon <strong>{cart.appliedCoupon}</strong> Applied</span>
                  </span>
                  <button onClick={removeCoupon} className="text-red-600 hover:underline font-extrabold text-[10px]">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. SWEET10)"
                    className="flex-1 border border-gray-300 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white"
                  />
                  <button
                    type="submit"
                    className="bg-[#0B1B3D] text-gold px-4 py-1.5 rounded-xl text-xs font-extrabold hover:bg-[#162C5B] transition shadow"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponFeedback && (
                <p className={`text-[10px] font-bold mt-1 ${couponFeedback.success ? 'text-green-700' : 'text-red-600'}`}>
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-700 pt-2 border-t border-gold/20">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#0B1B3D]">₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Discounts Savings</span>
                  <span>-₹{cart.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold">
                  {cart.deliveryFee === 0 ? <strong className="text-green-700">FREE</strong> : `₹${cart.deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black text-[#0B1B3D] pt-2 border-t border-gold/30">
                <span>Total Amount</span>
                <span className="text-lg text-[#0B1B3D]">₹{cart.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="w-full bg-gold text-[#0B1B3D] hover:bg-gold-light py-3 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-gold"
              >
                <span>View Shopping Cart Page</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#0B1B3D] text-gold hover:bg-[#162C5B] py-3 rounded-xl font-black text-xs shadow-md transition text-center block border border-gold/30"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

