import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// Pricing constants (business rules)
const FREE_DELIVERY_THRESHOLD = 1000; // Free delivery above ₹1000
const BULK_DISCOUNT_THRESHOLD = 5000; // 5% discount above ₹5000
const BULK_DISCOUNT_PERCENT = 5; // 5% discount
const DEFAULT_DELIVERY_FEE = 50; // Default delivery fee

// Helper function to calculate cart totals with business rules
async function calculateCartTotals(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          productVariant: { include: { product: true } }
        }
      }
    }
  });

  if (!cart) return null;

  // Calculate subtotal
  let subtotal = 0;
  cart.items.forEach((item) => {
    const price = Number(item.productVariant.discountedPrice || item.productVariant.price);
    subtotal += price * item.quantity;
  });

  // Calculate discounts
  let discountAmount = 0;
  
  // Apply bulk discount (5% above ₹5000)
  if (subtotal >= BULK_DISCOUNT_THRESHOLD) {
    discountAmount = Math.round((subtotal * BULK_DISCOUNT_PERCENT) / 100);
  }

  // Calculate after discount
  const afterDiscount = subtotal - discountAmount;

  // Calculate delivery fee
  const deliveryFee = afterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;

  // Calculate total
  const total = afterDiscount + deliveryFee;

  return {
    subtotal,
    discountAmount,
    discountPercent: subtotal >= BULK_DISCOUNT_THRESHOLD ? BULK_DISCOUNT_PERCENT : 0,
    deliveryFee,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountForFreeDelivery: Math.max(0, FREE_DELIVERY_THRESHOLD - afterDiscount),
    total,
    itemCount: cart.items.length,
    items: cart.items
  };
}

// GET /api/cart - Get current cart with totals
router.get("/", async (req, res) => {
  try {
    const { sessionId, userId } = req.query;

    let cart = null;

    // Find cart by userId or sessionId
    if (userId) {
      cart = await prisma.cart.findFirst({
        where: { userId: String(userId) }
      });
    } else if (sessionId) {
      cart = await prisma.cart.findFirst({
        where: { sessionId: String(sessionId) }
      });
    }

    if (!cart) {
      // Create new cart if doesn't exist
      cart = await prisma.cart.create({
        data: {
          sessionId: sessionId ? String(sessionId) : undefined,
          userId: userId ? String(userId) : undefined
        }
      });
    }

    const cartData = await calculateCartTotals(cart.id);
    res.json(cartData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cart/items - Add item to cart
router.post("/items", async (req, res) => {
  try {
    const { cartId, productVariantId, quantity = 1, sessionId, userId } = req.body;

    if (!productVariantId || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let cart = cartId
      ? await prisma.cart.findUnique({ where: { id: cartId } })
      : null;

    if (!cart) {
      // Find or create cart
      cart = userId
        ? await prisma.cart.findFirst({ where: { userId } })
        : sessionId
        ? await prisma.cart.findFirst({ where: { sessionId } })
        : null;

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            sessionId: sessionId || undefined,
            userId: userId || undefined
          }
        });
      }
    }

    // Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productVariantId }
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Create new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId,
          quantity
        }
      });
    }

    // Return updated cart with totals
    const cartData = await calculateCartTotals(cart.id);
    res.json(cartData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/cart/items/:id - Update item quantity
router.put("/items/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    // Return updated cart with totals
    const cartData = await calculateCartTotals(item.cartId);
    res.json(cartData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cart/items/:id - Remove item from cart
router.delete("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const cartId = item.cartId;

    // Delete item
    await prisma.cartItem.delete({ where: { id } });

    // Return updated cart with totals
    const cartData = await calculateCartTotals(cartId);
    res.json(cartData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cart/apply-coupon - Apply coupon code
router.post("/apply-coupon", async (req, res) => {
  try {
    const { cartId, couponCode, sessionId, userId } = req.body;

    if (!couponCode) {
      return res.status(400).json({ error: "Coupon code required" });
    }

    // Find coupon in database
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Check if coupon is valid
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    // Find cart
    let cart = cartId
      ? await prisma.cart.findUnique({ where: { id: cartId } })
      : userId
      ? await prisma.cart.findFirst({ where: { userId } })
      : sessionId
      ? await prisma.cart.findFirst({ where: { sessionId } })
      : null;

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Get cart totals
    const cartData = await calculateCartTotals(cart.id);
    if (!cartData) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Check minimum order value
    if (coupon.minOrderValue && cartData.subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Minimum order value of ₹${coupon.minOrderValue} required`
      });
    }

    // Calculate coupon discount
    let couponDiscountAmount = 0;
    if (coupon.discountType === "percentage") {
      couponDiscountAmount = Math.round((cartData.subtotal * coupon.discountValue) / 100);
    } else if (coupon.discountType === "fixed") {
      couponDiscountAmount = coupon.discountValue;
    }

    // Return coupon details with updated totals
    res.json({
      ...cartData,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: couponDiscountAmount
      },
      totalDiscount: cartData.discountAmount + couponDiscountAmount,
      finalTotal: cartData.total - couponDiscountAmount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
