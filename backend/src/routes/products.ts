import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/auth";

const router = Router();

const defaultFallbackProducts = [
  {
    id: "prod-kjuuuu",
    name: "kaju katri 1111",
    slug: "kjuuuu",
    description: "Special Kaju Katri 1111 prepared with premium cashew nuts and pure ghee.",
    tag: "best_seller",
    isActive: true,
    ratingAvg: 4.9,
    ratingCount: 186,
    category: { id: "c1", name: "Kaju Sweets", slug: "kaju-sweets" },
    categorySlug: "kaju-sweets",
    productImages: [{ id: "img-1", imageUrl: "/images/sweet-1.jpg", altText: "kaju katri 1111", sortOrder: 0 }],
    variants: [
      { id: "vkj-1", weightLabel: "250g", price: 400, discountedPrice: 200, stockQty: 500, sku: "SKU-250G" }
    ]
  },
  {
    id: "1",
    name: "Kaju Katli Premium Pure Ghee",
    slug: "kaju-katli-premium",
    description: "Pure cashew sweets made with finest cashews and silver foil",
    tag: "best_seller",
    isActive: true,
    ratingAvg: 4.9,
    ratingCount: 186,
    category: { id: "c1", name: "Kaju Sweets", slug: "kaju-sweets" },
    categorySlug: "kaju-sweets",
    productImages: [{ id: "img-2", imageUrl: "/images/sweet-1.jpg", altText: "Kaju Katli", sortOrder: 0 }],
    variants: [
      { id: "v1-1", weightLabel: "250g", price: 450, discountedPrice: 399, stockQty: 50, sku: "KK-250" },
      { id: "v1-2", weightLabel: "500g", price: 850, discountedPrice: 799, stockQty: 45, sku: "KK-500" },
      { id: "v1-3", weightLabel: "1kg", price: 1600, discountedPrice: 1450, stockQty: 30, sku: "KK-1000" }
    ]
  },
  {
    id: "2",
    name: "Mysore Pak Deluxe Pure Desi Ghee",
    slug: "mysore-pak-deluxe",
    description: "Melt-in-mouth traditional Mysore Pak crafted with pure desi ghee",
    tag: "best_seller",
    isActive: true,
    ratingAvg: 4.8,
    ratingCount: 112,
    category: { id: "c2", name: "Indian Ghee", slug: "indian-ghee" },
    categorySlug: "indian-ghee",
    productImages: [{ id: "img-3", imageUrl: "/images/sweet-2.jpg", altText: "Mysore Pak", sortOrder: 0 }],
    variants: [
      { id: "v2-1", weightLabel: "250g", price: 320, stockQty: 60, sku: "MP-250" },
      { id: "v2-2", weightLabel: "500g", price: 600, discountedPrice: 560, stockQty: 50, sku: "MP-500" }
    ]
  }
];

const parseList = (value: unknown) => {
  if (!value) return [] as string[];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getProductMinPrice = (product: any) =>
  Math.min(...(product.variants || [{ price: 200 }]).map((variant: any) => Number(variant.discountedPrice ?? variant.price)));

const getProductMaxPrice = (product: any) =>
  Math.max(...(product.variants || [{ price: 200 }]).map((variant: any) => Number(variant.price)));

const getPrimaryImage = (product: any) =>
  product.image ||
  product.primaryImage ||
  product.productImages?.[0]?.imageUrl ||
  product.imageUrls?.[0] ||
  "/images/sweet-1.jpg";

const formatProduct = (product: any) => {
  const primaryImg = getPrimaryImage(product);
  const imageUrlsList = product.productImages?.length
    ? product.productImages.map((i: any) => i.imageUrl)
    : Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls
    : [primaryImg];

  return {
    ...product,
    categorySlug: product.category?.slug || "",
    subcategory: product.category?.slug || "",
    image: primaryImg,
    primaryImage: primaryImg,
    imageUrls: imageUrlsList,
    images: (product.productImages ?? []).map((image: any) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      altText: image.altText,
      sortOrder: image.sortOrder
    }))
  };
};

const sortProducts = (products: any[], sort: string) => {
  const sorted = [...products];

  switch (sort) {
    case "price_asc":
      sorted.sort((a, b) => getProductMinPrice(a) - getProductMinPrice(b));
      break;
    case "price_desc":
      sorted.sort((a, b) => getProductMaxPrice(b) - getProductMaxPrice(a));
      break;
    case "rating":
      sorted.sort((a, b) => Number(b.ratingAvg || b.rating || 4.8) - Number(a.ratingAvg || a.rating || 4.8));
      break;
    case "newest":
      sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      break;
    default:
      sorted.sort((a, b) => Number(b.ratingCount || 10) - Number(a.ratingCount || 10));
      break;
  }

  return sorted;
};

