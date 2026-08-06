import { Router } from "express";
import { prisma } from "../prisma";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();

import { ProductCreateSchema, formatZodError } from "../validators/schemaValidators";

// Protect all admin product routes with requireAdmin middleware
router.use(requireAdmin);

// GET /api/admin/products - List full inventory (active + inactive) for admin table
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        productImages: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => ({
      ...p,
      isActive: p.isActive !== false,
      categorySlug: p.category?.slug || "",
      subcategory: p.category?.slug || "",
      images: (p.productImages ?? []).map((img: any) => img.imageUrl),
      primaryImage: p.productImages?.[0]?.imageUrl || "/images/sweet-1.jpg",
      totalStock: (p.variants ?? []).reduce((sum: number, v: any) => sum + (v.stockQty ?? 0), 0),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin product inventory." });
  }
});

// GET /api/admin/products/:id - Fetch single product for admin edit modal
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = Number(id);

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: Number.isNaN(targetId) ? -1 : targetId }, { slug: id }],
      },
      include: {
        category: true,
        variants: true,
        productImages: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found or has been deleted." });
    }

    const formatted = {
      ...product,
      categorySlug: product.category?.slug || "",
      subcategory: product.category?.slug || "",
      images: (product.productImages ?? []).map((img: any) => img.imageUrl),
      primaryImage: product.productImages?.[0]?.imageUrl || "/images/sweet-1.jpg",
      totalStock: (product.variants ?? []).reduce((sum: number, v: any) => sum + (v.stockQty ?? 0), 0),
    };

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch product details." });
  }
});

// Helper to generate guaranteed unique SKU
function generateUniqueSku(rawSku: string | undefined, index: number): string {
  const timestamp = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 1000);
  if (rawSku && !["SKU-250G", "SKU-500G", "KK-250", "KK-500", "MP-250", "DF-250"].includes(rawSku)) {
    return `${rawSku.trim()}-${timestamp}-${rand}`;
  }
  return `SKU-${timestamp}-${index}-${rand}`;
}

// POST /api/admin/products - Create a new product with variants & images
router.post("/", async (req, res) => {
  const result = ProductCreateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(formatZodError(result.error));
  }

  try {
    let { name, slug, description, categorySlug, tag, isActive, variants, imageUrls } = result.data as any;
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    if (!variants || variants.length === 0) {
      variants = [{ weightLabel: "500g", price: req.body.price || 350, stockQty: 50 }];
    }

    // Validate duplicate product by name
    const existingByName = await prisma.product.findFirst({
      where: {
        name: { equals: name.trim() }
      }
    });

    if (existingByName) {
      return res.status(400).json({
        error: `Product "${name.trim()}" already exists in the catalog. Modify the existing product instead of creating a duplicate.`
      });
    }

    // Ensure unique slug
    let finalSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existingSlug = await prisma.product.findUnique({ where: { slug: finalSlug } });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      const nameFromSlug = categorySlug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
      category = await prisma.category.create({
        data: { name: nameFromSlug, slug: categorySlug },
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description: description || "",
        categoryId: category.id,
        tag: tag || "none",
        isActive: isActive ?? true,
        productImages: Array.isArray(imageUrls) && imageUrls.length > 0
          ? {
              create: imageUrls
                .filter((imageUrl: string) => Boolean(imageUrl))
                .map((imageUrl: string, index: number) => ({
                  imageUrl,
                  altText: `${name} ${index + 1}`,
                  sortOrder: index,
                })),
            }
          : {
              create: [{ imageUrl: "/images/sweet-1.jpg", altText: name, sortOrder: 0 }]
            },
        variants: {
          create: variants.map((variant: any, idx: number) => ({
            weightLabel: variant.weightLabel || "500g",
            price: Number(variant.price || 250),
            discountedPrice: variant.discountedPrice ? Number(variant.discountedPrice) : null,
            stockQty: Number(variant.stockQty ?? 20),
            sku: generateUniqueSku(variant.sku, idx),
          })),
        },
      },
      include: { category: true, variants: true, productImages: true },
    });

    const formattedProduct = {
      ...product,
      categorySlug: category.slug,
      subcategory: category.slug,
      images: (product.productImages ?? []).map((img: any) => img.imageUrl),
      primaryImage: product.productImages?.[0]?.imageUrl || "/images/sweet-1.jpg",
      totalStock: (product.variants ?? []).reduce((sum: number, v: any) => sum + (v.stockQty ?? 0), 0),
    };

    res.status(201).json(formattedProduct);
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message || "Failed to create product." });
  }
});

