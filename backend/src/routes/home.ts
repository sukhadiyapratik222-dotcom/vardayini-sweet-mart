import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    bannersUrl: "/api/home/banners",
    sectionsUrl: "/api/home/sections",
    message: "Homepage API Endpoints Active"
  });
});

// GET /api/home/banners - Returns hero carousel promotional banners
router.get("/banners", async (req, res) => {
  const banners = [
    {
      id: "banner-1",
      title: "Royal Pure Desi Ghee Sweets",
      subtitle: "Handcrafted with 100% Pure A2 Cow Ghee & Finest Organic Dry Fruits",
      badge: "Festive Collection 2026",
      image: "/images/hero-1.jpg",
      ctaText: "Order Fresh Sweets →",
      ctaLink: "/categories/sweets",
    },
    {
      id: "banner-[#2]",
      title: "Authentic Gujarati Namkeen & Snacks",
      subtitle: "Crispy, Roasted, Farali & Millet Savories Prepared Fresh Everyday",
      badge: "Zero Trans-Fat Quality",
      image: "/images/hero-2.jpg",
      ctaText: "Explore Namkeen →",
      ctaLink: "/categories/namkeen",
    },
    {
      id: "banner-[#3]",
      title: "Sugarfree Healthy Dryfruit Sweets",
      subtitle: "Guilt-Free Indulgence Made with Pure Dates, Anjeer & Honey",
      badge: "Diabetic Friendly",
      image: "/images/sweet-3.jpg",
      ctaText: "Shop Sugarless →",
      ctaLink: "/categories/sugarless",
    },
  ];

  res.json(banners);
});

// GET /api/home/sections (best-sellers, new-arrivals, premium, combos)
router.get("/sections", async (req, res) => {
  try {
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, variants: true, productImages: true },
    });

    const formatProduct = (p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || "Sweets",
      categorySlug: p.category?.slug || "sweets",
      ratingAvg: p.ratingAvg || 4.8,
      ratingCount: p.ratingCount || 120,
      image: p.productImages?.[0]?.imageUrl || "/images/sweet-1.jpg",
      variants: p.variants || [
        { id: `${p.id}-250g`, weightLabel: "250g", price: 450, discountedPrice: 399, stockQty: 50 },
        { id: `${p.id}-500g`, weightLabel: "500g", price: 850, discountedPrice: 799, stockQty: 40 },
        { id: `${p.id}-1kg`, weightLabel: "1kg", price: 1600, discountedPrice: 1450, stockQty: 25 },
      ],
    });

    const formatted = allProducts.map(formatProduct);

    res.json({
      bestSellers: formatted.slice(0, 4),
      newArrivals: formatted.slice(4, 8),
      premiumSweets: formatted.slice(0, 4),
      combos: [
        {
          id: "combo-1",
          name: "Royal Festive Sweet Box (1kg)",
          slug: "royal-festive-sweet-box",
          category: "Combos",
          categorySlug: "combos",
          ratingAvg: 4.9,
          ratingCount: 210,
          image: "/images/sweet-1.jpg",
          variants: [
            { id: "combo-1-1kg", weightLabel: "1kg Box", price: 1800, discountedPrice: 1499, stockQty: 30 },
          ],
        },
        {
          id: "combo-2",
          name: "Gujarati Premium Namkeen Variety Combo",
          slug: "gujarati-namkeen-combo",
          category: "Combos",
          categorySlug: "combos",
          ratingAvg: 4.8,
          ratingCount: 145,
          image: "/images/sweet-2.jpg",
          variants: [
            { id: "combo-2-500g", weightLabel: "5 Pack Set", price: 850, discountedPrice: 699, stockQty: 45 },
          ],
        },
      ],
    });
  } catch (error) {
    res.json({
      bestSellers: [],
      newArrivals: [],
      premiumSweets: [],
      combos: [],
    });
  }
});

export default router;
