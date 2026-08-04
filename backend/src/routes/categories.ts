import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// Full default category hierarchy tree
const defaultCategoryTree = [
  {
    id: "cat-sweets",
    name: "Sweets",
    slug: "sweets",
    description: "Pure Desi Ghee Sweets & Traditional Indian Mithai",
    subcategories: [
      { name: "Kaju Sweets", slug: "kaju-sweets" },
      { name: "Mawa Sweets", slug: "mawa-sweets" },
      { name: "Penda", slug: "penda" },
      { name: "Sugarless", slug: "sugarless" },
      { name: "Premium Packed", slug: "premium-packed" },
      { name: "Indian Ghee", slug: "indian-ghee" },
    ],
  },
  {
    id: "cat-namkeen",
    name: "Namkeen",
    slug: "namkeen",
    description: "Crispy Gujarati Savories & Roasted Healthy Snacks",
    subcategories: [
      { name: "Millet", slug: "millet" },
      { name: "Farali", slug: "farali" },
      { name: "Gujarati", slug: "gujarati" },
      { name: "Khakhra", slug: "khakhra" },
      { name: "Roasted", slug: "roasted" },
      { name: "Mixture", slug: "mixture" },
      { name: "Sev", slug: "sev" },
      { name: "Chips & Puris", slug: "chips-puris" },
    ],
  },
  {
    id: "cat-bakery",
    name: "Bakery",
    slug: "bakery",
    description: "Fresh Oven Biscuits, Cookies, Toast & Khari",
    subcategories: [
      { name: "Biscuits & Cookies", slug: "biscuits-cookies" },
      { name: "Toast & Khari", slug: "toast-khari" },
    ],
  },
  {
    id: "cat-mukhwas",
    name: "Mukhwas",
    slug: "mukhwas",
    description: "Traditional Digestive Mouth Fresheners",
    subcategories: [],
  },
  {
    id: "cat-dryfruits",
    name: "Dried Fruits & Nuts",
    slug: "dry-fruits-nuts",
    description: "Premium Almonds, Cashews, Pistachios & Raisins",
    subcategories: [],
  },
  {
    id: "cat-baklava",
    name: "Premium Baklava",
    slug: "premium-baklava",
    description: "Royal Middle Eastern Phyllo Pastry Sweets",
    subcategories: [],
  },
  {
    id: "cat-corporate",
    name: "Corporate Gifts",
    slug: "corporate-gift-boxes",
    description: "Customized Festival Sweets & Luxury Gift Hampers",
    subcategories: [],
  },
];

// GET /api/categories - Returns category tree (combining DB categories & defaults)
router.get("/", async (req, res) => {
  try {
    const dbCategories = await prisma.category.findMany({
      include: { children: true, parent: true },
      orderBy: { name: "asc" },
    });

    if (!dbCategories || dbCategories.length === 0) {
      return res.json(defaultCategoryTree);
    }

    res.json(dbCategories);
  } catch (error) {
    res.json(defaultCategoryTree);
  }
});

// POST /api/categories - Create a new category in MySQL database
router.post("/", async (req, res) => {
  try {
    const { name, slug, parentId, description } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const cleanName = String(name).trim();
    const finalSlug = (slug || cleanName.toLowerCase()).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existing = await prisma.category.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return res.json(existing);
    }

    const newCat = await prisma.category.create({
      data: {
        name: cleanName,
        slug: finalSlug,
        ...(parentId ? { parentId: Number(parentId) } : {}),
      },
      include: { children: true },
    });

    res.status(201).json(newCat);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create category" });
  }
});

// GET /api/categories/:slug - Single category with products
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { children: true, products: { include: { variants: true } } },
    });

    if (!category) {
      const found = defaultCategoryTree.find((c) => c.slug === slug);
      if (found) return res.json(found);
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    const found = defaultCategoryTree.find((c) => c.slug === slug);
    if (found) return res.json(found);
    res.status(404).json({ error: "Category not found" });
  }
});

// DELETE /api/categories/:id - Block deletion if category has products
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const targetId = Number(id);

  try {
    const productsCount = await prisma.product.count({
      where: { categoryId: Number.isNaN(targetId) ? -1 : targetId }
    });

    if (productsCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category. ${productsCount} products are currently assigned to this category. Reassign or delete the products first.`
      });
    }

    await prisma.category.delete({ where: { id: Number.isNaN(targetId) ? -1 : targetId } });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
