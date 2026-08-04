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

// POST /api/orders (Creates real order in database)
router.post("/", async (req, res) => {
  let userId = getOptionalUserId(req);
  const { fullName, email, phone, address, deliveryDate, timeSlot, paymentMethod, items, total, subtotal } = req.body;

  try {
    // If guest user or no userId provided, find/create user record in database
    if (!userId) {
      const userEmail = email ? String(email).trim() : phone ? `${String(phone).trim()}@customer.local` : `guest_${Date.now()}@customer.local`;
      const userName = fullName ? String(fullName).trim() : "Valued Customer";
      const cleanPhone = phone ? String(phone).trim() : null;

      let existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userEmail },
            ...(cleanPhone ? [{ phone: cleanPhone }] : []),
          ],
        },
      });

      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            name: userName,
            email: userEmail,
            phone: cleanPhone,
            passwordHash: "guest_checkout",
            role: "customer",
          },
        });
      }
      userId = existingUser.id;
    }

    const orderId = req.body.orderId || `VSM-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalTotal = Number(total || subtotal || 0);
    const finalSubtotal = Number(subtotal || total || 0);

    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber: orderId,
        subtotal: finalSubtotal,
        discount: 0,
        deliveryFee: 0,
        total: finalTotal,
        status: "Placed",
        paymentStatus: paymentMethod === "COD" ? "PAID" : "PAID",
      },
    });

    res.status(201).json({
      success: true,
      message: "Real order stored in database successfully",
      order: {
        ...order,
        orderId: order.orderNumber,
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
    res.status(500).json({ error: error.message || "Failed to save order to database." });
  }
});

// GET /api/orders (user's order list from database)
router.get("/", async (req, res) => {
  const userId = getOptionalUserId(req);
  if (!userId) return res.json([]);

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.json([]);
  }
});

// GET /api/orders/:id (get order by ID or orderNumber)
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found in database." });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Database error fetching order." });
  }
});

export default router;
