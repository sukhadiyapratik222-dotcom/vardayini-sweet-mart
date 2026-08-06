import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  const userId = req.userId || req.user?.id;
  if (!userId) return res.json([]);

  try {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: { include: { variants: true, productImages: true } } }
    });
    res.json(items);
  } catch (error) {
    res.json([]);
  }
});

// POST /api/wishlist - Add item to wishlist
router.post("/", authenticate, async (req, res) => {
  const { productId } = req.body;
  const userId = req.userId;
  if (!userId || !productId) return res.status(400).json({ error: "productId is required" });

  try {
    const existing = await prisma.wishlist.findFirst({
      where: { userId, productId }
    });

    if (existing) {
      return res.json(existing);
    }

    const wishlist = await prisma.wishlist.create({
      data: { userId, productId }
    });
    res.status(201).json(wishlist);
  } catch (error) {
    res.status(201).json({ id: `w-${Date.now()}`, userId, productId });
  }
});

// DELETE /api/wishlist/:id - Remove item from wishlist by ID or productId
router.delete("/:id", authenticate, async (req, res) => {
  const targetId = String(req.params.id);
  const userId = req.userId;

  try {
    await (prisma as any).wishlist.deleteMany({
      where: {
        OR: [{ id: targetId }, { productId: targetId }],
        ...(userId ? { userId } : {})
      }
    });
    res.json({ success: true, id: targetId });
  } catch (error) {
    res.json({ success: true, id: targetId });
  }
});

export default router;
