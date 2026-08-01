import { Router } from "express";
import { prisma } from "../prisma";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();

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
      images: (p.productImages ?? []).map((img: any) => img.imageUrl),
      primaryImage: p.productImages?.[0]?.imageUrl || "/images/sweet-1.jpg",
      totalStock: (p.variants ?? []).reduce((sum: number, v: any) => sum + (v.stockQty ?? 0), 0),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin product inventory." });
  }
});

// POST /api/admin/products - Create a new product with variants & images
router.post("/", async (req, res) => {
  try {
    const { name, slug, description, categorySlug, tag, isActive, variants, imageUrls } = req.body;
    if (!name || !slug || !categorySlug || !variants?.length) {
      return res.status(400).json({ error: "Name, slug, categorySlug, and variants are required." });
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
        slug,
        description: description || "",
        categoryId: category.id,
        tag: tag || "none",
        isActive: isActive ?? true,
        productImages: Array.isArray(imageUrls)
          ? {
              create: imageUrls
                .filter((imageUrl: string) => Boolean(imageUrl))
                .map((imageUrl: string, index: number) => ({
                  imageUrl,
                  altText: `${name} ${index + 1}`,
                  sortOrder: index,
                })),
            }
          : undefined,
        variants: {
          create: variants.map((variant: any) => ({
            weightLabel: variant.weightLabel || "500g",
            price: Number(variant.price || 250),
            discountedPrice: variant.discountedPrice ? Number(variant.discountedPrice) : null,
            stockQty: Number(variant.stockQty ?? 20),
            sku: variant.sku || `SKU-${Date.now().toString().slice(-4)}`,
          })),
        },
      },
      include: { category: true, variants: true, productImages: true },
    });

    res.status(201).json(product);
  } catch (error: any) {
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
      return res.status(404).json({ error: "Product not found." });
    }

    const updateData: any = {
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
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
          })),
      });
    }

    if (Array.isArray(variants) && variants.length > 0) {
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      await prisma.productVariant.createMany({
        data: variants.map((variant: any) => ({
          productId: product.id,
          weightLabel: variant.weightLabel || "500g",
          price: Number(variant.price || 250),
          discountedPrice: variant.discountedPrice ? Number(variant.discountedPrice) : null,
          stockQty: Number(variant.stockQty ?? 20),
          sku: variant.sku || `SKU-${Date.now().toString().slice(-4)}`,
        })),
      });
    }

    res.json(product);
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

    await prisma.product.delete({ where: { id: existing.id } });
    res.json({ success: true, message: `Product "${existing.name}" deleted.`, id: existing.id });
  } catch (error: any) {
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

// POST /api/admin/products/:id/images - Upload additional image URL
router.post("/:id/images", async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = Number(id);
    const { imageUrl, altText } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    const image = await prisma.productImage.create({
      data: {
        productId: targetId,
        imageUrl,
        altText: altText || "Product photo",
        sortOrder: 0,
      },
    });

    res.status(201).json(image);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add product image." });
  }
});

// DELETE /api/admin/products/:id/images/:imageId - Remove an image
router.delete("/:id/images/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;
    await prisma.productImage.delete({ where: { id: Number(imageId) } });
    res.json({ success: true, message: "Product image deleted." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete image." });
  }
});

// Category Management Routes:
// POST /api/admin/categories - Add new category
router.post("/categories", async (req, res) => {
  try {
    const { name, slug, parentId } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Category name and slug are required." });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId ? Number(parentId) : null,
      },
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create category." });
  }
});

// PUT /api/admin/categories/:id - Update category
router.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parentId } = req.body;

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
        ...(parentId !== undefined ? { parentId: parentId ? Number(parentId) : null } : {}),
      },
    });

    res.json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update category." });
  }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const catId = Number(id);

    // Check if category has associated products
    const productCount = await prisma.product.count({ where: { categoryId: catId } });
    if (productCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category: Contains ${productCount} active products. Please reassign or delete associated products first.`
      });
    }

    await prisma.category.delete({ where: { id: catId } });
    res.json({ success: true, message: "Category deleted successfully.", id: catId });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete category." });
  }
});

export default router;
