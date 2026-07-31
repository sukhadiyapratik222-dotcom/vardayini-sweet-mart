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
  Math.min(...product.variants.map((variant: any) => Number(variant.discountedPrice ?? variant.price)));

const getProductMaxPrice = (product: any) =>
  Math.max(...product.variants.map((variant: any) => Number(variant.price)));

const getPrimaryImage = (product: any) => product.productImages?.[0]?.imageUrl ?? "/images/sweet-1.jpg";

const formatProduct = (product: any) => ({
  ...product,
  images: (product.productImages ?? []).map((image: any) => ({
    id: image.id,
    imageUrl: image.imageUrl,
    altText: image.altText,
    sortOrder: image.sortOrder
  })),
  primaryImage: getPrimaryImage(product)
});

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
      sorted.sort((a, b) => Number(b.ratingAvg) - Number(a.ratingAvg) || Number(b.ratingCount) - Number(a.ratingCount));
      break;
    case "newest":
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    default:
      sorted.sort((a, b) => Number(b.ratingCount) - Number(a.ratingCount) || Number(b.ratingAvg) - Number(a.ratingAvg));
      break;
  }

  return sorted;
};

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

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category: { slug: String(category) } } : {}),
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
      category: true,
      variants: true,
      productImages: true
    }
  });

  const requestedWeights = parseList(weight);
  const filteredProducts = products.filter((product) => {
    const minPrice = getProductMinPrice(product);
    const maxPrice = getProductMaxPrice(product);
    const matchesPrice =
      (priceMin ? minPrice >= Number(priceMin) : true) &&
      (priceMax ? maxPrice <= Number(priceMax) : true);
    const matchesWeight =
      requestedWeights.length === 0 ||
      product.variants.some((variant: any) => requestedWeights.includes(variant.weightLabel));

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

router.get("/featured", async (req, res) => {
  const { type } = req.query;
  const sortKey = type === "new_arrival" ? "newest" : type === "premium" ? "rating" : type === "best_seller" ? "rating" : undefined;
  if (!sortKey) {
    return res.status(400).json({ error: "Invalid featured type." });
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true, productImages: true },
    orderBy: sortKey === "newest" ? { createdAt: "desc" } : sortKey === "rating" ? [{ ratingCount: "desc" }, { ratingAvg: "desc" }] : { createdAt: "desc" },
    take: 12
  });

  res.json(products.map(formatProduct));
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const product = await prisma.product.findUnique({
    where: { slug },
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
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(formatProduct(product));
});

router.get("/:id/reviews", async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });

  res.json(reviews);
});

router.post("/:id/reviews", authenticate, async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const { rating, comment } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const review = await prisma.review.create({
    data: {
      productId,
      userId,
      rating: Number(rating),
      comment: String(comment || "")
    },
    include: { user: { select: { id: true, name: true } } }
  });

  const aggregate = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true }
  });

  const ratingCount = await prisma.review.count({ where: { productId } });

  await prisma.product.update({
    where: { id: productId },
    data: {
      ratingAvg: aggregate._avg.rating ?? 0,
      ratingCount
    }
  });

  res.status(201).json(review);
});

export default router;
