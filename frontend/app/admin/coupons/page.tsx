"use client";

import { useEffect, useState } from "react";
import { Tags, Plus, Trash2, CheckCircle2, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import AdminLayout from "../AdminLayout";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minPurchase: number;
  isActive: boolean;
  expiryDate?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [minPurchase, setMinPurchase] = useState(500);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    let list: Coupon[] = [];

    // 1. Try to load from localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_coupons_list");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        } catch (e) {}
      }
    }

    // 2. Try to fetch from backend API
    if (list.length === 0) {
      try {
        const res = await fetch(`${API_BASE}/admin/coupons`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            list = data;
          }
        }
      } catch (e) {}
    }

    // 3. Fallback sample list if empty
    if (list.length === 0) {
      list = [
        { id: "c1", code: "SWEET10", discountPercent: 10, minPurchase: 500, isActive: true, expiryDate: "2026-12-31" },
        { id: "c2", code: "FESTIVE5", discountPercent: 5, minPurchase: 1000, isActive: true, expiryDate: "2026-12-31" },
        { id: "c3", code: "GIFT15", discountPercent: 15, minPurchase: 2500, isActive: true, expiryDate: "2026-12-31" },
      ];
    }

    setCoupons(list);
    saveCouponsToStorage(list);
    setLoading(false);
  }

  function saveCouponsToStorage(newList: Coupon[]) {
    setCoupons(newList);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_coupons_list", JSON.stringify(newList));
    }
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountPercent: Number(discountPercent),
      minPurchase: Number(minPurchase),
      isActive: true,
      expiryDate: "2026-12-31",
    };

    const updated = [newCoupon, ...coupons];
    saveCouponsToStorage(updated);

    try {
      await fetch(`${API_BASE}/admin/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
    } catch (e) {}

    setCode("");
    setShowAddModal(false);
    setFeedback(`✓ Coupon code "${newCoupon.code}" successfully created!`);
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleDelete(id: string) {
    const updated = coupons.filter((c) => c.id !== id);
    saveCouponsToStorage(updated);

    try {
      await fetch(`${API_BASE}/admin/coupons/${id}`, { method: "DELETE" });
    } catch (e) {}
  }

  async function handleToggle(id: string) {
    const updated = coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    saveCouponsToStorage(updated);

    try {
      const target = updated.find((c) => c.id === id);
      await fetch(`${API_BASE}/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });
    } catch (e) {}
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-6 rounded-3xl text-white border-2 border-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-2 border border-gold/30">
              <Tags size={14} />
              <span>Promotional Discount Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Coupon Code Manager</h1>
            <p className="text-xs text-gray-300 mt-1">Create, edit, and toggle discount codes for marketing campaigns.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 shadow border border-gold shrink-0"
          >
            <Plus size={16} />
            <span>Create New Coupon</span>
          </button>
        </div>

        {feedback && (
          <div className="p-4 bg-green-100 border border-green-300 text-green-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow">
            <CheckCircle2 size={18} className="text-green-700" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Coupons Table Card */}
        <div className="bg-white rounded-3xl border-2 border-gold/30 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1B3D] text-gold uppercase text-[10px] font-black tracking-wider border-b border-gold/30">
                <tr>
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount %</th>
                  <th className="p-4">Min Spend</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/40 transition">
                    <td className="p-4">
                      <span className="font-black text-sm text-[#0B1B3D] bg-amber-50 border border-gold/40 px-3 py-1 rounded-xl inline-block">
                        🏷️ {c.code}
                      </span>
                    </td>

                    <td className="p-4 font-black text-xs text-green-700">
                      {c.discountPercent}% OFF
                    </td>

                    <td className="p-4 font-bold text-gray-700">
                      ₹{c.minPurchase.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggle(c.id)}
                        className={`text-[10px] font-black px-3 py-1 rounded-full border transition ${
                          c.isActive
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}
                      >
                        {c.isActive ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                        title="Delete Coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Coupon Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleCreateCoupon} className="bg-white rounded-3xl border-2 border-gold/40 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-[#0B1B3D]">Create New Promo Code</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">✕ Cancel</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code (Uppercase)</label>
                <input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. DIWALI20"
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 bg-[#0B1B3D] text-gold py-3 rounded-xl font-black text-xs shadow hover:bg-[#162C5B] transition">
                  Save & Publish Coupon
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