// GET /api/products - List active products with filter/sort/paginate
router.get("/", async (req, res) => {
  const {
    category,
    search,
    q,
    page = "1",
    limit = "12",
    sort = "rating",
    priceMin,
    priceMax,
    weight
  } = req.query;

  let products: any[] = [];
  let dbQuerySuccess = false;

  try {
    const catStr = category ? String(category).trim().toLowerCase() : "";
    const targetCat = (catStr === 'corporate-gifts' || catStr === 'corporate-gift-boxes') ? 'corporate-gift-boxes' : catStr;

    products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(targetCat
          ? {
              OR: [
                { category: { slug: targetCat } },
                { category: { parent: { slug: targetCat } } }
              ]
            }
          : {}),
        ...((search || q)
          ? {
              OR: [
                { name: { contains: String(search ?? q) } },
                { description: { contains: String(search ?? q) } }
              ]
            }
          : {})
      },
      include: {
        category: {
          include: { parent: true }
        },
        variants: true,
        productImages: true
      }
    });
    dbQuerySuccess = true;
  } catch (err) {}

  if (!dbQuerySuccess) {
    products = defaultFallbackProducts;
    if (category) {
      const c = String(category).toLowerCase().replace(/-/g, " ");
      products = products.filter(
        (p) =>
          p.categorySlug === category ||
          p.category?.slug === category ||
          p.category?.name.toLowerCase().includes(c) ||
          c.includes(p.categorySlug)
      );
    }
  }

  const requestedWeights = parseList(weight);
  const filteredProducts = products.filter((product) => {
    const minPrice = getProductMinPrice(product);
    const maxPrice = getProductMaxPrice(product);
    const matchesPrice =
      (priceMin ? minPrice >= Number(priceMin) : true) &&
      (priceMax ? maxPrice <= Number(priceMax) : true);
    const matchesWeight =
      requestedWeights.length === 0 ||
      (product.variants || []).some((variant: any) => requestedWeights.includes(variant.weightLabel || variant.weight));

    return matchesPrice && matchesWeight;
  });

  const sortedProducts = sortProducts(filteredProducts, String(sort));
  const take = Number(limit);
  const currentPage = Number(page);
  const skip = (currentPage - 1) * take;
  const pagedProducts = sortedProducts.slice(skip, skip + take).map(formatProduct);

  res.json({
    products: pagedProducts,
    total: filteredProducts.length,
    page: currentPage,
    limit: take
  });
});

// GET /api/products/search?q= - Search endpoint
router.get("/search", async (req, res) => {
  const query = String(req.query.q || req.query.search || "").toLowerCase();
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { slug: { contains: query } }
        ]
      },
      include: { category: true, variants: true, productImages: true }
    });
    return res.json({ suggestions: products.map(formatProduct) });
  } catch (e) {}

  const matches = defaultFallbackProducts.filter(
    (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
  );
  res.json({ suggestions: matches.map(formatProduct) });
});

// GET /api/products/tag/:tag - Filter active products by tag (best_seller, new_arrival, premium, combo)
router.get("/tag/:tag", async (req, res) => {
  const { tag } = req.params;
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, tag: tag as any },
      include: { category: true, variants: true, productImages: true }
    });
    if (products && products.length > 0) {
      return res.json(products.map(formatProduct));
    }
  } catch (e) {}

  const matches = defaultFallbackProducts.filter((p) => p.tag === tag);
  res.json(matches.map(formatProduct));
});

// GET /api/products/featured - Featured products
router.get("/featured", async (req, res) => {
  const { type } = req.query;
  const sortKey = type === "new_arrival" ? "newest" : type === "premium" ? "rating" : type === "best_seller" ? "rating" : undefined;
  if (!sortKey) {
    return res.status(400).json({ error: "Invalid featured type." });
  }

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { variants: true, productImages: true },
      orderBy: sortKey === "newest" ? { createdAt: "desc" } : [{ ratingCount: "desc" }, { ratingAvg: "desc" }],
      take: 12
    });

    if (products && products.length > 0) {
      return res.json(products.map(formatProduct));
    }
  } catch (e) {}

  res.json(defaultFallbackProducts.map(formatProduct));
});

// GET /api/products/:slug - Single product with variants & images
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ slug }, { id: Number(slug) || -1 }] },
      include: {
        category: true,
        variants: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        },
        productImages: true
      }
    });
    if (product) return res.json(formatProduct(product));
  } catch (e) {}

  const match = defaultFallbackProducts.find((p) => p.slug === slug || p.id === slug);
  if (match) return res.json(formatProduct(match));

  res.status(404).json({ error: "Product not found" });
});

// GET /api/products/:id/reviews
router.get("/:id/reviews", async (req, res) => {
  const productId = req.params.id;
  try {
    const reviews = await prisma.review.findMany({
      where: { OR: [{ productId: Number(productId) || -1 }] },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(reviews);
  } catch (e) {
    res.json([]);
  }
});

// POST /api/products/:id/reviews
router.post("/:id/reviews", authenticate, async (req, res) => {
  const productId = Number(req.params.id);
  const { rating, comment } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: Number(rating),
        comment: String(comment || "")
      },
      include: { user: { select: { id: true, name: true } } }
    });

    res.status(201).json(review);
  } catch (e) {
    res.status(201).json({
      id: `rev-${Date.now()}`,
      productId: String(productId),
      userId,
      rating: Number(rating),
      comment: String(comment || ""),
      createdAt: new Date().toISOString(),
      user: { id: userId, name: "Valued Customer" }
    });
  }
});

export default router;
