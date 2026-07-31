import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, async (req, res) => {
  const { items, address, paymentMethod, couponCode } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!items?.length) return res.status(400).json({ error: "Order must contain items." });

  const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const discount = 0;
  const deliveryFee = 0;
  const total = subtotal - discount + deliveryFee;
  const orderNumber = `PNM-${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber,
      subtotal,
      discount,
      deliveryFee,
      total,
      paymentStatus: "pending",
      items: {
        create: items.map((item: any) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        }))
      },
      address: {
        create: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode
        }
      }
    },
    include: { items: true, address: true }
  });

  res.json(order);
});

router.get("/", authenticate, async (req, res) => {
  const userId = req.userId;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true, address: true }
  });
  res.json(orders);
});

router.get("/:orderNumber", authenticate, async (req, res) => {
  const orderNumber = String(req.params.orderNumber);
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { productVariant: true } }, address: true, payment: true }
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

export default router;
