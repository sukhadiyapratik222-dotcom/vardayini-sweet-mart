import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true } } }
    });
    res.json(reviews);
  } catch (err) {
    res.json([]);
  }
});

router.post("/", authenticate, async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const review = await prisma.review.create({
    data: { productId, userId, rating, comment }
  });
  res.json(review);
});

router.get("/product/:productId", async (req, res) => {
  const productId = req.params.productId;

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { id: true, name: true } } }
  });
  res.json(reviews);
});

export default router;
