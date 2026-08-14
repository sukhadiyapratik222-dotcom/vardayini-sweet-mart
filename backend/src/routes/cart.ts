import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// Pricing constants (Business Rules Engine)
const FREE_DELIVERY_THRESHOLD = 1000; // Free delivery above ₹1000
const BULK_DISCOUNT_THRESHOLD = 5000; // 5% extra discount above ₹5000
const BULK_DISCOUNT_PERCENT = 5;      // 5% discount
const DEFAULT_DELIVERY_FEE = 100;     // Delivery fee below ₹1000

// Helper function to calculate cart totals with business rules
async function calculateCartTotals(cartId: string, appliedCouponCode?: string) {
  let cart = null;
  try {
    cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            productVariant: { include: { product: true } }
          }
        }
      }
    });
  } catch (e) {}

  if (!cart) {
    return {
      subtotal: 0,
      bulkDiscountAmount: 0,
      couponDiscountAmount: 0,
      discountAmount: 0,
      discountPercent: 0,
      deliveryFee: 0,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
      amountForFreeDelivery: FREE_DELIVERY_THRESHOLD,
      total: 0,
      itemCount: 0,
      items: []
    };
  }

  // 1. Calculate Subtotal
  let subtotal = 0;
  cart.items.forEach((item) => {
    const price = Number(item.productVariant?.discountedPrice || item.productVariant?.price || 250);
    subtotal += price * item.quantity;
  });

  // 2. Business Rule: Bulk Order Discount (5% extra discount above ₹5000)
  let bulkDiscountAmount = 0;
  if (subtotal >= BULK_DISCOUNT_THRESHOLD) {
    bulkDiscountAmount = Math.round((subtotal * BULK_DISCOUNT_PERCENT) / 100);
  }

  // 3. Coupon Discount Calculation
  let couponDiscountAmount = 0;
  const code = (appliedCouponCode || "").toUpperCase();
  if (code) {
    try {
      const dbCoupon = await prisma.coupon.findUnique({ where: { code } });
      if (dbCoupon && dbCoupon.isActive !== false) {
        const minVal = dbCoupon.minOrderValue ?? 0;
        const maxVal = dbCoupon.maxOrderValue ?? Infinity;
        if (subtotal >= minVal && (maxVal === 0 || subtotal <= maxVal)) {
          if (dbCoupon.discountType === "FIXED") {
            couponDiscountAmount = dbCoupon.discountValue;
          } else {
            couponDiscountAmount = Math.round((subtotal * dbCoupon.discountValue) / 100);
          }
        }
      } else {
        let fallbackPct = 0;
        let fallbackMin = 0;
        if (code === "SWEET10") { fallbackPct = 10; fallbackMin = 500; }
        else if (code === "FESTIVE5") { fallbackPct = 5; fallbackMin = 500; }
        else if (code === "GIFT15") { fallbackPct = 15; fallbackMin = 1000; }

        if (subtotal >= fallbackMin && fallbackPct > 0) {
          couponDiscountAmount = Math.round((subtotal * fallbackPct) / 100);
        }
      }
    } catch (e) {}
  }

  const totalDiscount = bulkDiscountAmount + couponDiscountAmount;
  const afterDiscount = Math.max(0, subtotal - totalDiscount);

  // 4. Business Rule: Free delivery above ₹1000
  const deliveryFee = afterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  const amountForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - afterDiscount);

  // 5. Final Total
  const total = afterDiscount + deliveryFee;

  return {
    cartId: cart.id,
    subtotal,
    bulkDiscountAmount,
    couponDiscountAmount,
    discountAmount: totalDiscount,
    appliedCoupon: code || null,
    deliveryFee,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountForFreeDelivery,
    total,
    itemCount: cart.items.length,
    items: cart.items.map(item => ({
      ...item,
      stockQty: item.productVariant?.stockQty ?? 50,
      maxStock: item.productVariant?.stockQty ?? 50
    }))
  };
}

// GET /api/cart - Get current cart with business rules totals
router.get("/", async (req, res) => {
  try {
    const { sessionId, userId, cartId } = req.query;
    let cart = null;

    if (cartId) {
      cart = await prisma.cart.findUnique({ where: { id: String(cartId) } });
    } else if (userId) {
      cart = await prisma.cart.findFirst({ where: { userId: String(userId) } });
    } else if (sessionId) {
      cart = await prisma.cart.findFirst({ where: { sessionId: String(sessionId) } });
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          sessionId: sessionId ? String(sessionId) : `sess_${Date.now()}`,
          userId: userId ? String(userId) : undefined
        }
      });
    }

    const cartData = await calculateCartTotals(cart.id);
    res.json(cartData);
  } catch (error: any) {
    res.json({
      subtotal: 0,
      bulkDiscountAmount: 0,
      couponDiscountAmount: 0,
      discountAmount: 0,
      deliveryFee: DEFAULT_DELIVERY_FEE,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
      amountForFreeDelivery: FREE_DELIVERY_THRESHOLD,
      total: DEFAULT_DELIVERY_FEE,
      itemCount: 0,
      items: []
    });
  }
});

