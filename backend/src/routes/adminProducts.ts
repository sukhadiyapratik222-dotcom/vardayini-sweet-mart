import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../prisma";

const router = Router();

router.post("/", authenticate, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const root = await prisma.user.findUnique({ where: { id: userId } });
  if (!root?.isAdmin) return res.status(403).json({ error: "Forbidden" });

  const { name, slug, description, categorySlug, isActive, variants, imageUrls } = req.body;
  if (!name || !slug || !categorySlug || !variants?.length) {
    return res.status(400).json({ error: "Name, slug, categorySlug, and variants are required." });
  }

  let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    const nameFromSlug = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    category = await prisma.category.create({
      data: { name: nameFromSlug, slug: categorySlug }
    });
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      categoryId: category.id,
      isActive: isActive ?? true,
      productImages: Array.isArray(imageUrls)
        ? {
            create: imageUrls
              .filter((imageUrl: string) => Boolean(imageUrl))
              .map((imageUrl: string, index: number) => ({
                imageUrl,
                altText: `${name} ${index + 1}`,
                sortOrder: index,
              }))
          }
        : undefined,
      variants: {
        create: variants.map((variant: any) => ({
          weightLabel: variant.weightLabel,
          price: variant.price,
          discountedPrice: variant.discountedPrice,
          stockQty: variant.stockQty ?? 0,
          sku: variant.sku
        }))
      }
    },
    include: { variants: true }
  });

  res.status(201).json(product);
});

router.put("/:id", authenticate, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isAdmin) return res.status(403).json({ error: "Forbidden" });

  const { id } = req.params;
  const productId = Number(id);
  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product id." });
  }
  const { name, description, categorySlug, isActive, variants, imageUrls } = req.body;

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) return res.status(404).json({ error: "Product not found." });

  const updateData: any = {
    name: name ?? existing.name,
    description: description ?? existing.description,
    isActive: typeof isActive === "boolean" ? isActive : existing.isActive
  };

  if (categorySlug) {
    let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      const nameFromSlug = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      category = await prisma.category.create({
        data: { name: nameFromSlug, slug: categorySlug }
      });
    }
    updateData.categoryId = category.id;
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: { variants: true }
  });

  if (Array.isArray(imageUrls)) {
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: imageUrls
        .filter((imageUrl: string) => Boolean(imageUrl))
        .map((imageUrl: string, index: number) => ({
          productId: product.id,
          imageUrl,
          altText: `${name ?? existing.name} ${index + 1}`,
          sortOrder: index,
        }))
    });
  }

  if (variants?.length) {
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.createMany({
      data: variants.map((variant: any) => ({
        productId: product.id,
        weightLabel: variant.weightLabel,
        price: variant.price,
        discountedPrice: variant.discountedPrice,
        stockQty: variant.stockQty ?? 0,
        sku: variant.sku
      }))
    });
  }

  res.json(product);
});

export default router;
