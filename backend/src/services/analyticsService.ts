import { prisma } from "../prisma";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SalesAnalytics {
  totalRevenue: number;
  prevRevenue: number;
  changePercent: number;
  avgOrderValue: number;
  trend: { label: string; value: number }[];
}

export interface OrdersAnalytics {
  total: number;
  prevTotal: number;
  changePercent: number;
  completed: number;
  pending: number;
  cancelled: number;
  returned: number;
  trend: { label: string; value: number }[];
  statusBreakdown: { status: string; count: number; color: string }[];
}

export interface ProductAnalytics {
  id: string;
  name: string;
  quantitySold: number;
  price: number;
  totalRevenue: number;
}

export interface CustomerAnalytics {
  total: number;
  prevTotal: number;
  changePercent: number;
  newCustomers: number;
  prevNewCustomers: number;
  newChangePercent: number;
  trend: { label: string; value: number }[];
}

export interface RepeatCustomerAnalytics {
  repeatCount: number;
  oneTimeCount: number;
  totalWithOrders: number;
  repeatPercent: number;
}

export interface FullAnalytics {
  sales: SalesAnalytics;
  orders: OrdersAnalytics;
  products: ProductAnalytics[];
  customers: CustomerAnalytics;
  repeatCustomers: RepeatCustomerAnalytics;
  avgOrderValue: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(cur: number, prev: number): number {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

function isCancelled(status: string | null): boolean {
  const s = (status || "").toLowerCase();
  return s === "cancelled" || s === "canceled";
}

function getGranularity(from: Date, to: Date): "day" | "week" | "month" {
  const days = Math.ceil((to.getTime() - from.getTime()) / 86400000);
  if (days <= 31) return "day";
  if (days <= 90) return "week";
  return "month";
}

function bucketKey(date: Date, g: "day" | "week" | "month"): string {
  if (g === "day") return date.toISOString().slice(0, 10);
  if (g === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  // ISO week
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function buildTrendLabels(from: Date, to: Date, g: "day" | "week" | "month"): string[] {
  const labels: string[] = [];
  const cur = new Date(from);
  if (g === "day") {
    while (cur <= to) {
      labels.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
  } else if (g === "week") {
    while (cur <= to) {
      labels.push(bucketKey(cur, "week"));
      cur.setDate(cur.getDate() + 7);
    }
  } else {
    while (cur <= to) {
      labels.push(bucketKey(cur, "month"));
      cur.setMonth(cur.getMonth() + 1);
    }
  }
  return [...new Set(labels)]; // dedupe
}

function prettyLabel(key: string, g: "day" | "week" | "month"): string {
  if (g === "day") {
    const d = new Date(key);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
  if (g === "month") {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleString("en", { month: "short" });
  }
  return key.replace(/\d{4}-/, ""); // e.g. "W23"
}

function sampleTrend<T extends { label: string }>(arr: T[], max = 12): T[] {
  if (arr.length <= max) return arr;
  const step = Math.ceil(arr.length / max);
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#22C55E",
  delivered: "#22C55E",
  pending: "#F59E0B",
  placed: "#F59E0B",
  processing: "#3B82F6",
  confirmed: "#8B5CF6",
  cancelled: "#EF4444",
  canceled: "#EF4444",
  returned: "#EC4899",
  refunded: "#EC4899",
};

// ─── Main Analytics Function ─────────────────────────────────────────────────

export async function getAllAnalytics(
  from: Date,
  to: Date,
  prevFrom: Date,
  prevTo: Date
): Promise<FullAnalytics> {
  const g = getGranularity(from, to);

  // ── Parallel DB fetches ──
  const [
    currentOrders,
    prevOrders,
    currentUsers,
    prevUsers,
    totalUserCount,
    usersWithOrdersInPeriod,
  ] = await Promise.all([
    // All orders in current period (with items + products)
    prisma.order.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: {
        id: true,
        total: true,
        subtotal: true,
        status: true,
        createdAt: true,
        userId: true,
        items: {
          select: {
            id: true,
            quantity: true,
            priceAtPurchase: true,
            productVariant: {
              select: {
                price: true,
                product: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    }),

    // Previous period — minimal fields
    prisma.order.findMany({
      where: { createdAt: { gte: prevFrom, lte: prevTo } },
      select: { total: true, subtotal: true, status: true, userId: true },
    }),

    // New customers in current period
    prisma.user.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { id: true, createdAt: true },
    }),

    // New customers in previous period
    prisma.user.findMany({
      where: { createdAt: { gte: prevFrom, lte: prevTo } },
      select: { id: true },
    }),

    // Total customer count (all time)
    prisma.user.count(),

    // Users with orders in period (for repeat customer calc)
    prisma.user.findMany({
      select: {
        id: true,
        orders: {
          where: { createdAt: { gte: from, lte: to } },
          select: { id: true },
        },
      },
    }),
  ]);

  // Customers before current period (for % change)
  const prevTotalUserCount = await prisma.user.count({
    where: { createdAt: { lt: from } },
  });

  // ── SALES ─────────────────────────────────────────────────────────────────
  const nonCancelledCurrent = currentOrders.filter((o) => !isCancelled(o.status));
  const nonCancelledPrev = prevOrders.filter((o) => !isCancelled(o.status));

  const totalRevenue = nonCancelledCurrent.reduce(
    (s, o) => s + Number(o.total || o.subtotal || 0),
    0
  );
  const prevRevenue = nonCancelledPrev.reduce(
    (s, o) => s + Number(o.total || o.subtotal || 0),
    0
  );
  const avgOrderValue =
    nonCancelledCurrent.length > 0 ? totalRevenue / nonCancelledCurrent.length : 0;

  // Sales trend
  const salesBucket: Record<string, number> = {};
  nonCancelledCurrent.forEach((o) => {
    const k = bucketKey(new Date(o.createdAt), g);
    salesBucket[k] = (salesBucket[k] || 0) + Number(o.total || o.subtotal || 0);
  });

  // ── ORDERS ─────────────────────────────────────────────────────────────────
  const statusMap: Record<string, number> = {};
  currentOrders.forEach((o) => {
    const s = (o.status || "placed").toLowerCase();
    statusMap[s] = (statusMap[s] || 0) + 1;
  });

  const ordersBucket: Record<string, number> = {};
  currentOrders.forEach((o) => {
    const k = bucketKey(new Date(o.createdAt), g);
    ordersBucket[k] = (ordersBucket[k] || 0) + 1;
  });

  const statusBreakdown = Object.entries(statusMap)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: STATUS_COLORS[status] || "#6B7280",
    }));

  // ── PRODUCTS ───────────────────────────────────────────────────────────────
  const productMap: Record<
    string,
    { name: string; qty: number; price: number; revenue: number }
  > = {};

  nonCancelledCurrent.forEach((o) => {
    o.items.forEach((item) => {
      const prod = item.productVariant?.product;
      if (!prod) return;
      const key = prod.id;
      const revenue = Number(item.priceAtPurchase) * item.quantity;
      if (!productMap[key]) {
        productMap[key] = {
          name: prod.name,
          qty: 0,
          price: Number(item.productVariant?.price || 0),
          revenue: 0,
        };
      }
      productMap[key].qty += item.quantity;
      productMap[key].revenue += revenue;
    });
  });

  const topProducts: ProductAnalytics[] = Object.entries(productMap)
    .map(([id, p]) => ({
      id,
      name: p.name,
      quantitySold: p.qty,
      price: Math.round(p.price * 100) / 100,
      totalRevenue: Math.round(p.revenue * 100) / 100,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  // ── CUSTOMERS ──────────────────────────────────────────────────────────────
  const custBucket: Record<string, number> = {};
  currentUsers.forEach((u) => {
    const k = bucketKey(new Date(u.createdAt), g);
    custBucket[k] = (custBucket[k] || 0) + 1;
  });

  // ── REPEAT CUSTOMERS ───────────────────────────────────────────────────────
  const withOrders = usersWithOrdersInPeriod.filter((u) => u.orders.length > 0);
  const repeatUsers = withOrders.filter((u) => u.orders.length > 1);
  const oneTimeUsers = withOrders.filter((u) => u.orders.length === 1);
  const repeatPercent =
    withOrders.length > 0
      ? Math.round((repeatUsers.length / withOrders.length) * 1000) / 10
      : 0;

  // ── BUILD TREND ARRAYS ─────────────────────────────────────────────────────
  const allLabels = buildTrendLabels(from, to, g);
  const sampled = sampleTrend(
    allLabels.map((k) => ({ key: k, label: prettyLabel(k, g) }))
  );

  const salesTrend = sampled.map(({ key, label }) => ({
    label,
    value: Math.round((salesBucket[key] || 0) * 100) / 100,
  }));
  const ordersTrend = sampled.map(({ key, label }) => ({
    label,
    value: ordersBucket[key] || 0,
  }));
  const customerTrend = sampled.map(({ key, label }) => ({
    label,
    value: custBucket[key] || 0,
  }));

  return {
    sales: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      prevRevenue: Math.round(prevRevenue * 100) / 100,
      changePercent: pct(totalRevenue, prevRevenue),
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      trend: salesTrend,
    },
    orders: {
      total: currentOrders.length,
      prevTotal: prevOrders.length,
      changePercent: pct(currentOrders.length, prevOrders.length),
      completed:
        (statusMap["completed"] || 0) + (statusMap["delivered"] || 0),
      pending:
        (statusMap["pending"] || 0) +
        (statusMap["placed"] || 0) +
        (statusMap["processing"] || 0) +
        (statusMap["confirmed"] || 0),
      cancelled:
        (statusMap["cancelled"] || 0) + (statusMap["canceled"] || 0),
      returned:
        (statusMap["returned"] || 0) + (statusMap["refunded"] || 0),
      trend: ordersTrend,
      statusBreakdown,
    },
    products: topProducts,
    customers: {
      total: totalUserCount,
      prevTotal: prevTotalUserCount,
      changePercent: pct(totalUserCount, prevTotalUserCount),
      newCustomers: currentUsers.length,
      prevNewCustomers: prevUsers.length,
      newChangePercent: pct(currentUsers.length, prevUsers.length),
      trend: customerTrend,
    },
    repeatCustomers: {
      repeatCount: repeatUsers.length,
      oneTimeCount: oneTimeUsers.length,
      totalWithOrders: withOrders.length,
      repeatPercent,
    },
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
  };
}
