'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Calendar, Clock, CreditCard, ShieldCheck, CheckCircle2, 
  Truck, ArrowRight, Phone, User, Home, Briefcase, Lock, Sparkles 
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCart();

  // Address form state
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [fullName, setFullName] = useState('Pratik Sukhadiya');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [addressLine, setAddressLine] = useState('102, Shrimad Complex, Ring Road');
  const [city, setCity] = useState('Surat');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('395002');
  const [landmark, setLandmark] = useState('Opp. Central Market');

  // Delivery slot state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [deliveryDate, setDeliveryDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('Morning (9:00 AM - 1:00 PM)');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [upiApp, setUpiApp] = useState('GPay');

  // Order processing state
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacing(true);

    const orderId = `VSM-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderDetails = {
      orderId,
      date: new Date().toISOString(),
      fullName,
      phone,
      address: `${addressLine}, ${landmark ? landmark + ', ' : ''}${city}, ${state} - ${pincode}`,
      deliveryDate,
      timeSlot,
      paymentMethod,
      total: cart?.total || 1250,
      items: cart?.items || []
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('latest_order', JSON.stringify(orderDetails));
      // Add to mock orders history
      const existingOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
      localStorage.setItem('my_orders', JSON.stringify([orderDetails, ...existingOrders]));
    }

    setTimeout(() => {
      setIsPlacing(false);
      router.push(`/checkout/confirmation?orderId=${orderId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between">
      <div>
        <Header />

        {/* Banner Header */}
        <section className="border-b border-gold/30 bg-[#0B1B3D] text-white px-4 py-8 sm:px-6 lg:px-8 shadow-inner">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gold uppercase tracking-widest mb-2">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <Link href="/cart" className="hover:underline">Cart</Link>
              <span>/</span>
              <span>Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gold">Checkout & Shipping</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              Provide delivery details, choose date & time slot, select payment method, and complete your order.
            </p>
          </div>
        </section>

        {/* Main Content Form */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            
            {/* Left Column: Delivery Address, Slot Picker & Payment Options */}
            <div className="space-y-6">
              
              {/* 1. Saved / New Address Form */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gold/30 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                  <h2 className="text-base font-black text-[#0B1B3D] flex items-center gap-2">
                    <MapPin size={18} className="text-gold-dark" />
                    <span>1. Shipping & Delivery Address</span>
                  </h2>
                  <span className="text-[10px] uppercase font-bold text-gold-dark bg-gold/15 px-2 py-0.5 rounded">
                    Step 1 of 3
                  </span>
                </div>

                {/* Address Type Badges */}
                <div className="flex gap-2">
                  {[
                    { type: 'HOME', label: 'Home', icon: Home },
                    { type: 'WORK', label: 'Office', icon: Briefcase },
                    { type: 'OTHER', label: 'Other', icon: MapPin },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = addressType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setAddressType(item.type as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition border ${
                          active
                            ? 'bg-[#0B1B3D] text-gold border-[#0B1B3D] shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gold'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border border-gray-300 pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white font-semibold"
                      />
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone *</label>
                    <div className="relative">
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-gray-300 pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white font-semibold"
                      />
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Street / House / Suite Address *</label>
                    <input
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="House No., Building Name, Street Name..."
                      className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Landmark (Optional)</label>
                    <input
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near School, Opposite Park..."
                      className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pincode *</label>
                    <input
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                    <input
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery Date & Time Slot Picker */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gold/30 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                  <h2 className="text-base font-black text-[#0B1B3D] flex items-center gap-2">
                    <Calendar size={18} className="text-gold-dark" />
                    <span>2. Delivery Date & Preferred Time Slot</span>
                  </h2>
                  <span className="text-[10px] uppercase font-bold text-gold-dark bg-gold/15 px-2 py-0.5 rounded">
                    Step 2 of 3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Select Delivery Date</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white font-bold text-[#0B1B3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Select Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] bg-white outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option>Morning (9:00 AM - 1:00 PM)</option>
                      <option>Afternoon (1:00 PM - 5:00 PM)</option>
                      <option>Evening (5:00 PM - 9:00 PM)</option>
                      <option>⚡ Same Day Express Delivery (Within 4 hrs)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Payment Method Selection */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gold/30 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                  <h2 className="text-base font-black text-[#0B1B3D] flex items-center gap-2">
                    <CreditCard size={18} className="text-gold-dark" />
                    <span>3. Payment Method</span>
                  </h2>
                  <span className="text-[10px] uppercase font-bold text-gold-dark bg-gold/15 px-2 py-0.5 rounded">
                    Step 3 of 3
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'UPI', title: 'UPI / GPay / PhonePe / Paytm', desc: 'Instant 0% fee UPI payment' },
                    { id: 'CARD', title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                    { id: 'NETBANKING', title: 'Net Banking', desc: 'All Indian major banks supported' },
                    { id: 'COD', title: 'Cash on Delivery (COD)', desc: 'Pay with cash upon package arrival' },
                  ].map((method) => {
                    const active = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                          active
                            ? 'border-[#0B1B3D] bg-amber-50/60 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gold'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={active}
                          onChange={() => setPaymentMethod(method.id as any)}
                          className="text-[#0B1B3D] focus:ring-gold"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-[#0B1B3D]">{method.title}</p>
                          <p className="text-[10px] text-gray-500 font-semibold">{method.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order Button */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border-2 border-gold/30 shadow-xl sticky top-24 space-y-4">
                <h3 className="text-sm font-black text-[#0B1B3D] uppercase tracking-wider border-b border-gold/20 pb-3">
                  Order Summary
                </h3>

                {/* Items preview */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cart && cart.items && cart.items.length > 0 ? (
                    cart.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-extrabold text-[#0B1B3D] truncate">
                            {item.productVariant?.product?.name || 'Vardayini Sweet'}
                          </p>
                          <span className="text-[10px] text-gray-500 font-semibold">
                            {item.productVariant?.weightLabel || '500g'} × {item.quantity}
                          </span>
                        </div>
                        <span className="font-black text-[#0B1B3D]">
                          ₹{(Number(item.productVariant?.discountedPrice || item.productVariant?.price || 250) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 font-semibold">1 × Royal Kaju Katli 500g (₹850)</div>
                  )}
                </div>

                <div className="border-t border-gold/20 pt-3 space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#0B1B3D]">₹{(cart?.subtotal || 850).toLocaleString('en-IN')}</span>
                  </div>

                  {cart && cart.discountAmount > 0 && (
                    <div className="flex justify-between text-green-700 font-bold">
                      <span>Discount</span>
                      <span>-₹{cart.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-bold">
                      {cart?.deliveryFee === 0 ? <strong className="text-green-700 font-black">FREE</strong> : `₹${cart?.deliveryFee || 0}`}
                    </span>
                  </div>

                  <div className="border-t border-gold/30 pt-3 flex justify-between text-base font-black text-[#0B1B3D]">
                    <span>Total Payable</span>
                    <span className="text-xl text-[#0B1B3D]">₹{(cart?.total || 850).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPlacing}
                  className="w-full bg-gold text-[#0B1B3D] hover:bg-gold-light py-4 rounded-xl font-black text-sm shadow-lg transition flex items-center justify-center gap-2 border border-gold disabled:opacity-50"
                >
                  {isPlacing ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Place Order (₹{(cart?.total || 850).toLocaleString('en-IN')})</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1">
                  <ShieldCheck size={14} className="text-green-700" />
                  <span>Guaranteed Fresh & Pure Quality</span>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
}
