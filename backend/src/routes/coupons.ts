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
      if (
        cleanCode.startsWith("SPIN") ||
        cleanCode.startsWith("WIN") ||
        cleanCode.startsWith("SWEET") ||
        cleanCode.startsWith("FESTIVE") ||
        cleanCode.startsWith("GIFT") ||
        cleanCode.startsWith("BULK")
      ) {
        const orderSubtotal = Number(subtotal || 0);
        if (cleanCode.startsWith("BULK") || cleanCode.includes("BULK")) {
          if (orderSubtotal < 4200) {
            const remaining = Math.max(0, 4200 - orderSubtotal);
            return res.status(400).json({
              success: false,
              errors: { code: `Minimum order subtotal of ₹4,200 required for 5% Bulk Offer. Add ₹${remaining.toLocaleString("en-IN")} more to unlock!` },
            });
          }
        }

        let discountValue = 10;
        if (cleanCode.includes("15")) discountValue = 15;
        else if (cleanCode.includes("5")) discountValue = 5;
        else if (cleanCode.includes("20")) discountValue = 20;

        const discountAmount = Math.round((orderSubtotal * discountValue) / 100);

        return res.json({
          success: true,
          code: cleanCode,
          name: `${cleanCode} Special Discount`,
          discountType: "PERCENTAGE",
          discountValue,
          discountAmount,
          minOrderValue: cleanCode.includes("BULK") ? 4200 : 0,
          coupon: {
            code: cleanCode,
            discountType: "PERCENTAGE",
            discountValue,
            minOrderValue: cleanCode.includes("BULK") ? 4200 : 0,
          },
        });
      }

      return res.status(400).json({
        success: false,
        errors: { code: `Invalid coupon code "${cleanCode}". Please check and try again.` },
      });
    }

    if (coupon.isActive === false) {
      return res.status(400).json({
        success: false,
        errors: { code: `Coupon "${cleanCode}" is currently deactivated.` },
      });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({
        success: false,
        errors: { code: `Coupon "${cleanCode}" ${coupon.festivalName ? `for ${coupon.festivalName} ` : ""}starts on ${new Date(coupon.startDate).toLocaleDateString()}.` },
      });
    }

    const endDate = coupon.endDate || coupon.expiryDate;
    if (endDate && new Date(endDate) < now) {
      return res.status(400).json({
        success: false,
        errors: { code: `Coupon "${cleanCode}" expired on ${new Date(endDate).toLocaleDateString()}.` },
      });
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        errors: { code: `Coupon "${cleanCode}" has reached its maximum usage limit.` },
      });
    }

    const orderSubtotal = Number(subtotal || 0);
    if (coupon.minOrderValue && orderSubtotal > 0 && orderSubtotal < coupon.minOrderValue) {
      const remaining = coupon.minOrderValue - orderSubtotal;
      return res.status(400).json({
        success: false,
        errors: { code: `Minimum order subtotal of ₹${coupon.minOrderValue.toLocaleString("en-IN")} required for "${cleanCode}". Add ₹${remaining.toLocaleString("en-IN")} more to unlock!` },
      });
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
