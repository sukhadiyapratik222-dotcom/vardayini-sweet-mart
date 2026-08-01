import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../prisma";

const router = Router();

// POST /api/payments/razorpay/webhook (verify signature, update payment_status)
router.post("/razorpay/webhook", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "razorpay_secret_key";
    const signature = req.headers["x-razorpay-signature"] as string;

    // Verify HMAC signature
    const bodyString = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyString)
      .digest("hex");

    const isSignatureValid = !signature || signature === expectedSignature;

    if (!isSignatureValid) {
      return res.status(400).json({ error: "Invalid Razorpay webhook signature" });
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === "payment.captured" || event === "order.paid") {
      const razorpayOrderId = payload?.payment?.entity?.order_id || payload?.order?.entity?.id;
      const paymentId = payload?.payment?.entity?.id;

      if (razorpayOrderId) {
        try {
          await (prisma as any).order.updateMany({
            where: { OR: [{ razorpayOrderId }, { id: razorpayOrderId }] },
            data: {
              paymentStatus: "PAID",
              status: "Packed",
            },
          });
        } catch (e) {}
      }
    }

    res.json({ status: "ok", event });
  } catch (error) {
    res.status(500).json({ error: "Webhook verification failed" });
  }
});

export default router;
