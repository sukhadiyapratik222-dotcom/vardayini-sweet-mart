"use client";

import { useEffect, useState } from "react";
import { Store, MapPin, Phone, Plus, Trash2, Pencil, CheckCircle2, Compass, Clock, Navigation, X } from "lucide-react";
import AdminLayout from "../AdminLayout";

interface Outlet {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  hours?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Outlet | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Surat");
  const [pincode, setPincode] = useState("395002");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [lat, setLat] = useState("21.1702");
  const [lng, setLng] = useState("72.8311");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setLoading(true);
    let list: Outlet[] = [];

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_stores_list");
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch (e) {}
      }
    }

    if (list.length === 0) {
      try {
        const res = await fetch(`${API_BASE}/stores`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) list = data;
        }
      } catch (e) {}
    }

    if (list.length === 0) {
      list = [
        {
          id: "store-surat-1",
          name: "Vardayini Sweet Mart - Main Outlet",
          address: "123 Ring Road, Near Textile Market",
          city: "Surat",
          pincode: "395002",
          phone: "+91 98765 43210",
          latitude: 21.1702,
          longitude: 72.8311,
          hours: "8:00 AM - 10:00 PM",
        },
        {
          id: "store-surat-2",
          name: "Vardayini Sweet Mart - Station Road",
          address: "45 Station Road, Opposite Railway Station",
          city: "Surat",
          pincode: "395003",
          phone: "+91 98765 43211",
          latitude: 21.2049,
          longitude: 72.8406,
          hours: "7:30 AM - 10:30 PM",
        },
        {
          id: "store-ahmedabad-1",
          name: "Vardayini Sweet Mart - Navrangpura",
          address: "78 CG Road, Navrangpura",
          city: "Ahmedabad",
          pincode: "380009",
          phone: "+91 98765 43212",
          latitude: 23.0366,
          longitude: 72.5612,
          hours: "9:00 AM - 9:30 PM",
        },
      ];
    }

    setStores(list);
    setLoading(false);
  }

  function openCreateModal() {
    setEditingStore(null);
    setName("");
    setAddress("");
    setCity("Surat");
    setPincode("395002");
    setPhone("+91 98765 43210");
    setLat("21.1702");
    setLng("72.8311");
    setShowModal(true);
  }

  function openEditModal(store: Outlet) {
    setEditingStore(store);
    setName(store.name || "");
    setAddress(store.address || "");
    setCity(store.city || "Surat");
    setPincode(store.pincode || "395002");
    setPhone(store.phone || "+91 98765 43210");
    setLat(String(store.latitude ?? "21.1702"));
    setLng(String(store.longitude ?? "72.8311"));
    setShowModal(true);
  }

  async function handleSaveStore(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
      latitude: Number(lat),
      longitude: Number(lng),
      hours: "8:00 AM - 10:00 PM",
    };

    let updatedStores: Outlet[] = [];

    if (editingStore) {
      // Edit existing store
      const updatedStore: Outlet = {
        ...editingStore,
        ...payload,
      };

      updatedStores = stores.map((s) => (s.id === editingStore.id ? updatedStore : s));

      try {
        await fetch(`${API_BASE}/stores/${editingStore.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {}

      setFeedback(`✓ Store Outlet "${updatedStore.name}" updated successfully!`);
    } else {
      // Create new store
      const newStore: Outlet = {
        id: `store-${Date.now()}`,
        ...payload,
      };

      updatedStores = [...stores, newStore];

      try {
        await fetch(`${API_BASE}/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {}

      setFeedback(`✓ New Store Branch "${newStore.name}" added successfully!`);
    }

    setStores(updatedStores);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_stores_list", JSON.stringify(updatedStores));
    }

    setShowModal(false);
    setEditingStore(null);
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleDelete(id: string) {
    const target = stores.find((s) => s.id === id);
    const updated = stores.filter((s) => s.id !== id);
    setStores(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("admin_stores_list", JSON.stringify(updated));
    }

    try {
      await fetch(`${API_BASE}/stores/${id}`, { method: "DELETE" });
    } catch (err) {}

    setFeedback(`✓ Store Outlet ${target?.name ? `"${target.name}"` : ""} deleted.`);
    setTimeout(() => setFeedback(null), 3000);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-6 rounded-3xl text-white border-2 border-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-2 border border-gold/30">
              <Store size={14} />
              <span>Physical Branch Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Store Outlet Manager</h1>
            <p className="text-xs text-gray-300 mt-1">Add, edit, or manage physical sweet shop branches and map coordinates.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 shadow border border-gold shrink-0 transition"
          >
            <Plus size={16} />
            <span>Add New Outlet</span>
          </button>
        </div>

        {feedback && (
          <div className="p-4 bg-green-100 border border-green-300 text-green-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow">
            <CheckCircle2 size={18} className="text-green-700 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Stores Table */}
        <div className="bg-white rounded-3xl border-2 border-gold/30 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1B3D] text-gold uppercase text-[10px] font-black tracking-wider border-b border-gold/30">
                <tr>
                  <th className="p-4">Outlet Name</th>
                  <th className="p-4">Address & Location</th>
                  <th className="p-4">City / Pincode</th>
                  <th className="p-4">Phone Support</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-amber-50/40 transition">
                    <td className="p-4 font-black text-sm text-[#0B1B3D]">
                      {s.name}
                    </td>

                    <td className="p-4 text-gray-700 font-semibold max-w-xs">
                      {s.address}
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-[#0B1B3D] block">{s.city}</span>
                      <span className="text-[10px] text-gray-500 font-bold">PIN {s.pincode}</span>
                    </td>

                    <td className="p-4 font-bold text-gray-800">
                      {s.phone}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Store Button */}
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-2 text-gold-dark hover:text-gold hover:bg-[#0B1B3D] rounded-xl transition flex items-center gap-1 font-bold text-xs"
                          title="Edit Store Outlet"
                        >
                          <Pencil size={15} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        {/* Delete Store Button */}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                          title="Delete Outlet"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Store Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSaveStore} className="bg-white rounded-3xl border-2 border-gold/40 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-[#0B1B3D]">
                  {editingStore ? "Edit Physical Store Outlet" : "Add New Physical Store Outlet"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStore(null);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 font-bold text-xs"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Outlet Branch Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vardayini Sweet Mart - Adajan Outlet"
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop No., Complex, Road Name..."
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                  <input
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Latitude</label>
                  <input
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Longitude</label>
                  <input
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStore(null);
                  }}
                  className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-xs hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[#0B1B3D] text-gold py-3 rounded-xl font-black text-xs shadow hover:bg-[#162C5B] transition border border-gold"
                >
                  {editingStore ? "Update Store Outlet" : "Save & Publish Outlet"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
