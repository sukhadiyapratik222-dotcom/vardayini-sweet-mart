"use client";

import { useState, useEffect, useCallback } from "react";
import LineChartSVG from "./components/LineChartSVG";
import BarChartSVG from "./components/BarChartSVG";
import DonutChartSVG from "./components/DonutChartSVG";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trend { label: string; value: number }

interface AnalyticsData {
  sales: {
    totalRevenue: number; prevRevenue: number; changePercent: number;
    avgOrderValue: number; trend: Trend[];
  };
  orders: {
    total: number; prevTotal: number; changePercent: number;
    completed: number; pending: number; cancelled: number; returned: number;
    trend: Trend[];
    statusBreakdown: { status: string; count: number; color: string }[];
  };
  products: { id: string; name: string; quantitySold: number; price: number; totalRevenue: number }[];
  customers: {
    total: number; prevTotal: number; changePercent: number;
    newCustomers: number; prevNewCustomers: number; newChangePercent: number;
    trend: Trend[];
  };
  repeatCustomers: {
    repeatCount: number; oneTimeCount: number; totalWithOrders: number; repeatPercent: number;
  };
  avgOrderValue: number;
}

type Period = "today" | "yesterday" | "last7days" | "last30days" | "thismonth" | "lastmonth" | "thisyear" | "custom";
type SortKey = "totalRevenue" | "quantitySold" | "price";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(v: number): string {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
}

function formatNum(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return `${v}`;
}

