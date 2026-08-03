"use client";

import { useEffect, useState } from "react";
import { Users, Search, ShoppingBag, Eye, RefreshCw, CheckCircle2, ShieldCheck, Mail, Phone } from "lucide-react";
import AdminLayout from "../AdminLayout";

interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  orders: any[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    let list: CustomerUser[] = [];

    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("admin_token") || localStorage.getItem("token")) : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/admin/customers`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) list = data;
      }
    } catch (e) {}

    setCustomers(list);
    setLoading(false);
  }

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-6 rounded-3xl text-white border-2 border-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-2 border border-gold/30">
              <Users size={14} />
              <span>Customer Relationship Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Customer User Directory</h1>
            <p className="text-xs text-gray-300 mt-1">Real-time database records of registered customer profiles, total spend, and order history.</p>
          </div>

          <button
            onClick={fetchCustomers}
            className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow border border-gold shrink-0"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh Directory</span>
          </button>
        </div>

        {/* Search Control */}
        <div className="bg-white p-4 rounded-2xl border border-gold/20 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, Email, Phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-gold bg-white"
            />
          </div>
          <span className="text-xs font-extrabold text-[#0B1B3D]">Total Registered Database Users: {customers.length}</span>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-3xl border-2 border-gold/30 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1B3D] text-gold uppercase text-[10px] font-black tracking-wider border-b border-gold/30">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Orders Placed</th>
                  <th className="p-4">Total Amount Spent</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 font-semibold">
                      No customer users found in database matching your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-amber-50/40 transition">
                      <td className="p-4 font-black text-sm text-[#0B1B3D]">
                        {user.name}
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-[#0B1B3D]">{user.email}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{user.phone || "No phone added"}</p>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 size={11} />
                          <span>Active</span>
                        </span>
                      </td>

                      <td className="p-4 font-semibold text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "Recent"}
                      </td>

                      <td className="p-4 font-black text-[#0B1B3D]">
                        {user.totalOrders || 0} Orders
                      </td>

                      <td className="p-4 font-black text-green-700">
                        ₹{(user.totalSpent || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedCustomer(user)}
                          className="bg-amber-50 hover:bg-gold/20 text-[#0B1B3D] border border-gold/40 px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1 mx-auto"
                        >
                          <Eye size={13} />
                          <span>View Orders</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Per-User Order History Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border-2 border-gold/40 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-[#0B1B3D]">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-500">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">✕ Close</button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                <h4 className="text-xs font-black text-[#0B1B3D] uppercase">Order History Log</h4>
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  selectedCustomer.orders.map((ord, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/60 rounded-xl border border-gold/30 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-black text-[#0B1B3D]">#{ord.orderId}</span>
                        <span className="text-[10px] text-gray-500 block">{ord.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#0B1B3D] block">₹{ord.total.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 font-semibold">No past order history found for this user.</p>
                )}
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full bg-[#0B1B3D] text-gold py-2.5 rounded-xl font-black text-xs shadow hover:bg-[#162C5B] transition"
              >
                Close Profile History
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
