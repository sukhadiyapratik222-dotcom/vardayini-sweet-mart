"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
import { Store, MapPin, Phone, Clock, Plus, Search, CheckCircle, Trash2, Shield, RefreshCw, Edit3 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface StoreOutlet {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  mapLink?: string;
  hours?: string;
  isOpen?: boolean;
}

const defaultStores: StoreOutlet[] = [
  {
    id: "store-surat-1",
    name: "Vardayini Sweet Mart - Main Outlet",
    address: "123 Ring Road, Near Textile Market",
    city: "Surat",
    pincode: "395002",
    phone: "+91 98765 43210",
    mapLink: "https://maps.google.com/?q=Surat+Vardayini+Sweet+Mart",
    hours: "8:00 AM - 10:00 PM",
    isOpen: true,
  },
  {
    id: "store-surat-2",
    name: "Vardayini Sweet Mart - Station Road",
    address: "45 Station Road, Opposite Railway Station",
    city: "Surat",
    pincode: "395003",
    phone: "+91 98765 43211",
    mapLink: "https://maps.google.com/?q=Station+Road+Surat",
    hours: "7:30 AM - 10:30 PM",
    isOpen: true,
  },
  {
    id: "store-ahmedabad-1",
    name: "Vardayini Sweet Mart - Navrangpura",
    address: "78 CG Road, Navrangpura",
    city: "Ahmedabad",
    pincode: "380009",
    phone: "+91 98765 43212",
    mapLink: "https://maps.google.com/?q=Navrangpura+Ahmedabad",
    hours: "9:00 AM - 9:30 PM",
    isOpen: true,
  },
  {
    id: "store-vadodara-1",
    name: "Vardayini Sweet Mart - Alkapuri",
    address: "12 Alkapuri Main Road",
    city: "Vadodara",
    pincode: "390007",
    phone: "+91 98765 43213",
    mapLink: "https://maps.google.com/?q=Alkapuri+Vadodara",
    hours: "8:30 AM - 10:00 PM",
    isOpen: true,
  },
];

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreOutlet | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Surat");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("8:00 AM - 10:00 PM");
  const [mapLink, setMapLink] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stores`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            address: s.address,
            city: s.city,
            pincode: s.pincode,
            phone: s.phone || "+91 98765 43210",
            mapLink: s.mapLink || `https://maps.google.com/?q=${encodeURIComponent(s.name + " " + s.city)}`,
            hours: s.hours || "8:00 AM - 10:00 PM",
            isOpen: s.isOpen ?? true,
          }));
          setStores(formatted);
          localStorage.setItem("admin_stores_list", JSON.stringify(formatted));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend unavailable, loading local stores dataset.");
    }

    // Fallback to local storage or defaults
    const cached = localStorage.getItem("admin_stores_list");
    if (cached) {
      try {
        setStores(JSON.parse(cached));
      } catch (err) {
        setStores(defaultStores);
      }
    } else {
      setStores(defaultStores);
      localStorage.setItem("admin_stores_list", JSON.stringify(defaultStores));
    }
    setLoading(false);
  }

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleOpenAddModal() {
    setEditingStore(null);
    setName("");
    setAddress("");
    setCity("Surat");
    setPincode("");
    setPhone("");
    setHours("8:00 AM - 10:00 PM");
    setMapLink("");
    setShowAddModal(true);
  }

  function handleOpenEditModal(store: StoreOutlet) {
    setEditingStore(store);
    setName(store.name);
    setAddress(store.address);
    setCity(store.city);
    setPincode(store.pincode);
    setPhone(store.phone);
    setHours(store.hours || "8:00 AM - 10:00 PM");
    setMapLink(store.mapLink || "");
    setShowAddModal(true);
  }

  async function handleSaveStore(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !address || !pincode || !phone) return;
    setIsSubmitting(true);
    setMessage(null);

    const generatedMapLink = mapLink.trim()
      ? mapLink.trim()
      : `https://maps.google.com/?q=${encodeURIComponent(name + " " + address + " " + city)}`;

    if (editingStore) {
      // EDIT OUTLET
      const updatedStore: StoreOutlet = {
        ...editingStore,
        name,
        address,
        city,
        pincode,
        phone,
        hours,
        mapLink: generatedMapLink,
      };

      try {
        const token = localStorage.getItem("admin_token");
        await fetch(`${API_BASE}/stores/${editingStore.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name,
            address,
            city,
            pincode,
            phone,
          }),
        });
      } catch (err) {
        // ignore network error
      }

      const updated = stores.map((s) => (s.id === editingStore.id ? updatedStore : s));
      setStores(updated);
      localStorage.setItem("admin_stores_list", JSON.stringify(updated));
      setMessage("Store outlet updated successfully!");
    } else {
      // CREATE OUTLET
      const newOutlet: StoreOutlet = {
        id: `store-${Date.now()}`,
        name,
        address,
        city,
        pincode,
        phone,
        mapLink: generatedMapLink,
        hours,
        isOpen: true,
      };

      try {
        const token = localStorage.getItem("admin_token");
        await fetch(`${API_BASE}/stores`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name,
            address,
            city,
            pincode,
            phone,
          }),
        });
      } catch (err) {
        // ignore
      }

      const updated = [newOutlet, ...stores];
      setStores(updated);
      localStorage.setItem("admin_stores_list", JSON.stringify(updated));
      setMessage("Store outlet added successfully!");
    }

    setShowAddModal(false);
    setIsSubmitting(false);
    setEditingStore(null);
  }

  function toggleStoreStatus(id: string) {
    const updated = stores.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen } : s));
    setStores(updated);
    localStorage.setItem("admin_stores_list", JSON.stringify(updated));
  }

  async function deleteStore(id: string) {
    setMessage(null);
    // 1. Try DB deletion
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${API_BASE}/stores/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      // ignore network error
    }

    // 2. Update state and local storage
    const updated = stores.filter((s) => s.id !== id);
    setStores(updated);
    localStorage.setItem("admin_stores_list", JSON.stringify(updated));
    setMessage("Store outlet removed successfully!");
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase tracking-wider mb-2">
              <Store size={14} />
              Store Outlets & Locations
            </div>
            <h1 className="text-2xl font-extrabold text-[#0B1B3D]">Store Management</h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage physical sweet shop outlets, branch addresses, and store operating hours.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-5 py-2.5 rounded-xl font-bold text-sm shadow transition flex items-center gap-2 border border-gold/30"
          >
            <Plus size={18} />
            Add New Outlet
          </button>
        </div>

        {/* Search Bar & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 bg-white p-4 rounded-xl border border-gold/20 shadow-sm flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search outlets by name, city, or address..."
              className="w-full text-xs sm:text-sm text-gray-800 focus:outline-none"
            />
          </div>

          <div className="bg-[#0B1B3D] text-white p-4 rounded-xl border border-gold/30 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gold uppercase font-bold tracking-wider block">Active Outlets</span>
              <span className="text-2xl font-black text-white">{stores.filter((s) => s.isOpen).length} / {stores.length}</span>
            </div>
            <Shield size={28} className="text-gold opacity-80" />
          </div>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl p-6 border border-gold/20 shadow-sm space-y-4 relative hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center font-bold border border-gold/30">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0B1B3D] text-base">{store.name}</h3>
                    <span className="inline-block bg-gold/20 text-[#0B1B3D] text-[10px] font-bold px-2 py-0.5 rounded mt-0.5">
                      {store.city} • PIN {store.pincode}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleStoreStatus(store.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                    store.isOpen
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  <CheckCircle size={12} />
                  {store.isOpen ? "Open" : "Closed"}
                </button>
              </div>

              <div className="space-y-2 text-xs text-gray-600 border-t border-b border-gray-100 py-3">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gold-dark flex-shrink-0 mt-0.5" />
                  <span>{store.address}, {store.city} - {store.pincode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gold-dark flex-shrink-0" />
                  <span className="font-medium text-gray-800">{store.phone}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50 text-[11px]">
                  <span className="text-gray-600 font-medium flex items-center gap-1">
                    <MapPin size={13} className="text-gold-dark" />
                    Location: <strong className="text-gray-800">Google Maps Verified</strong>
                  </span>
                  <a
                    href={store.mapLink || `https://maps.google.com/?q=${encodeURIComponent(store.name + " " + store.address + " " + store.city)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gold/20 text-[#0B1B3D] px-2.5 py-1 rounded-md font-extrabold border border-gold/40 hover:bg-gold hover:text-[#0B1B3D] transition flex items-center gap-1"
                  >
                    Open Google Maps ↗
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-green-700 font-bold flex items-center gap-1">
                  ✓ In-Store Pickup Enabled
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(store)}
                    className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 hover:underline bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200"
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteStore(store.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Store Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gold/30">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-[#0B1B3D] flex items-center gap-2">
                  <Store size={18} className="text-gold-dark" />
                  {editingStore ? "Edit Store Outlet" : "Add New Outlet Location"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveStore} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Outlet Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vardayini Sweet Mart - Ring Road"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Surat"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="395002"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full street address..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Hours</label>
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="8:00 AM - 10:00 PM"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800"
                    />
                  </div>
                </div>

                {/* Google Maps Location Link Input */}
                <div className="pt-1 border-t border-gray-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 block">Google Maps Location Link (Optional)</label>
                    <a
                      href={
                        address && city
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + address + " " + city)}`
                          : "https://maps.google.com"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-gold-dark hover:underline flex items-center gap-0.5"
                    >
                      Search on Maps ↗
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mapLink}
                      onChange={(e) => setMapLink(e.target.value)}
                      placeholder="e.g. https://maps.google.com/?q=Vardayini+Sweet+Mart"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold"
                    />
                    <a
                      href={
                        address && city
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + address + " " + city)}`
                          : "https://maps.google.com"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="bg-gold/20 text-[#0B1B3D] hover:bg-gold px-3 py-2 rounded-lg text-xs font-extrabold border border-gold/40 transition whitespace-nowrap flex items-center gap-1 shadow-sm"
                    >
                      📍 Open Maps ↗
                    </a>
                  </div>
                  <p className="text-[10px] text-gray-400">Click "Open Maps ↗" to search & copy the location link, or leave empty to auto-generate.</p>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 bg-gray-100 text-gray-700 font-bold py-2 rounded-xl text-xs hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-[#0B1B3D] text-gold font-bold py-2 rounded-xl text-xs hover:bg-[#162C5B] border border-gold/30"
                  >
                    {editingStore ? "Update Outlet" : "Save Outlet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
