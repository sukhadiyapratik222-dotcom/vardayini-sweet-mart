import { Router } from "express";

const router = Router();

// Memory store fallback for demo & offline
const spinHistory = new Map<string, { prize: string; couponCode: string; timestamp: number }>();
const newsletterSubscribers = new Set<string>();

// POST /api/spinwheel/play {phone}
router.post("/spinwheel/play", (req, res) => {
  const { phone } = req.body;
  if (!phone || String(phone).trim().length < 10) {
    return res.status(400).json({ error: "Please enter a valid 10-digit mobile phone number." });
  }

  const cleanPhone = String(phone).replace(/\D/g, "");
  const now = Date.now();
  const lastSpin = spinHistory.get(cleanPhone);

  // Limit one spin per phone per day (24 hours = 86,400,000 ms)
  if (lastSpin && now - lastSpin.timestamp < 86400000) {
    const hoursLeft = Math.ceil((86400000 - (now - lastSpin.timestamp)) / 3600000);
    return res.status(400).json({
      error: `You have already spun the wheel today! Please try again in ${hoursLeft} hours.`,
      couponCode: lastSpin.couponCode,
      prize: lastSpin.prize,
    });
  }

  // Wheel Prizes Segments
  const prizes = [
    { label: "10% OFF", discountPercent: 10, prefix: "SPIN10" },
    { label: "Free Express Shipping", discountPercent: 0, prefix: "FREESHIP" },
    { label: "15% OFF", discountPercent: 15, prefix: "SPIN15" },
    { label: "₹150 Flat Discount", discountPercent: 12, prefix: "FLAT150" },
    { label: "5% OFF Bulk Deal", discountPercent: 5, prefix: "SPIN5" },
    { label: "Free Sweets Pack", discountPercent: 10, prefix: "FREESWEET" },
  ];

  const randomIndex = Math.floor(Math.random() * prizes.length);
  const prizeObj = prizes[randomIndex];
  const couponCode = `${prizeObj.prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  spinHistory.set(cleanPhone, {
    prize: prizeObj.label,
    couponCode,
    timestamp: now,
  });

  res.json({
    success: true,
    message: `🎉 Congratulations! You won ${prizeObj.label}!`,
    prize: prizeObj.label,
    couponCode,
    discountPercent: prizeObj.discountPercent,
    segmentIndex: randomIndex,
  });
});

// POST /api/newsletter/subscribe {email}
router.post("/newsletter/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email || !String(email).includes("@")) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  newsletterSubscribers.add(cleanEmail);

  res.json({
    success: true,
    message: "Thank you for subscribing! Check your inbox for your 10% off welcome code.",
    couponCode: "SWEET10",
  });
});

export default router;
