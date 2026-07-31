'use client';

import Link from 'next/link';
import { X, Minus, Plus, Trash2, Truck, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, loading } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-maroon">Shopping Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart && cart.items && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                {/* Product Info */}
                <div className="flex gap-3">
                  {item.productVariant?.product?.imageUrls?.[0] && (
                    <img
                      src={item.productVariant.product.imageUrls[0]}
                      alt={item.productVariant.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {item.productVariant?.product?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.productVariant?.weightLabel}
                    </p>
                    <p className="font-semibold text-maroon mt-1">
                      ₹
                      {(
                        (item.productVariant?.discountedPrice ||
                          item.productVariant?.price ||
                          0) * item.quantity
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      disabled={loading}
                      className="p-1 hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={loading}
                      className="p-1 hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-maroon text-cream rounded-lg font-semibold hover:bg-[#5f1313] transition"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Promotions & Totals */}
        {cart && cart.items && cart.items.length > 0 && (
          <>
            {/* Free Delivery Progress */}
            {cart.deliveryFee > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-blue-50 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Truck size={16} className="text-blue-600" />
                  <span className="text-gray-700">
                    Add ₹{cart.amountForFreeDelivery.toLocaleString('en-IN')} more for free delivery
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((cart.subtotal - (cart.subtotal - cart.amountForFreeDelivery)) /
                          (cart.freeDeliveryThreshold - (cart.subtotal - cart.amountForFreeDelivery))) *
                          100 || 0
                      )}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bulk Discount Banner */}
            {cart.discountPercent > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-green-50 flex items-center gap-2">
                <Gift size={16} className="text-green-600" />
                <span className="text-sm text-green-800 font-semibold">
                  🎉 {cart.discountPercent}% discount applied on your order!
                </span>
              </div>
            )}

            {/* Totals */}
            <div className="px-6 py-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">
                  ₹{cart.subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -₹{cart.discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Delivery
                  {cart.deliveryFee === 0 && <span className="text-green-600"> ✓ FREE</span>}
                </span>
                <span className="font-semibold">
                  {cart.deliveryFee === 0 ? '-' : `₹${cart.deliveryFee}`}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-maroon">
                <span>Total</span>
                <span>₹{cart.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="px-6 py-4 border-t border-gray-200 space-y-2">
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-maroon text-cream px-6 py-3 rounded-lg font-bold text-center hover:bg-[#5f1313] transition"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full border border-maroon text-maroon px-6 py-3 rounded-lg font-semibold hover:bg-maroon/5 transition"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
