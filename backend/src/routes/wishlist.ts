import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, async (req, res) => {
  const { productId } = req.body;
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const wishlist = await prisma.wishlist.create({
    data: { userId, productId }
  });
  res.json(wishlist);
});

router.get("/", authenticate, async (req, res) => {
  const userId = req.userId;
  const items = await prisma.wishlist.findMany({
    where: { userId },
    include: { product: true }
  });
  res.json(items);
});

router.delete("/:id", authenticate, async (req, res) => {
  await prisma.wishlist.delete({ where: { id: String(req.params.id) } });
  res.json({ success: true });
});

export default router;
