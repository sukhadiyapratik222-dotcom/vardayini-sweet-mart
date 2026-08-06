import { prisma } from "../prisma";

export interface UnifiedDashboardStats {
  productCount: number;
  activeProductCount: number;
  categoryCount: number;
  orderCount: number;
  customerCount: number;
  storeCount: number;
  couponCount: number;
  totalRevenue: number;
  featuredCount: number;
  lowStockCount: number;
  lowStockItems: Array<{
    id: string | number;
    productName: string;
    weightLabel: string;
    stockQty: number;
  }>;
  recentOrders: any[];
}

export async function getUnifiedDashboardStats(): Promise<UnifiedDashboardStats> {
  const [
    totalProducts,
    activeProducts,
    categoryCount,
    orderCount,
    customerCount,
    storeCount,
    couponCount,
    lowStockVariants,
    highRatedCount,
    nonCancelledOrders,
    recentOrdersList
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.store.count(),
    prisma.coupon.count(),
    prisma.productVariant.findMany({
      where: { stockQty: { lte: 5 } },
      include: { product: true },
      take: 20
    }),
    prisma.product.count({ where: { ratingAvg: { gte: 4.5 } } }),
    prisma.order.findMany({
      where: { status: { not: "Cancelled" } },
      select: { total: true, subtotal: true }
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: true, items: true, address: true }
    })
  ]);

  const totalRevenue = nonCancelledOrders.reduce(
    (sum, o) => sum + Number(o.total || o.subtotal || 0),
    0
  );

  const formattedRecentOrders = recentOrdersList.map((o) => {
    const ordId = o.orderNumber || o.id;
    return {
      id: o.id,
      orderId: ordId,
      orderNumber: ordId,
      date: o.createdAt.toISOString(),
      createdAt: o.createdAt.toISOString(),
      status: o.status || "Placed",
      fullName: o.user?.name || "Valued Customer",
      email: o.user?.email || "customer@example.com",
      phone: o.user?.phone || "+91 98765 43210",
      address: o.address ? `${o.address.line1}, ${o.address.city}, ${o.address.state} ${o.address.pincode}` : "Surat, Gujarat",
      total: Number(o.total || o.subtotal || 0),
    };
  });

  return {
    productCount: totalProducts,
    activeProductCount: activeProducts,
    categoryCount,
    orderCount,
    customerCount: customerCount > 0 ? customerCount : await prisma.user.count(),
    storeCount,
    couponCount,
    totalRevenue,
    featuredCount: highRatedCount,
    lowStockCount: lowStockVariants.length,
    lowStockItems: lowStockVariants.map((v) => ({
      id: v.id,
      productName: v.product?.name || "Product",
      weightLabel: v.weightLabel,
      stockQty: v.stockQty,
    })),
    recentOrders: formattedRecentOrders,
  };
}
