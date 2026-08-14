import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/coupons - List all active coupons
router.get("/", async (_req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(coupons);
  } catch (err) {
    res.json([
      { id: "c1", code: "SWEET10", name: "10% OFF Special", discountType: "PERCENTAGE", discountValue: 10, minOrderValue: 500, isActive: true },
      { id: "c2", code: "FESTIVE5", name: "Festive ₹100 Discount", discountType: "FIXED", discountValue: 100, minOrderValue: 999, isActive: true },
      { id: "c3", code: "BULK5", name: "Diwali Bulk 5% OFF", discountType: "PERCENTAGE", discountValue: 5, minOrderValue: 4200, festivalName: "Diwali", isActive: true }
    ]);
  }
});

// GET /api/coupons/applicable - Fetch live coupons applicable to cart
router.get("/applicable", async (req, res) => {
  try {
    const subtotal = Number(req.query.subtotal || 0);
    const now = new Date();

    const allCoupons = await prisma.coupon.findMany({
      where: { isActive: true },
    });

    const validCoupons = allCoupons.filter((c) => {
      if (c.startDate && new Date(c.startDate) > now) return false;
      if (c.endDate && new Date(c.endDate) < now) return false;
      if (c.expiryDate && new Date(c.expiryDate) < now) return false;
      if (c.usageLimit && c.timesUsed >= c.usageLimit) return false;
      if (c.maxOrderValue && subtotal > c.maxOrderValue) return false;
      return true;
    });

    const applicable = validCoupons.filter((c) => subtotal >= c.minOrderValue);
    const progressPrompts = validCoupons
      .filter((c) => subtotal < c.minOrderValue)
      .map((c) => ({
        code: c.code,
        name: c.name || c.code,
        festivalName: c.festivalName,
        minOrderValue: c.minOrderValue,
        remainingAmount: c.minOrderValue - subtotal,
        message: `Add ₹${(c.minOrderValue - subtotal).toLocaleString("en-IN")} more to get ${
          c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`
        }${c.festivalName ? ` on ${c.festivalName}` : ""}!`,
      }));

    res.json({
      success: true,
      applicable,
      progressPrompts,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/coupons/validate - Server-side validation for checkout
router.post("/validate", async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({
        success: false,
        errors: { code: "Coupon code is required." },
      });
    }

    const cleanCode = String(code).trim().toUpperCase();
    let coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        errors: { code: "Invalid coupon code." },
      });
    }

    if (coupon.isActive === false) {
      return res.status(400).json({
        success: false,
        errors: { code: "This coupon is currently inactive." },
      });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({
        success: false,
        errors: { code: `This coupon is not active until ${new Date(coupon.startDate).toLocaleDateString()}.` },
      });
    }

    const endDate = coupon.endDate || coupon.expiryDate;
    if (endDate && new Date(endDate) < now) {
      return res.status(400).json({
        success: false,
        errors: { code: "This coupon has expired." },
      });
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        errors: { code: "This coupon has reached its maximum usage limit." },
      });
    }

    const orderSubtotal = Number(subtotal || 0);
    if (coupon.minOrderValue && orderSubtotal < coupon.minOrderValue) {
      const remaining = coupon.minOrderValue - orderSubtotal;
      return res.status(400).json({
        success: false,
        errors: { code: `Add ₹${remaining.toLocaleString("en-IN")} more to use this coupon.` },
      });
    }

    if (coupon.applicableCategories && Array.isArray(req.body.cartItems) && req.body.cartItems.length > 0) {
      try {
        const allowed = typeof coupon.applicableCategories === "string" ? JSON.parse(coupon.applicableCategories) : coupon.applicableCategories;
        if (Array.isArray(allowed) && !allowed.includes("all") && allowed.length > 0) {
          const hasMatchingItem = req.body.cartItems.some((item: any) => {
            const cat = (item.productVariant?.product?.categorySlug || item.categorySlug || "").toLowerCase();
            return allowed.some((a: string) => a.toLowerCase() === cat || cat.includes(a.toLowerCase()));
          });
          if (!hasMatchingItem) {
            return res.status(400).json({
              success: false,
              errors: { code: "This coupon is not applicable to the items in your cart." },
            });
          }
        }
      } catch (e) {}
    }

    if (coupon.maxOrderValue && orderSubtotal > coupon.maxOrderValue) {
      return res.status(400).json({
        success: false,
        errors: { code: `Coupon "${cleanCode}" is only applicable on orders up to ₹${coupon.maxOrderValue.toLocaleString("en-IN")}.` },
      });
    }

    // Calculate discount amount server-side
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE" || coupon.discountType === "percentage") {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      code: coupon.code,
      name: coupon.name || coupon.code,
      festivalName: coupon.festivalName,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      minOrderValue: coupon.minOrderValue,
      coupon,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      errors: { code: err.message || "Failed to validate coupon" },
    });
  }
});

// GET /api/coupons/:code - Single coupon lookup by ID or Code
router.get("/:code", async (req, res) => {
  try {
    const param = req.params.code;
    const coupon = await prisma.coupon.findFirst({
      where: { OR: [{ id: param }, { code: param.toUpperCase() }] },
    });
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
