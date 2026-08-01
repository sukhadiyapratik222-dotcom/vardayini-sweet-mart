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

// GET /api/categories - Returns nested category tree
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
    });

    if (!categories || categories.length === 0) {
      return res.json(defaultCategoryTree);
    }

    res.json(categories);
  } catch (error) {
    res.json(defaultCategoryTree);
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

export default router;
