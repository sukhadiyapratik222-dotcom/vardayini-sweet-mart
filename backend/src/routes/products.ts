import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/auth";

const router = Router();

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
  product.productImages?.[0]?.imageUrl ||
  (Array.isArray(product.imageUrls) && product.imageUrls[0]) ||
  product.primaryImage ||
  product.image ||
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
  try {
    const catStr = category ? String(category).trim().toLowerCase() : "";
    const targetCat = (catStr === 'corporate-gifts' || catStr === 'corporate-gift-boxes') ? 'corporate-gift-boxes' : catStr;

    const includeInactive = req.query.includeInactive === 'true';

    products = await prisma.product.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
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
  } catch (err: any) {
    console.error("Error fetching products from DB:", err.message);
    return res.status(500).json({ error: "Failed to fetch products." });
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

  if (req.query.format === 'array' || req.query.raw === 'true') {
    return res.json(pagedProducts);
  }

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
  } catch (e: any) {
    console.error("Error searching products:", e.message);
    // Return empty suggestions on error, rather than falling back to static data
    return res.json({ suggestions: [] });
  }
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
  } catch (e: any) {
    console.error(`Error fetching products by tag ${tag}:`, e.message);
    return res.status(500).json({ error: "Failed to fetch products by tag." });
  }
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
  } catch (e: any) {
    console.error("Error fetching featured products:", e.message);
    return res.status(500).json({ error: "Failed to fetch featured products." });
  }
});

// GET /api/products/:slug - Single product with variants & images (ACTIVE only)
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const isValidObjectId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);
  try {
    const product = await prisma.product.findFirst({
      where: isValidObjectId(slug)
        ? { OR: [{ slug }, { id: slug }], isActive: true }
        : { slug, isActive: true },
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
    if (product) return res.json(formatProduct(product)); // If product found, return it
  } catch (e: any) {
    console.error(`Error fetching product by slug ${slug}:`, e.message);
    // Fall through to 404 if DB error or product not found
  }

  res.status(404).json({ error: "Product not found or is no longer available." });
});

// GET /api/products/:id/reviews
router.get("/:id/reviews", async (req, res) => {
  const productId = req.params.id;
  try {
    const reviews = await prisma.review.findMany({
      where: { OR: [{ productId: productId }] },
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
    const productId = String(req.params.id);
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