// POST /api/cart/add OR /api/cart/items - Add item to cart
const handleAddToCart = async (req: any, res: any) => {
  try {
    const { variant_id, variantId: variantIdBody, productVariantId, qty, quantity = 1, cartId, sessionId, userId } = req.body;
    const targetVariantId = variant_id || variantIdBody || productVariantId;
    const targetQty = Math.max(1, Number(qty || quantity));

    if (!targetVariantId) {
      return res.status(400).json({ error: "variant_id is required." });
    }

    const variantId = String(targetVariantId);
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });

    const maxStock = variant ? Math.max(1, variant.stockQty) : 50;

    let cart = cartId
      ? await prisma.cart.findUnique({ where: { id: cartId } })
      : userId
      ? await prisma.cart.findFirst({ where: { userId } })
      : sessionId
      ? await prisma.cart.findFirst({ where: { sessionId } })
      : null;

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          sessionId: sessionId || `sess_${Date.now()}`,
          userId: userId || undefined
        }
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productVariantId: variantId }
    });

    if (existingItem) {
      if (existingItem.quantity >= maxStock) {
        return res.status(400).json({ error: `Cannot add more. Max stock limit (${maxStock}) reached for this item.` });
      }
      const nextQty = Math.min(maxStock, existingItem.quantity + targetQty);
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQty }
      });
    } else {
      const nextQty = Math.min(maxStock, targetQty);
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId: variantId,
          quantity: nextQty
        }
      });
    }

    const cartData = await calculateCartTotals(cart.id);
    res.json(cartData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add item to cart" });
  }
};

router.post("/add", handleAddToCart);
router.post("/items", handleAddToCart);

// PUT /api/cart/update OR /api/cart/items/:id - Update item quantity
const handleUpdateQuantity = async (req: any, res: any) => {
  try {
    const { item_id, itemId, qty, quantity } = req.body;
    const targetItemId = item_id || itemId || req.params.id;
    const targetQty = Number(qty !== undefined ? qty : quantity);

    if (!targetItemId || targetQty === undefined || targetQty < 1) {
      return res.status(400).json({ error: "item_id and valid qty are required." });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: targetItemId },
      include: { productVariant: true }
    });
    if (!item) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    const maxStock = item.productVariant ? Math.max(1, item.productVariant.stockQty) : 50;

    if (targetQty > maxStock) {
      return res.status(400).json({ error: `Only ${maxStock} items available in stock. Max stock reached.` });
    }

    await prisma.cartItem.update({
      where: { id: targetItemId },
      data: { quantity: Math.min(maxStock, Math.max(1, targetQty)) }
    });

    const cartData = await calculateCartTotals(item.cartId);
    res.json(cartData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update item quantity" });
  }
};

router.put("/update", handleUpdateQuantity);
router.put("/items/:id", handleUpdateQuantity);

// DELETE /api/cart/remove/:item_id OR /api/cart/items/:id - Remove item from cart
const handleRemoveItem = async (req: any, res: any) => {
  try {
    const targetItemId = req.params.item_id || req.params.id;

    const item = await prisma.cartItem.findUnique({ where: { id: targetItemId } });
    if (!item) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    const cartId = item.cartId;
    await prisma.cartItem.delete({ where: { id: targetItemId } });

    const cartData = await calculateCartTotals(cartId);
    res.json(cartData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to remove item" });
  }
};

router.delete("/remove/:item_id", handleRemoveItem);
router.delete("/items/:id", handleRemoveItem);

// POST /api/cart/apply-coupon {code} - Apply coupon code with business rules
router.post("/apply-coupon", async (req, res) => {
  try {
    const { code, couponCode, cartId, sessionId, userId } = req.body;
    const targetCode = (code || couponCode || "").trim().toUpperCase();

    if (!targetCode) {
      return res.status(400).json({ error: "Coupon code is required." });
    }

    let dbCoupon = await prisma.coupon.findUnique({ where: { code: targetCode } });

    if (!dbCoupon && (
      targetCode.startsWith("SPIN") ||
      targetCode.startsWith("WIN") ||
      targetCode.startsWith("SWEET") ||
      targetCode.startsWith("FESTIVE") ||
      targetCode.startsWith("GIFT") ||
      targetCode.startsWith("BULK")
    )) {
      let discountVal = 10;
      if (targetCode.includes("15")) discountVal = 15;
      else if (targetCode.includes("5")) discountVal = 5;
      else if (targetCode.includes("20")) discountVal = 20;

      try {
        dbCoupon = await prisma.coupon.upsert({
          where: { code: targetCode },
          create: {
            name: `Spin & Win Reward (${targetCode})`,
            code: targetCode,
            discountType: "PERCENTAGE",
            discountValue: discountVal,
            minOrderValue: targetCode.includes("BULK") ? 4200 : 0,
            usageLimit: 1,
            maxUsesPerUser: 1,
            isActive: true,
          },
          update: { isActive: true },
        });
      } catch (e) {}
    }

    if (!dbCoupon && !["SWEET10", "FESTIVE5", "GIFT15", "BULK5"].includes(targetCode) && !targetCode.startsWith("SPIN")) {
      return res.status(400).json({ error: `Invalid coupon code "${targetCode}". Please try again.` });
    }

    let cart = cartId
      ? await prisma.cart.findUnique({ where: { id: cartId } })
      : userId
      ? await prisma.cart.findFirst({ where: { userId } })
      : sessionId
      ? await prisma.cart.findFirst({ where: { sessionId } })
      : null;

    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    const currentTotals = await calculateCartTotals(cart.id);
    if (dbCoupon && dbCoupon.minOrderValue && currentTotals.subtotal < dbCoupon.minOrderValue) {
      const remaining = dbCoupon.minOrderValue - currentTotals.subtotal;
      return res.status(400).json({
        error: `Minimum order subtotal of ₹${dbCoupon.minOrderValue.toLocaleString("en-IN")} required for coupon "${targetCode}". Add ₹${remaining.toLocaleString("en-IN")} more to unlock!`
      });
    }

    const cartData = await calculateCartTotals(cart.id, targetCode);
    res.json({
      success: true,
      message: `Coupon ${targetCode} successfully applied!`,
      ...cartData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to apply coupon" });
  }
});

export default router;
