'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, Truck, Gift, Sparkles, Tag, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

function EditableCartPageQuantityInput({
  itemId,
  itemTitle,
  currentQuantity,
  maxStock,
  updateQuantity,
  onRequestRemove
}: {
  itemId: string;
  itemTitle: string;
  currentQuantity: number;
  maxStock: number;
  updateQuantity: (id: string, q: number) => void;
  onRequestRemove: (id: string, name: string) => void;
}) {
  const [val, setVal] = useState<string>(String(currentQuantity));

  useEffect(() => {
    setVal(String(currentQuantity));
  }, [currentQuantity]);

  const triggerZeroRemoval = () => {
    onRequestRemove(itemId, itemTitle);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setVal(text);

    if (text === '') return;

    const parsed = parseInt(text, 10);
    if (!isNaN(parsed)) {
      if (parsed === 0) {
        triggerZeroRemoval();
      } else if (parsed > 0) {
        const capped = Math.min(maxStock, parsed);
        updateQuantity(itemId, capped);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0) {
        triggerZeroRemoval();
      } else {
        const capped = Math.min(maxStock, parsed);
        updateQuantity(itemId, capped);
      }
    }
  };

  const handleBlur = () => {
    if (val === '' || isNaN(parseInt(val, 10))) {
      setVal(String(currentQuantity));
    } else {
      const parsed = parseInt(val, 10);
      if (parsed <= 0) {
        triggerZeroRemoval();
      } else if (parsed > maxStock) {
        updateQuantity(itemId, maxStock);
        setVal(String(maxStock));
      }
    }
  };

  return (
    <input
      type="number"
      min={0}
      max={maxStock}
      value={val}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="w-12 text-center text-xs font-black text-[#0B1B3D] bg-transparent border-none outline-none appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, applyCoupon, removeCoupon, loading, couponLoading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [zeroNotice, setZeroNotice] = useState<string | null>(null);
  const [confirmRemoveItem, setConfirmRemoveItem] = useState<{ id: string; name: string } | null>(null);

  const handleZeroError = (msg: string) => {
    setZeroNotice(msg);
    setTimeout(() => setZeroNotice(null), 4000);
  };

  const handleRequestRemove = (id: string, name: string) => {
    handleZeroError(`⚠️ Quantity cannot be 0. Please confirm removal.`);
    setConfirmRemoveItem({ id, name });
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode);
    setCouponFeedback(res);
    if (res.success) setCouponCode('');
    setTimeout(() => setCouponFeedback(null), 4000);
  };

  const freeDeliveryPercent = cart ? Math.min(100, Math.round((cart.subtotal / cart.freeDeliveryThreshold) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between">
      <div>
        <Header />

        {/* Confirmation Modal */}
        {confirmRemoveItem && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-gold/40 space-y-4 text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-300">
                <Trash2 size={28} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0B1B3D] text-lg">Remove Item from Cart?</h3>
                <p className="text-xs text-red-600 font-bold mt-1">⚠️ Quantity cannot be 0.</p>
                <p className="text-xs text-gray-600 font-medium mt-1">
                  Are you sure you want to remove <strong className="text-[#0B1B3D]">{confirmRemoveItem.name}</strong> from your cart?
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setConfirmRemoveItem(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-2.5 rounded-xl text-xs font-extrabold transition"
                >
                  Cancel (Keep 1)
                </button>
                <button
                  onClick={() => {
                    removeFromCart(confirmRemoveItem.id);
                    setConfirmRemoveItem(null);
                  }}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Zero Quantity Error Banner */}
          {zeroNotice && (
            <div className="mb-6 bg-red-500/15 border-2 border-red-500 p-4 rounded-2xl text-xs font-black text-red-700 flex items-center justify-between shadow-md">
              <span>{zeroNotice}</span>
              <button onClick={() => setZeroNotice(null)} className="font-extrabold text-red-800 hover:text-red-950">✕</button>
            </div>
          )}

          {/* Header & Breadcrumb */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mb-2">
              <Link href="/" className="hover:text-gold-dark">Home</Link>
              <span>/</span>
              <span className="text-[#0B1B3D]">Shopping Cart</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0B1B3D]">Shopping Cart</h1>
          </div>

          {(!cart || !cart.items || cart.items.length === 0) ? (
            <div className="bg-white rounded-3xl border-2 border-gold/30 p-12 text-center shadow-xl max-w-2xl mx-auto space-y-5">
              <div className="h-24 w-24 rounded-full bg-amber-50 mx-auto flex items-center justify-center border-2 border-gold/30 text-gold-dark shadow-inner">
                <ShoppingBag size={44} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#0B1B3D]">Your Shopping Cart is Empty</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Looks like you haven't added any sweets or snacks yet!</p>
              </div>
              <Link
                href="/categories/sweets"
                className="inline-flex items-center gap-2 bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-8 py-3.5 rounded-2xl text-sm font-black transition shadow-lg border border-gold/30"
              >
                <span>Explore Catalog</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Free Delivery Bar */}
                <div className="bg-white p-5 rounded-2xl border-2 border-gold/30 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-[#0B1B3D]">
                    <span className="flex items-center gap-1.5">
                      <Truck size={16} className="text-gold-dark" />
                      {cart.amountForFreeDelivery <= 0 ? (
                        <strong className="text-green-700 font-extrabold">🎉 You unlocked FREE Delivery!</strong>
                      ) : (
                        <span>Add <strong className="text-gold-dark font-extrabold">₹{cart.amountForFreeDelivery.toLocaleString('en-IN')}</strong> more for FREE Delivery!</span>
                      )}
                    </span>
                    <span className="text-xs font-bold text-gray-500">{freeDeliveryPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gold/20">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-gold h-full transition-all duration-500 rounded-full"
                      style={{ width: `${freeDeliveryPercent}%` }}
                    />
                  </div>
                </div>

                {/* Items Table Card */}
                <div className="bg-white rounded-3xl border-2 border-gold/30 shadow-xl overflow-hidden divide-y divide-gray-100">
                  <div className="bg-[#0B1B3D] text-gold px-6 py-3.5 hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] text-xs font-black uppercase tracking-wider">
                    <span>Product Details</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Subtotal</span>
                    <span className="text-right">Action</span>
                  </div>

                  {cart.items.map((item) => {
                    const itemTitle = item.productVariant?.product?.name || 'Vardayini Sweets Item';
                    const itemImage = item.productVariant?.product?.imageUrls?.[0] || '/images/sweet-1.jpg';
                    const weight = item.productVariant?.weightLabel || '500g';
                    const unitPrice = Number(item.productVariant?.discountedPrice || item.productVariant?.price || 250);
                    const itemTotal = unitPrice * item.quantity;

                    const maxStock = (item as any).stockQty ?? (item as any).maxStock ?? (item.productVariant as any)?.stockQty ?? 50;
                    const isMaxReached = item.quantity >= maxStock;

                    return (
                      <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center">
                        <div className="flex gap-3 items-center w-full">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gold/30">
                            <img src={itemImage} alt={itemTitle} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm text-[#0B1B3D]">{itemTitle}</h3>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                              Weight: {weight}
                            </span>
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-center border-2 border-gold/40 rounded-xl bg-white shadow-xs overflow-hidden shrink-0">
                          <button
                            onClick={() => {
                              if (item.quantity <= 1) {
                                handleRequestRemove(item.id, itemTitle);
                              } else {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            disabled={loading}
                            className="p-2 hover:bg-gold/20 text-[#0B1B3D] transition disabled:opacity-40"
                            title={item.quantity <= 1 ? "Remove item from cart" : "Decrease quantity"}
                          >
                            <Minus size={15} />
                          </button>

                          <EditableCartPageQuantityInput
                            itemId={item.id}
                            itemTitle={itemTitle}
                            currentQuantity={item.quantity}
                            maxStock={maxStock}
                            updateQuantity={updateQuantity}
                            onRequestRemove={handleRequestRemove}
                          />

                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={loading || isMaxReached}
                            className="p-2 hover:bg-gold/20 text-[#0B1B3D] transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isMaxReached ? `Max stock limit (${maxStock}) reached` : 'Increase quantity'}
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
                    <div className="flex items-center justify-between bg-green-50 border border-green-300 px-3.5 py-2.5 rounded-xl text-xs font-bold text-green-900 shadow-2xs">
                      <span className="flex items-center gap-2 font-extrabold">
                        <span className="bg-green-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-black">✓</span>
                        <span>{cart.appliedCoupon}</span>
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-800 hover:underline text-[11px] font-black cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code..."
                        disabled={loading || couponLoading}
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white disabled:bg-gray-100 uppercase font-bold"
                      />
                      <button
                        type="submit"
                        disabled={loading || couponLoading || !couponCode.trim()}
                        className="bg-[#0B1B3D] text-gold px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-[#162C5B] transition shadow disabled:opacity-50 disabled:cursor-not-allowed min-w-[75px]"
                      >
                        {couponLoading ? 'Applying...' : 'Apply'}
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
                          disabled={couponLoading}
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

                  {/* Bulk Offer Progress Message */}
                  {cart.subtotal < 4200 ? (
                    <p className="text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-gold-dark shrink-0" />
                      <span>Add <strong>₹{(4200 - cart.subtotal).toLocaleString('en-IN')}</strong> more to get <strong>5% OFF</strong> on orders above ₹4,200!</span>
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-green-800 bg-green-50 p-2.5 rounded-xl border border-green-200 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-green-600 shrink-0" />
                      <span>🎉 You unlocked 5% OFF!</span>
                    </p>
                  )}

                  <div className="space-y-2.5 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-[#0B1B3D]">₹{cart.subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {cart.appliedCoupon && cart.couponDiscountAmount > 0 && (
                      <div className="flex justify-between text-green-700 font-bold">
                        <span>Coupon Discount</span>
                        <span>-₹{cart.couponDiscountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {cart.bulkDiscountAmount > 0 && !cart.appliedCoupon?.includes('BULK') && (
                      <div className="flex justify-between text-green-700 font-bold">
                        <span>Bulk Offer Discount (5%)</span>
                        <span>-₹{cart.bulkDiscountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span className="font-bold">
                        {cart.deliveryFee === 0 ? <strong className="text-green-700 font-black">FREE</strong> : `₹${cart.deliveryFee}`}
                      </span>
                    </div>

                    <div className="border-t border-gold/20 pt-3 flex justify-between text-base font-black text-[#0B1B3D]">
                      <span>Total Amount</span>
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
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

