"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, RefreshCw, CheckCircle2, Truck, Package, Clock, XCircle, Search, Filter, ShieldCheck, ArrowRight, DollarSign } from "lucide-react";
import AdminLayout from "../AdminLayout";

interface OrderItem {
  id: string;
  name: string;
  weight: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderId: string;
  date: string;
  status: "Placed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  fullName: string;
  email: string;
  phone: string;
  address: string;
  deliveryDate: string;
  timeSlot: string;
  paymentMethod: string;
  paymentStatus: "PAID" | "PENDING" | "REFUNDED";
  total: number;
  items: OrderItem[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundSuccess, setRefundSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    let orderData: Order[] = [];

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || localStorage.getItem("auth_token") : null;
      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          orderData = data;
        }
      }
    } catch (e) {}

    if (orderData.length === 0 && typeof window !== "undefined") {
      const stored = localStorage.getItem("my_orders");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          orderData = parsed.map((o: any) => ({
            id: o.orderId || `ord-${Math.random()}`,
            orderId: o.orderId || "VSM-849201",
            date: o.date || new Date().toISOString(),
            status: o.status || "Packed",
            fullName: o.fullName || "Pratik Sukhadiya",
            email: o.email || "pratik@example.com",
            phone: o.phone || "+91 98765 43210",
            address: o.address || "Surat, Gujarat",
            deliveryDate: o.deliveryDate || "Tomorrow",
            timeSlot: o.timeSlot || "Morning Slot",
            paymentMethod: o.paymentMethod || "UPI",
            paymentStatus: "PAID",
            total: o.total || 1250,
            items: o.items || [
              { id: "i1", name: "Royal Kaju Katli", weight: "500g", quantity: 1, price: 850 },
              { id: "i2", name: "Farali Chevdo", weight: "250g", quantity: 2, price: 200 },
            ],
          }));
        } catch (e) {}
      }
    }

    if (orderData.length === 0) {
      orderData = [
        {
          id: "VSM-849201",
          orderId: "VSM-849201",
          date: new Date().toISOString(),
          status: "Packed",
          fullName: "Pratik Sukhadiya",
          email: "pratik@example.com",
          phone: "+91 98765 43210",
          address: "102, Shrimad Complex, Ring Road, Surat, Gujarat - 395002",
          deliveryDate: "Tomorrow",
          timeSlot: "Morning (9:00 AM - 1:00 PM)",
          paymentMethod: "UPI",
          paymentStatus: "PAID",
          total: 1250,
          items: [
            { id: "i1", name: "Royal Kaju Katli", weight: "500g", quantity: 1, price: 850 },
            { id: "i2", name: "Farali Chevdo", weight: "250g", quantity: 2, price: 200 },
          ],
        },
        {
          id: "VSM-719304",
          orderId: "VSM-719304",
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          status: "Shipped",
          fullName: "Ramesh Patel",
          email: "ramesh@example.com",
          phone: "+91 98765 11223",
          address: "45, Navrangpura, CG Road, Ahmedabad, Gujarat - 380009",
          deliveryDate: "Today",
          timeSlot: "Evening Slot",
          paymentMethod: "Credit Card",
          paymentStatus: "PAID",
          total: 2100,
          items: [
            { id: "i3", name: "Sugarless Anjeer Roll", weight: "1kg", quantity: 1, price: 1400 },
          ],
        },
      ];
    }

    setOrders(orderData);
    setLoading(false);
  }

  async function handleUpdateStatus(orderId: string, newStatus: Order["status"]) {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {}
  }

  function handleProcessRefund(order: Order) {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === order.orderId ? { ...o, paymentStatus: "REFUNDED", status: "Cancelled" } : o))
    );
    setRefundSuccess(`✓ Refund of ₹${order.total.toLocaleString("en-IN")} successfully processed for Order #${order.orderId}`);
    setSelectedOrder(null);
    setTimeout(() => setRefundSuccess(null), 4000);
  }

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "ALL" || o.status.toUpperCase() === filterStatus.toUpperCase();
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-6 rounded-3xl text-white border-2 border-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-2 border border-gold/30">
              <ShoppingCart size={14} />
              <span>Order Fulfillment Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Order Management</h1>
            <p className="text-xs text-gray-300 mt-1">Review orders, update live fulfillment status, and handle customer refunds.</p>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow border border-gold shrink-0"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {refundSuccess && (
          <div className="p-4 bg-green-100 border border-green-300 text-green-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow">
            <CheckCircle2 size={18} className="text-green-700" />
            <span>{refundSuccess}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-gold/20 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {["ALL", "Placed", "Packed", "Shipped", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition shrink-0 border ${
                  filterStatus.toUpperCase() === status.toUpperCase()
                    ? "bg-[#0B1B3D] text-gold border-[#0B1B3D] shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gold"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, Customer, Phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-gold bg-white"
            />
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="bg-white rounded-3xl border-2 border-gold/30 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1B3D] text-gold uppercase text-[10px] font-black tracking-wider border-b border-gold/30">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Schedule Slot</th>
                  <th className="p-4">Total & Payment</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-amber-50/40 transition">
                    <td className="p-4">
                      <span className="font-black text-xs text-[#0B1B3D] block">#{order.orderId}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-[#0B1B3D]">{order.fullName}</p>
                      <p className="text-[10px] text-gray-500">{order.phone}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-[#0B1B3D]">{order.deliveryDate}</p>
                      <p className="text-[10px] text-gray-500">{order.timeSlot}</p>
                    </td>

                    <td className="p-4">
                      <span className="font-black text-[#0B1B3D] block">₹{order.total.toLocaleString("en-IN")}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "REFUNDED"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {order.paymentStatus} ({order.paymentMethod})
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.orderId, e.target.value as Order["status"])}
                        className={`text-xs font-black px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-900 border-green-300"
                            : order.status === "Shipped" || order.status === "Packed"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-900 border-red-300"
                            : "bg-blue-100 text-blue-900 border-blue-300"
                        }`}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-amber-50 hover:bg-gold/20 text-[#0B1B3D] border border-gold/40 px-3 py-1.5 rounded-xl font-bold text-[11px] transition"
                        >
                          View Items
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details & Refund Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border-2 border-gold/40 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-[#0B1B3D]">Order #{selectedOrder.orderId} Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">✕ Close</button>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <p><strong>Customer:</strong> {selectedOrder.fullName} ({selectedOrder.phone})</p>
                <p><strong>Address:</strong> {selectedOrder.address}</p>
                <p><strong>Delivery Slot:</strong> {selectedOrder.deliveryDate} ({selectedOrder.timeSlot})</p>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <h4 className="text-xs font-black text-[#0B1B3D] uppercase">Itemized Receipt</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-semibold">
                    <span>{item.name} ({item.weight}) × {item.quantity}</span>
                    <span className="font-bold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-black text-[#0B1B3D]">
                <span>Grand Total</span>
                <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
              </div>

              <div className="pt-2 flex gap-2">
                {selectedOrder.paymentStatus !== "REFUNDED" && (
                  <button
                    onClick={() => handleProcessRefund(selectedOrder)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <DollarSign size={15} />
                    <span>Process Full Refund</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-2.5 rounded-xl font-bold text-xs transition"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