function ChangeTag({ pct }: { pct: number }) {
  const isPos = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
        isPos ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
      }`}
    >
      {isPos ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string; title: string; value: string; change?: number;
  sublabel?: string; accent?: string;
}

function StatCard({ icon, title, value, change, sublabel, accent = "#D4AF37" }: StatCardProps) {
  return (
    <div
      className="relative rounded-2xl p-5 border border-white/[0.06] overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0F2040 0%, #0B1B3D 100%)" }}
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
          >
            {icon}
          </div>
          {change !== undefined && <ChangeTag pct={change} />}
        </div>
        <div className="text-2xl font-bold text-white mt-1">{value}</div>
        <div className="text-sm text-white/50 mt-0.5">{title}</div>
        {sublabel && <div className="text-xs text-white/30 mt-1">{sublabel}</div>}
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-6"
      style={{ background: "linear-gradient(135deg, #0F2040 0%, #0B1B3D 100%)" }}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Period Buttons ───────────────────────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
  { key: "today",     label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7days", label: "Last 7 Days" },
  { key: "last30days",label: "Last 30 Days" },
  { key: "thismonth", label: "This Month" },
  { key: "lastmonth", label: "Last Month" },
  { key: "thisyear",  label: "This Year" },
  { key: "custom",    label: "Custom" },
];

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [period, setPeriod]           = useState<Period>("last30days");
  const [customFrom, setCustomFrom]   = useState("");
  const [customTo, setCustomTo]       = useState("");
  const [data, setData]               = useState<AnalyticsData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [productSort, setProductSort] = useState<SortKey>("totalRevenue");
  const [showCustom, setShowCustom]   = useState(false);

  const fetchAnalytics = useCallback(async (p: Period, from?: string, to?: string) => {
    setLoading(true);
    setError("");
    try {
      let url = `http://localhost:4000/api/admin/analytics?period=${p}`;
      if (p === "custom" && from && to) url += `&from=${from}&to=${to}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (period !== "custom") fetchAnalytics(period);
    else if (customFrom && customTo) fetchAnalytics("custom", customFrom, customTo);
  }, [period, fetchAnalytics]);

  const handlePeriod = (p: Period) => {
    setPeriod(p);
    setShowCustom(p === "custom");
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) fetchAnalytics("custom", customFrom, customTo);
  };

  // Sorted products
  const sortedProducts = data
    ? [...data.products].sort((a, b) => b[productSort] - a[productSort])
    : [];

  // ── Loading skeleton ──
  if (loading && !data) {
    return (
      <div className="min-h-screen p-6" style={{ background: "#07122A" }}>
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-12 w-full mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: "#07122A" }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              📊 Analytics Dashboard
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Real-time insights from your store data
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              Refreshing…
            </div>
          )}
        </div>

        {/* Date Filter Bar */}
        <div className="rounded-2xl border border-white/[0.06] p-3 flex flex-wrap gap-2"
          style={{ background: "#0B1B3D" }}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePeriod(p.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p.key
                  ? "text-navy-dark font-semibold"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
              style={period === p.key ? { background: "#D4AF37" } : {}}
            >
              {p.label}
            </button>
          ))}

          {/* Custom date inputs */}
          {showCustom && (
            <div className="flex items-center gap-2 ml-2 flex-wrap">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
              />
              <span className="text-white/30 text-xs">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
              />
              <button
                onClick={handleCustomApply}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-navy-dark"
                style={{ background: "#D4AF37" }}
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {data && (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                icon="💰" title="Total Sales"
                value={formatINR(data.sales.totalRevenue)}
                change={data.sales.changePercent}
                sublabel={`Prev: ${formatINR(data.sales.prevRevenue)}`}
                accent="#D4AF37"
              />
              <StatCard
                icon="📦" title="Total Orders"
                value={formatNum(data.orders.total)}
                change={data.orders.changePercent}
                sublabel={`Prev: ${data.orders.prevTotal}`}
                accent="#3B82F6"
              />
              <StatCard
                icon="💎" title="Avg Order Value"
                value={formatINR(data.avgOrderValue)}
                accent="#8B5CF6"
              />
              <StatCard
                icon="👥" title="Total Customers"
                value={formatNum(data.customers.total)}
                change={data.customers.changePercent}
                accent="#22C55E"
              />
              <StatCard
                icon="🆕" title="New Customers"
                value={formatNum(data.customers.newCustomers)}
                change={data.customers.newChangePercent}
                sublabel={`Prev: ${data.customers.prevNewCustomers}`}
                accent="#F59E0B"
              />
              <StatCard
                icon="🔄" title="Repeat Customers"
                value={`${data.repeatCustomers.repeatPercent}%`}
                sublabel={`${data.repeatCustomers.repeatCount} of ${data.repeatCustomers.totalWithOrders}`}
                accent="#EC4899"
              />
            </div>

            {/* ── Sales + Orders Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
                title="Sales Over Time"
                subtitle={`Total Revenue: ${formatINR(data.sales.totalRevenue)}`}
              >
                <LineChartSVG data={data.sales.trend} color="#D4AF37" isCurrency height={180} />
              </Card>

              <Card
                title="Orders Over Time"
                subtitle={`Total Orders: ${data.orders.total.toLocaleString()}`}
              >
                <LineChartSVG data={data.orders.trend} color="#3B82F6" height={180} />
              </Card>
            </div>

            {/* ── Order Status ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status breakdown cards */}
              <Card title="Order Status Breakdown" subtitle="Current period">
                <div className="space-y-3">
                  {[
                    { label: "Completed", value: data.orders.completed, color: "#22C55E" },
                    { label: "Pending",   value: data.orders.pending,   color: "#F59E0B" },
                    { label: "Cancelled", value: data.orders.cancelled, color: "#EF4444" },
                    { label: "Returned",  value: data.orders.returned,  color: "#EC4899" },
                  ].map((s) => {
                    const pct = data.orders.total > 0
                      ? Math.round((s.value / data.orders.total) * 100)
                      : 0;
                    return (
                      <div key={s.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white/70">{s.label}</span>
                          <span className="text-sm font-semibold text-white">
                            {s.value}
                            <span className="text-white/30 text-xs ml-1">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: s.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* All statuses from DB */}
                {data.orders.statusBreakdown.length > 4 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-white/30 mb-2">All statuses</p>
                    <div className="flex flex-wrap gap-2">
                      {data.orders.statusBreakdown.map((s) => (
                        <span
                          key={s.status}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${s.color}20`, color: s.color }}
                        >
                          {s.status}: {s.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Donut chart for order status */}
              <Card title="Order Status Distribution" subtitle="Donut view">
                <DonutChartSVG
                  segments={[
                    { label: "Completed", value: data.orders.completed, color: "#22C55E" },
                    { label: "Pending",   value: data.orders.pending,   color: "#F59E0B" },
                    { label: "Cancelled", value: data.orders.cancelled, color: "#EF4444" },
                    { label: "Returned",  value: data.orders.returned,  color: "#EC4899" },
                  ].filter((s) => s.value > 0)}
                  size={148}
                />
              </Card>

              {/* Repeat vs one-time */}
              <Card title="Repeat vs One-Time" subtitle="Customer loyalty">
                <DonutChartSVG
                  segments={[
                    { label: "Repeat",   value: data.repeatCustomers.repeatCount,  color: "#D4AF37" },
                    { label: "One-Time", value: data.repeatCustomers.oneTimeCount, color: "#3B82F6" },
                  ].filter((s) => s.value > 0)}
                  centerLabel={`${data.repeatCustomers.repeatPercent}%`}
                  size={148}
                />
                {data.repeatCustomers.totalWithOrders === 0 && (
                  <p className="text-white/30 text-xs text-center mt-2">No orders in this period</p>
                )}
              </Card>
            </div>

            {/* ── Top Products Bar Chart ── */}
            <Card
              title="Top Products by Revenue"
              subtitle="Non-cancelled orders in selected period"
            >
              {data.products.length > 0 ? (
                <BarChartSVG
                  data={data.products.slice(0, 8).map((p) => ({
                    label: p.name,
                    value: productSort === "totalRevenue"
                      ? p.totalRevenue
                      : productSort === "quantitySold"
                      ? p.quantitySold
                      : p.price,
                    sublabel:
                      productSort === "totalRevenue"
                        ? `${p.quantitySold} sold`
                        : productSort === "quantitySold"
                        ? formatINR(p.totalRevenue)
                        : `${p.quantitySold} sold`,
                  }))}
                  isCurrency={productSort !== "quantitySold"}
                  height={210}
                />
              ) : (
                <div className="flex items-center justify-center h-40 text-white/30 text-sm">
                  No product sales data for this period
                </div>
              )}
            </Card>

            {/* ── Products Table ── */}
            <Card title="Product Revenue Breakdown" subtitle="Click column header to sort">
              {/* Sort buttons */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(["totalRevenue", "quantitySold", "price"] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setProductSort(k)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      productSort === k
                        ? "text-navy-dark"
                        : "text-white/50 border border-white/10 hover:text-white/80"
                    }`}
                    style={productSort === k ? { background: "#D4AF37" } : {}}
                  >
                    {k === "totalRevenue" ? "Revenue" : k === "quantitySold" ? "Qty Sold" : "Price"}
                  </button>
                ))}
              </div>

              {sortedProducts.length === 0 ? (
                <div className="text-center py-10 text-white/30 text-sm">
                  No product sales data for this period
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["#", "Product Name", "Qty Sold", "Unit Price", "Total Revenue"].map((h) => (
                          <th
                            key={h}
                            className="text-left text-white/40 font-medium py-2.5 px-3 text-xs uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProducts.map((p, i) => (
                        <tr
                          key={p.id}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-3 text-white/30 font-mono text-xs">{i + 1}</td>
                          <td className="py-3 px-3 text-white font-medium max-w-[200px] truncate">
                            {p.name}
                          </td>
                          <td className="py-3 px-3 text-white/70">{p.quantitySold.toLocaleString()}</td>
                          <td className="py-3 px-3 text-white/70">{formatINR(p.price)}</td>
                          <td className="py-3 px-3">
                            <span
                              className="font-semibold px-2 py-0.5 rounded-lg text-xs"
                              style={{ background: "#D4AF3720", color: "#D4AF37" }}
                            >
                              {formatINR(p.totalRevenue)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* ── Customer Growth ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
                title="Customer Growth"
                subtitle={`${data.customers.newCustomers} new customers this period`}
              >
                <LineChartSVG data={data.customers.trend} color="#22C55E" height={180} />
              </Card>

              <Card title="Customer Overview" subtitle="Cumulative stats">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Total Customers",
                      value: data.customers.total.toLocaleString(),
                      color: "#22C55E",
                      icon: "👥",
                    },
                    {
                      label: "New This Period",
                      value: data.customers.newCustomers.toLocaleString(),
                      color: "#F59E0B",
                      icon: "🆕",
                    },
                    {
                      label: "With Orders",
                      value: data.repeatCustomers.totalWithOrders.toLocaleString(),
                      color: "#3B82F6",
                      icon: "🛍️",
                    },
                    {
                      label: "Repeat Rate",
                      value: `${data.repeatCustomers.repeatPercent}%`,
                      color: "#D4AF37",
                      icon: "🔄",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl p-4 border border-white/5"
                      style={{ background: "#07122A" }}
                    >
                      <div className="text-xl mb-1">{item.icon}</div>
                      <div
                        className="text-xl font-bold"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 rounded-xl border border-white/5" style={{ background: "#07122A" }}>
                  <p className="text-xs text-white/40 mb-2">Repeat Customer Breakdown</p>
                  <div className="flex gap-4">
                    <div>
                      <div className="text-lg font-bold text-yellow-400">
                        {data.repeatCustomers.repeatCount}
                      </div>
                      <div className="text-xs text-white/40">Repeat</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-400">
                        {data.repeatCustomers.oneTimeCount}
                      </div>
                      <div className="text-xs text-white/40">One-Time</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-pink-400">
                        {data.repeatCustomers.repeatPercent}%
                      </div>
                      <div className="text-xs text-white/40">Repeat Rate</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Footer */}
            <div className="text-center text-white/20 text-xs py-4 border-t border-white/[0.04]">
              Vardayini Sweet Mart Analytics • Data from MongoDB Atlas • Auto-calculated from real orders
            </div>
          </>
        )}
      </div>
    </div>
  );
}
