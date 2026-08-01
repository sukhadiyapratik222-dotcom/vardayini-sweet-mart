'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, Package, Truck, Download, Calendar, MapPin, 
  CreditCard, ArrowRight, Sparkles, Clock, Check 
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { trackPurchase } from '../../lib/analytics';

export default function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'VSM-849201';
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('latest_order');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setOrderDetails(parsed);
          trackPurchase({
            orderId: parsed.orderId || orderId,
            total: parsed.total || 1250,
          });
        } catch (e) {}
      } else {
        trackPurchase({
          orderId,
          total: 1250,
        });
      }
    }
  }, [orderId]);

  const handleDownloadInvoice = () => {
    // Generate text invoice download blob
    const content = `================================================
          VARDAYINI SWEET MART
   Authentic Indian Sweets & Namkeen Since 1976
================================================
Order ID: ${orderId}
Date: ${new Date().toLocaleDateString()}
Customer: ${orderDetails?.fullName || 'Valued Customer'}
Phone: ${orderDetails?.phone || '+91 98765 43210'}
Delivery Address: ${orderDetails?.address || 'Surat, Gujarat'}
Delivery Slot: ${orderDetails?.deliveryDate || 'Tomorrow'} (${orderDetails?.timeSlot || 'Morning'})
Payment Method: ${orderDetails?.paymentMethod || 'UPI'}
------------------------------------------------
Total Paid: ₹${(orderDetails?.total || 1250).toLocaleString('en-IN')}
------------------------------------------------
Thank you for choosing Vardayini Sweet Mart!
For support, call +91 98250 12345
================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${orderId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between">
      <div>
        <Header />

        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
          
          {/* Order Success Hero Card */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-gold/40 shadow-xl text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold via-[#0B1B3D] to-gold" />

            <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto border-4 border-green-200 shadow-md animate-bounce">
              <CheckCircle2 size={48} />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-gold-dark bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
              Order Successfully Confirmed
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-[#0B1B3D]">
              Thank You For Your Order!
            </h1>

            <p className="text-sm text-gray-600 max-w-lg mx-auto font-medium leading-relaxed">
              We have received your order <strong className="text-[#0B1B3D] font-black">#{orderId}</strong> and our sweet artisans are now preparing your fresh batch with 100% pure A2 ghee.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadInvoice}
                className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 shadow transition border border-gold/30"
              >
                <Download size={16} />
                <span>Download Tax Invoice</span>
              </button>

              <Link
                href={`/account/orders`}
                className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 shadow transition border border-gold"
              >
                <Package size={16} />
                <span>Track Order Status</span>
              </Link>
            </div>
          </div>

          {/* Delivery Tracker Progress */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gold/30 shadow-md space-y-6">
            <h2 className="text-sm font-black text-[#0B1B3D] uppercase tracking-wider border-b border-gold/20 pb-3 flex items-center gap-2">
              <Truck size={18} className="text-gold-dark" />
              <span>Live Order Tracking Progress</span>
            </h2>

            {/* Timeline Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { status: 'Placed', active: true, done: true, desc: 'Order Confirmed' },
                { status: 'Packed', active: true, done: true, desc: 'Tin Box Sealed' },
                { status: 'Shipped', active: false, done: false, desc: 'In Courier Transit' },
                { status: 'Delivered', active: false, done: false, desc: 'At Your Doorstep' },
              ].map((step, idx) => (
                <div key={idx} className="space-y-2 text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto text-xs font-black border-2 transition ${
                    step.done
                      ? 'bg-[#0B1B3D] text-gold border-[#0B1B3D]'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    {step.done ? <Check size={18} /> : idx + 1}
                  </div>
                  <p className="text-xs font-black text-[#0B1B3D]">{step.status}</p>
                  <p className="text-[10px] text-gray-500 font-semibold">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Details Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gold/30 shadow-md grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xs font-black text-[#0B1B3D] uppercase tracking-wider border-b border-gray-100 pb-2">
                Delivery Address
              </h3>
              <p className="text-xs font-black text-[#0B1B3D]">{orderDetails?.fullName || 'Pratik Sukhadiya'}</p>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {orderDetails?.address || '102, Shrimad Complex, Ring Road, Surat, Gujarat - 395002'}
              </p>
              <p className="text-xs text-gray-500 font-bold">Phone: {orderDetails?.phone || '+91 98765 43210'}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black text-[#0B1B3D] uppercase tracking-wider border-b border-gray-100 pb-2">
                Delivery Schedule & Payment
              </h3>
              <div className="space-y-1.5 text-xs text-gray-700">
                <p><strong>Scheduled Date:</strong> {orderDetails?.deliveryDate || 'Tomorrow'}</p>
                <p><strong>Time Slot:</strong> {orderDetails?.timeSlot || 'Morning (9:00 AM - 1:00 PM)'}</p>
                <p><strong>Payment Method:</strong> {orderDetails?.paymentMethod || 'UPI Instant'}</p>
                <p className="text-sm font-black text-[#0B1B3D] pt-2">
                  Total Paid: ₹{(orderDetails?.total || 1250).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Continue Shopping CTA */}
          <div className="text-center pt-4">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-[#0B1B3D] text-gold px-8 py-3.5 rounded-xl text-xs font-black hover:bg-[#162C5B] transition shadow-lg border border-gold/30"
            >
              <span>Explore More Sweets & Namkeen</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
