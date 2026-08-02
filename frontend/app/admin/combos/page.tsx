"use client";

import { useEffect, useState } from "react";
import { Gift, Plus, Trash2, CheckCircle2, Sparkles, Tag, ShoppingBag } from "lucide-react";
import AdminLayout from "../AdminLayout";

interface ComboOffer {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  image: string;
  isFeatured: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCombos();
  }, []);

  async function fetchCombos() {
    setLoading(true);
    let list: ComboOffer[] = [];

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_combos_list");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        } catch (e) {}
      }
    }

    if (list.length === 0) {
      try {
        const res = await fetch(`${API_BASE}/admin/combos`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) list = data;
        }
      } catch (e) {}
    }

    if (list.length === 0) {
      list = [
        {
          id: "c-1",
          name: "Royal Festive Sweet Box (1kg)",
          price: 1499,
          originalPrice: 1800,
          description: "Includes Royal Kaju Katli (250g), Sugarless Anjeer Roll (250g), Kesar Penda (250g), & Special Dryfruit Mix (250g).",
          image: "/images/sweet-1.jpg",
          isFeatured: true,
        },
        {
          id: "c-2",
          name: "Gujarati Premium Namkeen Variety Combo",
          price: 699,
          originalPrice: 850,
          description: "Includes Farali Chevdo, Ratlami Sev, Special Khatta Meetha Mixture, Masala Khakhra, & Roasted Millet Snacks.",
          image: "/images/sweet-2.jpg",
          isFeatured: true,
        },
      ];
    }

    saveCombosToStorage(list);
    setLoading(false);
  }

  function saveCombosToStorage(newList: ComboOffer[]) {
    setCombos(newList);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_combos_list", JSON.stringify(newList));
    }
  }

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(1200);
  const [originalPrice, setOriginalPrice] = useState(1500);
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleCreateCombo(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const newCombo: ComboOffer = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice),
      description: description || "Assorted Vardayini Sweets & Savories festive box.",
      image: "/images/sweet-3.jpg",
      isFeatured: true,
    };

    const updated = [newCombo, ...combos];
    saveCombosToStorage(updated);

    try {
      await fetch(`${API_BASE}/admin/combos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCombo),
      });
    } catch (e) {}

    setName("");
    setDescription("");
    setShowAddModal(false);
    setFeedback(`✓ Festive Combo "${newCombo.name}" successfully created!`);
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleDelete(id: string) {
    const updated = combos.filter((c) => c.id !== id);
    saveCombosToStorage(updated);

    try {
      await fetch(`${API_BASE}/admin/combos/${id}`, { method: "DELETE" });
    } catch (e) {}
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-6 rounded-3xl text-white border-2 border-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-2 border border-gold/30">
              <Gift size={14} />
              <span>Festive Hampers & Special Bundles</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Combo & Special Offers Manager</h1>
            <p className="text-xs text-gray-300 mt-1">Manage festive gift boxes, multi-item combos, and seasonal promotional bundles.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 shadow border border-gold shrink-0"
          >
            <Plus size={16} />
            <span>Create New Combo</span>
          </button>
        </div>

        {feedback && (
          <div className="p-4 bg-green-100 border border-green-300 text-green-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow">
            <CheckCircle2 size={18} className="text-green-700" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Combos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {combos.map((combo) => (
            <div key={combo.id} className="bg-white rounded-3xl border-2 border-gold/30 shadow-md p-5 space-y-3 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-44 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gold/20 relative">
                  <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-[#0B1B3D] text-gold text-[10px] font-black px-2.5 py-1 rounded-full border border-gold/40 shadow">
                    SPECIAL COMBO
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#0B1B3D]">{combo.name}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{combo.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-[#0B1B3D]">₹{combo.price.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-gray-400 line-through ml-2 font-bold">₹{combo.originalPrice.toLocaleString("en-IN")}</span>
                </div>

                <button
                  onClick={() => handleDelete(combo.id)}
                  className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                  title="Delete Combo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Combo Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleCreateCombo} className="bg-white rounded-3xl border-2 border-gold/40 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-[#0B1B3D]">Create New Festive Combo</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">✕ Cancel</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Combo Box Title</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Diwali Mithai Hamper"
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Items Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe included sweet varieties..."
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold"
                  rows={3}
                />
              </div>

              <button type="submit" className="w-full bg-[#0B1B3D] text-gold py-3 rounded-xl font-black text-xs shadow hover:bg-[#162C5B] transition">
                Save & Publish Festive Combo
              </button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
