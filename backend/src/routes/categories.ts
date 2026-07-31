import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true }
  });
  res.json(categories);
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true, products: { include: { variants: true } } }
  });
  if (!category) return res.status(404).json({ error: "Category not found" });
  res.json(category);
});

router.get("/:slug/products", async (req, res) => {
  const { slug } = req.params;
  const { page = "1", limit = "12", search, sort } = req.query;
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  const where: any = { isActive: true, category: { slug } };
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { description: { contains: String(search), mode: "insensitive" } }
    ];
  }

  const orderBy: any = {};
  if (sort === "price_asc") orderBy.variants = { _min: { price: "asc" } };
  else if (sort === "price_desc") orderBy.variants = { _max: { price: "desc" } };
  else if (sort === "rating") orderBy.ratingAvg = "desc";
  else if (sort === "newest") orderBy.createdAt = "desc";

  const products = await prisma.product.findMany({
    where,
    include: { variants: true },
    skip,
    take,
    orderBy: Object.keys(orderBy).length ? orderBy : undefined
  });

  const total = await prisma.product.count({ where });
  res.json({ products, total, page: Number(page) });
});

export default router;
