'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Mail, Phone, MapPin, Heart, Package, Save, Plus, 
  Trash2, Edit, CheckCircle2, Download, ShoppingCart, Star, ShieldCheck, Home, Briefcase 
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { products as localProducts } from '../../data';

interface SavedAddress {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function ProfileDashboardPage() {
  const { user, login, isLoading } = useAuth();
  const { addToCart, setIsOpen } = useCart();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, isLoading]);

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'wishlist' | 'orders'>('profile');

  // 1. Profile edit state
  const [name, setName] = useState(user?.name || 'Pratik Sukhadiya');
  const [email, setEmail] = useState(user?.email || 'pratik.sukhadiya@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [savedFeedback, setSavedFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // 2. Saved addresses state
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr-1',
      type: 'HOME',
      fullName: 'Pratik Sukhadiya',
      phone: '+91 98765 43210',
      addressLine: '102, Shrimad Complex, Ring Road, Opp. Central Market',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395002',
      isDefault: true,
    },
    {
      id: 'addr-2',
      type: 'WORK',
      fullName: 'Pratik Sukhadiya (Office)',
      phone: '+91 98765 43210',
      addressLine: '405, Sweet Mart Plaza, Station Road',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395003',
      isDefault: false,
    }
  ]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrType, setNewAddrType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Surat');
  const [newAddrPincode, setNewAddrPincode] = useState('395002');

  // 3. Wishlist items state
  const [wishlist, setWishlist] = useState<any[]>([
    localProducts[0], // Royal Kaju Katli
    localProducts[2], // Special Dryfruit Mix
    localProducts[4], // Premium Gift Hamper
  ]);

  // 4. Orders state
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }

    if (typeof window !== 'undefined') {
      const storedOrders = localStorage.getItem('my_orders');
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders));
        } catch (e) {}
      }
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      id: user?.id || 'user-local-1',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      isAdmin: user?.isAdmin || false,
    };

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      const data = await res.json();
      if (res.ok && data && data.user) {
        login(data.token || localStorage.getItem('auth_token') || 'token_123', data.user);
        setSavedFeedback({ text: '✓ Profile details successfully updated in database!', isError: false });
      } else {
        login(localStorage.getItem('auth_token') || 'token_123', updatedUser);
        setSavedFeedback({ text: '✓ Profile details updated locally!', isError: false });
      }
    } catch (err: any) {
      // Offline local update fallback
      login(localStorage.getItem('auth_token') || 'token_123', updatedUser);
      setSavedFeedback({ text: '✓ Profile details updated locally!', isError: false });
    }
    setTimeout(() => setSavedFeedback(null), 4000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLine.trim()) return;

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      type: newAddrType,
      fullName: name,
      phone,
      addressLine: newAddrLine,
      city: newAddrCity,
      state: 'Gujarat',
      pincode: newAddrPincode,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setNewAddrLine('');
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleRemoveWishlist = (id: string) => {
    setWishlist(wishlist.filter((w) => w.id !== id));
  };

  const handleDownloadInvoice = (order: any) => {
    const content = `================================================
          VARDAYINI SWEET MART
   Authentic Indian Sweets & Namkeen Since 1976
================================================
Order ID: ${order.orderId}
Date: ${new Date(order.date || Date.now()).toLocaleDateString()}
Customer: ${order.fullName || name}
Phone: ${order.phone || phone}
Delivery Address: ${order.address || 'Surat, Gujarat'}
Total Paid: ₹${(order.total || 1250).toLocaleString('en-IN')}
------------------------------------------------
Thank you for choosing Vardayini Sweet Mart!
================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.orderId || 'VSM'}.txt`;
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
              <span>Account Profile</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gold">
              Welcome Back, {name || 'Customer'}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              Manage your personal info, saved delivery addresses, wishlist, and past orders.
            </p>
          </div>
        </section>

        {/* Dashboard Tabs & Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Navigation Bar Tabs */}
          <div className="flex border-b-2 border-gold/30 mb-8 overflow-x-auto">
            {[
              { id: 'profile', label: 'Edit Profile', icon: User },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'wishlist', label: `My Wishlist (${wishlist.length})`, icon: Heart },
              { id: 'orders', label: `Order History (${orders.length})`, icon: Package },
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

          {/* TAB 1: Edit Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gold/30 shadow-md max-w-2xl space-y-6">
              <h2 className="text-base font-black text-[#0B1B3D] border-b border-gold/20 pb-3">
                Personal Information
              </h2>

              {savedFeedback && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                  savedFeedback.isError
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-green-100 border-green-300 text-green-800'
                }`}>
                  <CheckCircle2 size={16} className={savedFeedback.isError ? 'text-red-600' : 'text-green-700'} />
                  <span>{savedFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-6 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow border border-gold/30"
                >
                  <Save size={15} />
                  <span>Save Profile Changes</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Manage Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#0B1B3D]">Your Saved Delivery Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow border border-gold"
                >
                  <Plus size={16} />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Add New Address Form Modal/Box */}
              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-3xl border-2 border-gold/40 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="text-xs font-black uppercase text-[#0B1B3D]">Add New Shipping Address</h3>
                    <button type="button" onClick={() => setShowAddAddress(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>

                  <div className="flex gap-2">
                    {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewAddrType(t)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${newAddrType === t ? 'bg-[#0B1B3D] text-gold border-[#0B1B3D]' : 'bg-gray-50 text-gray-700'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
                    <input
                      required
                      value={newAddrLine}
                      onChange={(e) => setNewAddrLine(e.target.value)}
                      placeholder="Flat No, Building Name, Street..."
                      className="w-full border border-gray-300 p-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                      <input
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                      <input
                        value={newAddrPincode}
                        onChange={(e) => setNewAddrPincode(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  </div>

                  <button type="submit" className="bg-[#0B1B3D] text-gold px-4 py-2 rounded-xl text-xs font-extrabold shadow">
                    Save Address
                  </button>
                </form>
              )}

              {/* Address List */}
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-5 rounded-3xl border-2 border-gold/30 shadow-sm space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#0B1B3D] flex items-center gap-1.5">
                        {addr.type === 'HOME' ? <Home size={14} /> : <Briefcase size={14} />}
                        <span>{addr.type}</span>
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-black text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                          Default Primary
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-[#0B1B3D]">{addr.fullName} ({addr.phone})</p>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-gold-dark hover:underline font-bold text-[11px]"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-red-600 hover:text-red-800 ml-auto p-1"
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Wishlist Grid */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-[#0B1B3D]">Saved Wishlist Items</h2>

              {wishlist.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gold/40 text-center space-y-3 max-w-md mx-auto">
                  <Heart size={36} className="mx-auto text-gray-300" />
                  <h3 className="text-base font-black text-[#0B1B3D]">Your Wishlist is Empty</h3>
                  <p className="text-xs text-gray-500">Save your favorite sweets and savories for quick ordering.</p>
                  <Link href="/categories" className="inline-block bg-[#0B1B3D] text-gold px-6 py-2.5 rounded-xl text-xs font-extrabold shadow">
                    Explore Products →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => {
                    const price = item.variants?.[0]?.discountedPrice || item.variants?.[0]?.price || 350;
                    return (
                      <div key={item.id} className="bg-white rounded-3xl border-2 border-gold/30 shadow-sm overflow-hidden p-4 space-y-3 relative group">
                        <button
                          onClick={() => handleRemoveWishlist(item.id)}
                          className="absolute top-6 right-6 z-10 p-1.5 rounded-full bg-white/80 text-red-600 hover:bg-red-50 shadow transition"
                          title="Remove from Wishlist"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="h-44 w-full overflow-hidden rounded-2xl bg-gray-50 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-gold-dark bg-gold/15 px-2 py-0.5 rounded">
                            {item.category?.toUpperCase() || 'SWEETS'}
                          </span>
                          <h3 className="font-extrabold text-sm text-[#0B1B3D] mt-1">{item.name}</h3>
                          <p className="text-sm font-black text-[#0B1B3D] mt-1">₹{price.toLocaleString('en-IN')}</p>
                        </div>

                        <button
                          onClick={async () => {
                            const variantId = item.variants?.[0]?.id || `${item.id}-500g`;
                            await addToCart(variantId, 1);
                            if (setIsOpen) setIsOpen(true);
                          }}
                          className="w-full bg-[#0B1B3D] text-gold hover:bg-[#162C5B] py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow transition"
                        >
                          <ShoppingCart size={15} />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Order History */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-[#0B1B3D]">Your Order History</h2>

              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gold/40 text-center space-y-3 max-w-md mx-auto">
                  <Package size={36} className="mx-auto text-gray-300" />
                  <h3 className="text-base font-black text-[#0B1B3D]">No Orders Yet</h3>
                  <p className="text-xs text-gray-500">You haven&apos;t placed any orders yet. Start shopping now!</p>
                  <Link href="/categories" className="inline-block bg-[#0B1B3D] text-gold px-6 py-2.5 rounded-xl text-xs font-extrabold shadow">
                    Start Shopping →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.orderId || Math.random()} className="bg-white p-6 rounded-3xl border-2 border-gold/30 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <span className="font-black text-sm text-[#0B1B3D]">Order #{ord.orderId || 'VSM-849201'}</span>
                          <span className="text-xs text-gray-500 block sm:inline sm:ml-3">
                            Placed on {new Date(ord.date || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-green-800 bg-green-100 px-3 py-1 rounded-full border border-green-300">
                            {ord.status || 'Packed'}
                          </span>
                          <button
                            onClick={() => handleDownloadInvoice(ord)}
                            className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow"
                          >
                            <Download size={13} />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 text-xs text-gray-700">
                        <div>
                          <p><strong>Recipient:</strong> {ord.fullName || name} ({ord.phone || phone})</p>
                          <p className="truncate"><strong>Address:</strong> {ord.address || 'Surat, Gujarat'}</p>
                        </div>
                        <div>
                          <p><strong>Payment Method:</strong> {ord.paymentMethod || 'UPI'}</p>
                          <p className="text-sm font-black text-[#0B1B3D] mt-1">
                            Total Paid: ₹{(ord.total || 1250).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