// PUT /api/admin/products/:id - Edit existing product details
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = Number(id);
    const { name, slug, description, categorySlug, tag, isActive, variants, imageUrls } = req.body;

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ id: Number.isNaN(targetId) ? -1 : targetId }, { slug: id }],
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Product not found or has been deleted." });
    }

    if (name && name.trim()) {
      const duplicateName = await prisma.product.findFirst({
        where: {
          name: { equals: name.trim() },
          NOT: { id: existing.id },
        },
      });
      if (duplicateName) {
        return res.status(400).json({ error: `Product name "${name.trim()}" is already used by another product.` });
      }
    }

    if (slug && slug.trim()) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const duplicateSlug = await prisma.product.findFirst({
        where: {
          slug: cleanSlug,
          NOT: { id: existing.id },
        },
      });
      if (duplicateSlug) {
        return res.status(400).json({ error: `Product slug "${cleanSlug}" is already taken by another product.` });
      }
    }

    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        if (!v.weightLabel || !v.weightLabel.trim()) {
          return res.status(400).json({ error: "Each variant must have a valid weight label." });
        }
        if (Number.isNaN(Number(v.price)) || Number(v.price) <= 0) {
          return res.status(400).json({ error: "Variant price must be a number greater than 0." });
        }
      }
    }

    const updateData: any = {
      ...(name ? { name: name.trim() } : {}),
      ...(slug ? { slug: slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(tag ? { tag } : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
    };

    if (categorySlug) {
      let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!category) {
        const nameFromSlug = categorySlug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
        category = await prisma.category.create({
          data: { name: nameFromSlug, slug: categorySlug },
        });
      }
      updateData.categoryId = category.id;
    }

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
      include: { category: true, variants: true, productImages: true },
    });

    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.createMany({
        data: imageUrls
          .filter((imageUrl: string) => Boolean(imageUrl))
          .map((imageUrl: string, index: number) => ({
            productId: product.id,
            imageUrl,
            altText: `${name ?? existing.name} ${index + 1}`,
            sortOrder: index,
          })),
      });
    }

    if (Array.isArray(variants) && variants.length > 0) {
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: product.id }
      });

      const processedVariantIds = new Set<number>();

      for (let idx = 0; idx < variants.length; idx++) {
        const v = variants[idx];
        const weightLabel = (v.weightLabel || v.weight || "500g").trim();
        const price = Number(v.price || 250);
        const discountedPrice = v.discountedPrice ? Number(v.discountedPrice) : null;
        const stockQty = Number(v.stockQty ?? 50);

        let matched = null;
        if (v.id && !Number.isNaN(Number(v.id))) {
          matched = existingVariants.find(ev => ev.id === Number(v.id));
        }
        if (!matched && weightLabel) {
          matched = existingVariants.find(ev => ev.weightLabel.toLowerCase() === weightLabel.toLowerCase());
        }

        if (matched) {
          await prisma.productVariant.update({
            where: { id: matched.id },
            data: {
              weightLabel,
              price,
              discountedPrice,
              stockQty
            }
          });
          processedVariantIds.add(matched.id);
        } else {
          const created = await prisma.productVariant.create({
            data: {
              productId: product.id,
              weightLabel,
              price,
              discountedPrice,
              stockQty,
              sku: generateUniqueSku(v.sku, idx),
            }
          });
          processedVariantIds.add(created.id);
        }
      }

      for (const ev of existingVariants) {
        if (!processedVariantIds.has(ev.id)) {
          try {
            await prisma.cartItem.deleteMany({ where: { productVariantId: ev.id } });
            await prisma.productVariant.delete({ where: { id: ev.id } });
          } catch (err) {
            await prisma.productVariant.update({ where: { id: ev.id }, data: { stockQty: 0 } });
          }
        }
      }
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, variants: true, productImages: true },
    });

    const formatted = {
      ...updatedProduct,
      categorySlug: updatedProduct?.category?.slug || "",
      subcategory: updatedProduct?.category?.slug || "",
      images: (updatedProduct?.productImages ?? []).map((img: any) => img.imageUrl),
      primaryImage: updatedProduct?.productImages?.[0]?.imageUrl || "/images/sweet-1.jpg",
      totalStock: (updatedProduct?.variants ?? []).reduce((sum: number, v: any) => sum + (v.stockQty ?? 0), 0),
    };

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update product." });
  }
});

// DELETE /api/admin/products/:id - Delete / deactivate product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = Number(id);

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ id: Number.isNaN(targetId) ? -1 : targetId }, { slug: id }],
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Delete child records first to satisfy MySQL foreign key constraints
    await prisma.productImage.deleteMany({ where: { productId: existing.id } });

    try {
      await prisma.cartItem.deleteMany({ where: { productVariant: { productId: existing.id } } });
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
      await prisma.product.delete({ where: { id: existing.id } });
      res.json({ success: true, message: `Product "${existing.name}" permanently deleted.`, id: existing.id });
    } catch (dbErr) {
      // If referenced in historical customer orders, mark inactive so order history remains intact
      await prisma.product.update({ where: { id: existing.id }, data: { isActive: false } });
      res.json({ success: true, message: `Product "${existing.name}" deactivated (preserved for order history).`, id: existing.id });
    }
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message || "Failed to delete product." });
  }
});

// PUT /api/admin/products/:id/stock - Quick stock update per variant or product
router.put("/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = Number(id);
    const { variantId, stockQty } = req.body;

    if (variantId) {
      const variant = await prisma.productVariant.update({
        where: { id: Number(variantId) },
        data: { stockQty: Number(stockQty) },
      });
      return res.json({ success: true, variant });
    }

    res.json({ success: true, message: "Stock updated", id: targetId, stockQty });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update stock." });
  }
});

export default router;
