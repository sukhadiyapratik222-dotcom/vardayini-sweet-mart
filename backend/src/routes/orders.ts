import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = Router();
const secret = process.env.JWT_SECRET || "supersecretkey";

function getOptionalUserId(req: any): string | null {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret) as { userId: string };
    return payload.userId || null;
  } catch (e) {
    return null;
  }
}

// POST /api/orders (Creates real order in database with transaction safety)
router.post("/", async (req, res) => {
  let userId = getOptionalUserId(req);
  const { fullName, email, phone, address, deliveryDate, timeSlot, paymentMethod, items, couponCode } = req.body;

  const rawItems = (items && Array.isArray(items) && items.length > 0) 
    ? items 
    : [];

  if (rawItems.length === 0) {
    return res.status(400).json({ success: false, errors: { items: "Cart is empty. Please add items before checking out." } });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // If guest user or no userId provided, find/create user record in database
      let targetUserId = userId;
      if (!targetUserId) {
        const userEmail = email ? String(email).trim() : phone ? `${String(phone).trim()}@customer.local` : `guest_${Date.now()}@customer.local`;
        const userName = fullName ? String(fullName).trim() : "Valued Customer";
        const cleanPhone = phone ? String(phone).trim() : null;

        let existingUser = await tx.user.findFirst({
          where: {
            OR: [
              { email: userEmail },
              ...(cleanPhone ? [{ phone: cleanPhone }] : []),
            ],
          },
        });

        if (!existingUser) {
          existingUser = await tx.user.create({
            data: {
              name: userName,
              email: userEmail,
              phone: cleanPhone,
              passwordHash: "guest_checkout",
              role: "customer",
            },
          });
        }
        targetUserId = existingUser.id;
      }

      const orderId = req.body.orderId || `VSM-${Math.floor(100000 + Math.random() * 900000)}`;

      let calculatedSubtotal = 0;
      const processedItems = [];

      for (const item of rawItems) {
        let variant = null;
        let product = null;
        const vId = String(item.productVariantId || item.variantId || item.variant_id || "");
        if (vId) {
          variant = await tx.productVariant.findUnique({
            where: { id: vId },
            include: { product: true }
          });
        }
        if (!variant && item.productId) {
          const pId = String(item.productId);
          variant = await tx.productVariant.findFirst({
            where: { productId: pId },
            include: { product: true }
          });
        }
        if (!variant && item.name) {
          const matchedProd = await tx.product.findFirst({
            where: { name: { contains: String(item.name).split(' ')[0] } },
            include: { variants: true }
          });
          if (matchedProd && matchedProd.variants?.length > 0) {
            variant = matchedProd.variants[0];
            product = matchedProd;
          }
        }

        if (variant && !product) {
          product = await tx.product.findUnique({ where: { id: variant.productId } });
        }

        if (product && product.isActive === false) {
          throw new Error(`Product "${product.name}" is no longer available for purchase.`);
        }

        const qty = Math.max(1, Number(item.quantity || item.qty || 1));
        if (variant) {
          if (variant.stockQty < qty) {
            throw new Error(`Only ${variant.stockQty} items are available for "${product?.name || 'this item'}".`);
          }
        }

        const unitPrice = variant ? Number(variant.discountedPrice || variant.price) : Number(item.price || 250);
        calculatedSubtotal += unitPrice * qty;

        if (variant) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stockQty: Math.max(0, variant.stockQty - qty) },
          });
        }

        processedItems.push({
          productVariantId: variant ? variant.id : null,
          quantity: qty,
          priceAtPurchase: unitPrice,
        });
      }

      // Calculate coupon discount server-side
      let couponDiscount = 0;
      const cleanCoupon = couponCode ? String(couponCode).trim().toUpperCase() : null;
      if (cleanCoupon) {
        const dbCoupon = await tx.coupon.findUnique({ where: { code: cleanCoupon } });
        if (dbCoupon && dbCoupon.isActive !== false) {
          const minVal = dbCoupon.minOrderValue ?? 0;
          if (calculatedSubtotal >= minVal) {
            if (dbCoupon.discountType === "FIXED") {
              couponDiscount = dbCoupon.discountValue;
            } else {
              couponDiscount = Math.round((calculatedSubtotal * dbCoupon.discountValue) / 100);
            }
          }
        }
      }

      // Calculate bulk discount (5% if subtotal >= 4200)
      let bulkDiscount = 0;
      if (calculatedSubtotal >= 4200 && (!cleanCoupon || !cleanCoupon.includes("BULK"))) {
        bulkDiscount = Math.round((calculatedSubtotal * 5) / 100);
      }

      const totalDiscount = Math.min(calculatedSubtotal, couponDiscount + bulkDiscount);
      const deliveryFee = calculatedSubtotal >= 1000 || calculatedSubtotal === 0 ? 0 : 100;
      const finalTotal = Math.max(0, calculatedSubtotal - totalDiscount + deliveryFee);

      const order = await tx.order.create({
        data: {
          userId: targetUserId!,
          orderNumber: orderId,
          subtotal: calculatedSubtotal,
          discount: totalDiscount,
          deliveryFee,
          total: finalTotal,
          status: "Placed",
          paymentStatus: paymentMethod === "COD" ? "PAID" : "PAID",
          items: {
            create: processedItems.filter(i => i.productVariantId !== null).map(i => ({
              productVariantId: i.productVariantId!,
              quantity: i.quantity,
              priceAtPurchase: i.priceAtPurchase
            }))
          }
        },
      });

      return order;
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: {
        ...result,
        orderId: result.orderNumber,
        fullName: fullName || "Customer",
        phone: phone || "",
        email: email || "",
        address: typeof address === "string" ? address : JSON.stringify(address || {}),
        deliveryDate: deliveryDate || "Tomorrow",
        timeSlot: timeSlot || "Morning Slot",
        paymentMethod: paymentMethod || "UPI",
        items: items || [],
      },
    });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    res.status(400).json({ success: false, errors: { server: error.message || "Failed to place order." } });
  }
});

// GET /api/orders (user's order list or all orders from database)
router.get("/", async (req, res) => {
  const userId = getOptionalUserId(req);

  try {
    const orders = await prisma.order.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: {
          include: {
            productVariant: {
              include: { product: true }
            }
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    res.json([]);
  }
});

// GET /api/orders/:id (get order by ID or orderNumber, with authorization)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = getOptionalUserId(req);
  const isValidObjectId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: isValidObjectId(id) ? [{ id }, { orderNumber: id }] : [{ orderNumber: id }],
        ...(userId ? { userId } : {}),
      },
      include: {
        user: true,
        items: {
          include: {
            productVariant: {
              include: { product: true }
            }
          }
        }
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found in database or unauthorized access." });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Database error fetching order." });
  }
});

export default router;
