import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/:code", async (req, res) => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: req.params.code }
  });
  if (!coupon) return res.status(404).json({ error: "Coupon not found" });

  const now = new Date();
  if (coupon.expiryDate && coupon.expiryDate < now) {
    return res.status(400).json({ error: "Coupon expired" });
  }
  res.json(coupon);
});

export default router;
