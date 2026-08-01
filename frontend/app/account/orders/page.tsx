'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, Truck, Clock, CheckCircle2, XCircle, Download, 
  MapPin, User, ChevronRight, ArrowLeft, RefreshCw, ShoppingBag 
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('my_orders');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setOrders(parsed);
          if (parsed.length > 0) setSelectedOrder(parsed[0]);
          return;
        } catch (e) {}
      }
    }

    // Default mock orders list if empty
    const mockOrders = [
      {
        orderId: 'VSM-849201',
        date: new Date().toISOString(),
        status: 'Packed',
        statusColor: 'bg-amber-100 text-amber-900 border-amber-300',
        fullName: 'Pratik Sukhadiya',
        phone: '+91 98765 43210',
        address: '102, Shrimad Complex, Ring Road, Surat, Gujarat - 395002',
        deliveryDate: 'Tomorrow',
        timeSlot: 'Morning (9:00 AM - 1:00 PM)',
        paymentMethod: 'UPI',
        trackingNumber: 'AWB9849201IN',
        carrier: 'BlueDart Express',
        total: 1250,
        items: [
          { name: 'Royal Kaju Katli', weight: '500g', quantity: 1, price: 850 },
          { name: 'Farali Chevdo', weight: '250g', quantity: 2, price: 200 },
        ]
      },
      {
        orderId: 'VSM-719304',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'Delivered',
        statusColor: 'bg-green-100 text-green-900 border-green-300',
        fullName: 'Pratik Sukhadiya',
        phone: '+91 98765 43210',
        address: '102, Shrimad Complex, Ring Road, Surat, Gujarat - 395002',
        deliveryDate: '3 Days Ago',
        timeSlot: 'Evening Slot',
        paymentMethod: 'Credit Card',
        trackingNumber: 'AWB7193041IN',
        carrier: 'Delhivery',
        total: 2100,
        items: [
          { name: 'Sugarless Anjeer Roll', weight: '1kg', quantity: 1, price: 1400 },
          { name: 'Special Mixture Namkeen', weight: '500g', quantity: 2, price: 350 },
        ]
      }
    ];

    setOrders(mockOrders);
    setSelectedOrder(mockOrders[0]);
  }, []);

  const handleDownloadInvoice = (order: any) => {
    const content = `================================================
          VARDAYINI SWEET MART
   Authentic Indian Sweets & Namkeen Since 1976
================================================
Order ID: ${order.orderId}
Date: ${new Date(order.date).toLocaleDateString()}
Status: ${order.status}
Customer: ${order.fullName || 'Pratik Sukhadiya'}
Phone: ${order.phone || '+91 98765 43210'}
Delivery Address: ${order.address}
Carrier Tracking: ${order.carrier || 'Express'} (${order.trackingNumber || 'AWB10203'})
Payment Method: ${order.paymentMethod}
------------------------------------------------
Total Amount Paid: ₹${Number(order.total || 1250).toLocaleString('en-IN')}
------------------------------------------------
Thank you for choosing Vardayini Sweet Mart!
================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.orderId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
              <span>My Account</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gold">My Account & Order History</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              Track active orders, download tax invoices, and manage saved delivery addresses.
            </p>
          </div>
        </section>

        {/* Main Content Dashboard */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Navigation Tabs */}
          <div className="flex border-b-2 border-gold/30 mb-8 overflow-x-auto">
            {[
              { id: 'orders', label: 'My Orders & Tracking', icon: Package },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'profile', label: 'Profile Settings', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-6 font-black text-xs uppercase tracking-wider transition border-b-4 -mb-1 flex items-center gap-2 shrink-0 ${
                    active
                      ? 'border-[#0B1B3D] text-[#0B1B3D] bg-white rounded-t-xl'
                      : 'border-transparent text-gray-500 hover:text-[#0B1B3D]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Orders List & Detail Tracking View */}
          {activeTab === 'orders' && (
            <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] items-start">
              
              {/* Left Column: Orders History List */}
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#0B1B3D]">Your Recent Orders</h2>

                {orders.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-2">
                    <ShoppingBag size={28} className="mx-auto text-gray-400" />
                    <p className="text-xs font-bold text-gray-600">No past orders found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((ord) => {
                      const isSelected = selectedOrder?.orderId === ord.orderId;
                      const status = ord.status || 'Placed';
                      return (
                        <div
                          key={ord.orderId}
                          onClick={() => setSelectedOrder(ord)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition space-y-2 ${
                            isSelected
                              ? 'border-[#0B1B3D] bg-white shadow-md ring-2 ring-gold/30'
                              : 'border-gray-200 bg-white hover:border-gold'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-[#0B1B3D]">#{ord.orderId}</span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              status === 'Delivered'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : status === 'Shipped' || status === 'Packed'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-blue-100 text-blue-900 border-blue-300'
                            }`}>
                              {status}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold">
                            <span>{new Date(ord.date).toLocaleDateString()}</span>
                            <strong className="text-[#0B1B3D] font-black">₹{Number(ord.total || 1250).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Detailed Order View & Carrier Tracking */}
              {selectedOrder ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gold/30 shadow-xl space-y-6">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-gold-dark bg-gold/15 px-2.5 py-1 rounded-full border border-gold/30">
                        Order Details
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0B1B3D] mt-1">
                        Order #{selectedOrder.orderId}
                      </h2>
                      <p className="text-xs text-gray-500 font-semibold">
                        Placed on {new Date(selectedOrder.date).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownloadInvoice(selectedOrder)}
                      className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition border border-gold/30 self-start sm:self-auto"
                    >
                      <Download size={15} />
                      <span>Download Tax Invoice</span>
                    </button>
                  </div>

                  {/* Status & Carrier Tracking Info */}
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-gold/30 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#0B1B3D]">Shipment Carrier:</span>
                      <span className="font-black text-gold-dark">{selectedOrder.carrier || 'BlueDart Express'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#0B1B3D]">Tracking Number (AWB):</span>
                      <span className="font-black text-[#0B1B3D] bg-white px-2 py-0.5 rounded border border-gray-300">
                        {selectedOrder.trackingNumber || 'AWB9849201IN'}
                      </span>
                    </div>
                  </div>

                  {/* Address & Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700 pt-2 border-t border-gray-100">
                    <div>
                      <h4 className="font-black text-[#0B1B3D] uppercase tracking-wider mb-1">Delivery Address</h4>
                      <p className="font-extrabold text-[#0B1B3D]">{selectedOrder.fullName || 'Pratik Sukhadiya'}</p>
                      <p className="text-gray-500 font-medium mt-0.5">{selectedOrder.address || 'Surat, Gujarat'}</p>
                      <p className="text-gray-500 font-semibold mt-1">Phone: {selectedOrder.phone || '+91 98765 43210'}</p>
                    </div>

                    <div>
                      <h4 className="font-black text-[#0B1B3D] uppercase tracking-wider mb-1">Delivery & Payment</h4>
                      <p><strong>Date:</strong> {selectedOrder.deliveryDate || 'Tomorrow'}</p>
                      <p><strong>Slot:</strong> {selectedOrder.timeSlot || 'Morning Slot'}</p>
                      <p><strong>Payment:</strong> {selectedOrder.paymentMethod || 'UPI'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-xs text-gray-500 font-semibold">
                  Select an order from the left to view details and download invoice.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-8 rounded-3xl border-2 border-gold/30 shadow-md space-y-4 max-w-2xl">
              <h2 className="text-base font-black text-[#0B1B3D]">Saved Delivery Addresses</h2>
              <div className="p-4 rounded-2xl border-2 border-gold/40 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-[#0B1B3D]">Home Address (Default)</span>
                  <span className="text-[10px] font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded">Primary</span>
                </div>
                <p className="text-xs font-bold text-[#0B1B3D]">Pratik Sukhadiya (+91 98765 43210)</p>
                <p className="text-xs text-gray-600">102, Shrimad Complex, Ring Road, Opp. Central Market, Surat, Gujarat - 395002</p>
              </div>
            </div>
          )}

          {/* Tab 3: Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-3xl border-2 border-gold/30 shadow-md space-y-4 max-w-2xl">
              <h2 className="text-base font-black text-[#0B1B3D]">Account Profile</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Full Name</label>
                  <input readOnly value="Pratik Sukhadiya" className="w-full border border-gray-300 p-2 rounded-xl bg-gray-50 font-bold text-[#0B1B3D]" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Email Address</label>
                  <input readOnly value="pratik.sukhadiya@example.com" className="w-full border border-gray-300 p-2 rounded-xl bg-gray-50 font-bold text-[#0B1B3D]" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Phone Number</label>
                  <input readOnly value="+91 98765 43210" className="w-full border border-gray-300 p-2 rounded-xl bg-gray-50 font-bold text-[#0B1B3D]" />
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
