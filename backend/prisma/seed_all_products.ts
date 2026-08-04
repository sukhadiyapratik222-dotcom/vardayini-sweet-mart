import { PrismaClient, ProductTag } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Vardayini Sweet Mart Database Catalog with Subcategories...");

  // 1. Parent Categories
  const catSweets = await prisma.category.upsert({
    where: { slug: "sweets" },
    create: { name: "Sweets", slug: "sweets" },
    update: { name: "Sweets" },
  });

  const catNamkeen = await prisma.category.upsert({
    where: { slug: "namkeen" },
    create: { name: "Namkeen", slug: "namkeen" },
    update: { name: "Namkeen" },
  });

  const catDryFruits = await prisma.category.upsert({
    where: { slug: "dry-fruits-nuts" },
    create: { name: "Dried Fruits & Nuts", slug: "dry-fruits-nuts" },
    update: { name: "Dried Fruits & Nuts" },
  });

  const catBaklava = await prisma.category.upsert({
    where: { slug: "premium-baklava" },
    create: { name: "Premium Baklava", slug: "premium-baklava" },
    update: { name: "Premium Baklava" },
  });

  const catCorporate = await prisma.category.upsert({
    where: { slug: "corporate-gift-boxes" },
    create: { name: "Corporate Gifts", slug: "corporate-gift-boxes" },
    update: { name: "Corporate Gifts" },
  });

  // 2. Subcategories
  const catKaju = await prisma.category.upsert({
    where: { slug: "kaju-sweets" },
    create: { name: "Kaju Sweets", slug: "kaju-sweets", parentId: catSweets.id },
    update: { parentId: catSweets.id },
  });

  const catMawa = await prisma.category.upsert({
    where: { slug: "mawa-sweets" },
    create: { name: "Mawa Sweets", slug: "mawa-sweets", parentId: catSweets.id },
    update: { parentId: catSweets.id },
  });

  const catPenda = await prisma.category.upsert({
    where: { slug: "penda" },
    create: { name: "Penda", slug: "penda", parentId: catSweets.id },
    update: { parentId: catSweets.id },
  });

  const catSugarless = await prisma.category.upsert({
    where: { slug: "sugarless" },
    create: { name: "Sugarless", slug: "sugarless", parentId: catSweets.id },
    update: { parentId: catSweets.id },
  });

  const catGhee = await prisma.category.upsert({
    where: { slug: "indian-ghee" },
    create: { name: "Indian Ghee", slug: "indian-ghee", parentId: catSweets.id },
    update: { parentId: catSweets.id },
  });

  const catMixture = await prisma.category.upsert({
    where: { slug: "mixture" },
    create: { name: "Mixture", slug: "mixture", parentId: catNamkeen.id },
    update: { parentId: catNamkeen.id },
  });

  const catKhakhra = await prisma.category.upsert({
    where: { slug: "khakhra" },
    create: { name: "Khakhra", slug: "khakhra", parentId: catNamkeen.id },
    update: { parentId: catNamkeen.id },
  });

  const catSev = await prisma.category.upsert({
    where: { slug: "sev" },
    create: { name: "Sev", slug: "sev", parentId: catNamkeen.id },
    update: { parentId: catNamkeen.id },
  });

  // 3. Products List with Exact Subcategory IDs
  const productsData = [
    {
      name: "kaju katri 1111",
      slug: "kjuuuu",
      categoryId: catKaju.id,
      description: "Special Kaju Katri 1111 prepared with premium cashew nuts and pure ghee.",
      ratingAvg: 4.9,
      ratingCount: 186,
      tag: ProductTag.best_seller,
      imageUrl: "/images/sweet-1.jpg",
      variants: [
        { weightLabel: "250g", price: 400, discountedPrice: 200, stockQty: 500, sku: "SKU-250G" },
      ],
    },
    {
      name: "Kaju Katli Premium Pure Ghee",
      slug: "kaju-katli-premium",
      categoryId: catKaju.id,
      description: "Pure cashew sweets made with finest cashews and silver foil",
      ratingAvg: 4.9,
      ratingCount: 186,
      tag: ProductTag.best_seller,
      imageUrl: "/images/sweet-1.jpg",
      variants: [
        { weightLabel: "250g", price: 450, stockQty: 50, sku: "KK-250" },
        { weightLabel: "500g", price: 850, discountedPrice: 799, stockQty: 45, sku: "KK-500" },
        { weightLabel: "1kg", price: 1600, discountedPrice: 1450, stockQty: 30, sku: "KK-1000" },
      ],
    },
    {
      name: "Mysore Pak Deluxe Pure Desi Ghee",
      slug: "mysore-pak-deluxe",
      categoryId: catGhee.id,
      description: "Melt-in-mouth traditional Mysore Pak crafted with pure desi ghee",
      ratingAvg: 4.8,
      ratingCount: 112,
      tag: ProductTag.best_seller,
      imageUrl: "/images/sweet-2.jpg",
      variants: [
        { weightLabel: "250g", price: 320, stockQty: 60, sku: "MP-250" },
        { weightLabel: "500g", price: 600, discountedPrice: 560, stockQty: 50, sku: "MP-500" },
        { weightLabel: "1kg", price: 1100, discountedPrice: 999, stockQty: 35, sku: "MP-1000" },
      ],
    },
    {
      name: "Royal Gujarati Mixture & Samosa Combo",
      slug: "samosa-namkeen-combo",
      categoryId: catMixture.id,
      description: "Crispy min-samosas paired with authentic spicy Gujarati namkeen mixture",
      ratingAvg: 4.7,
      ratingCount: 144,
      tag: ProductTag.combo,
      imageUrl: "/images/sweet-3.jpg",
      variants: [
        { weightLabel: "250g", price: 280, stockQty: 70, sku: "SN-250" },
        { weightLabel: "500g", price: 520, discountedPrice: 470, stockQty: 65, sku: "SN-500" },
        { weightLabel: "1kg", price: 950, discountedPrice: 860, stockQty: 40, sku: "SN-1000" },
      ],
    },
    {
      name: "Dry Fruit Mix Super Premium Box",
      slug: "dry-fruit-mix-premium",
      categoryId: catDryFruits.id,
      description: "Assorted hand-picked cashews, California almonds, pistachios & raisins",
      ratingAvg: 4.9,
      ratingCount: 230,
      tag: ProductTag.premium,
      imageUrl: "/images/sweet-4.jpg",
      variants: [
        { weightLabel: "250g", price: 750, stockQty: 40, sku: "DF-250" },
        { weightLabel: "500g", price: 1400, discountedPrice: 1200, stockQty: 35, sku: "DF-500" },
        { weightLabel: "1kg", price: 2600, discountedPrice: 2250, stockQty: 25, sku: "DF-1000" },
      ],
    },
    {
      name: "Kesar Mawa Penda",
      slug: "kesar-mawa-penda",
      categoryId: catPenda.id,
      description: "Soft saffron enriched mawa penda garnished with pistachios",
      ratingAvg: 4.6,
      ratingCount: 87,
      tag: ProductTag.new_arrival,
      imageUrl: "/images/sweet-5.jpg",
      variants: [
        { weightLabel: "250g", price: 340, stockQty: 55, sku: "KP-250" },
        { weightLabel: "500g", price: 650, discountedPrice: 599, stockQty: 50, sku: "KP-500" },
        { weightLabel: "1kg", price: 1250, stockQty: 30, sku: "KP-1000" },
      ],
    },
    {
      name: "Sugarless Anjeer Khajur Barfi",
      slug: "sugarless-anjeer-khajur-barfi",
      categoryId: catSugarless.id,
      description: "100% natural sugarless sweet made from dates, figs, and crunchy nuts",
      ratingAvg: 4.8,
      ratingCount: 95,
      tag: ProductTag.premium,
      imageUrl: "/images/sweet-6.jpg",
      variants: [
        { weightLabel: "250g", price: 520, stockQty: 40, sku: "SL-250" },
        { weightLabel: "500g", price: 980, discountedPrice: 899, stockQty: 35, sku: "SL-500" },
        { weightLabel: "1kg", price: 1850, discountedPrice: 1699, stockQty: 20, sku: "SL-1000" },
      ],
    },
    {
      name: "Crispy Methi & Masala Khakhra Pack",
      slug: "crispy-methi-masala-khakhra",
      categoryId: catKhakhra.id,
      description: "Authentic roasted whole wheat khakhra with fenugreek and Gujarati spices",
      ratingAvg: 4.7,
      ratingCount: 165,
      tag: ProductTag.new_arrival,
      imageUrl: "/images/sweet-7.jpg",
      variants: [
        { weightLabel: "250g", price: 180, stockQty: 80, sku: "KH-250" },
        { weightLabel: "500g", price: 340, stockQty: 75, sku: "KH-500" },
        { weightLabel: "1kg", price: 620, discountedPrice: 560, stockQty: 60, sku: "KH-1000" },
      ],
    },
    {
      name: "Ratlami & Thin Nylon Sev Pack",
      slug: "ratlami-nylon-sev-pack",
      categoryId: catSev.id,
      description: "Spicy Ratlami sev blended with fine crunchy nylon sev",
      ratingAvg: 4.8,
      ratingCount: 198,
      tag: ProductTag.best_seller,
      imageUrl: "/images/sweet-8.jpg",
      variants: [
        { weightLabel: "250g", price: 160, stockQty: 90, sku: "SV-250" },
        { weightLabel: "500g", price: 300, stockQty: 85, sku: "SV-500" },
        { weightLabel: "1kg", price: 580, discountedPrice: 520, stockQty: 70, sku: "SV-1000" },
      ],
    },
    {
      name: "Assorted Turkish Chocolate Baklava",
      slug: "assorted-turkish-baklava",
      categoryId: catBaklava.id,
      description: "Layered filo pastry with pistachio, Belgian chocolate & honey syrup",
      ratingAvg: 4.9,
      ratingCount: 142,
      tag: ProductTag.premium,
      imageUrl: "/images/sweet-9.jpg",
      variants: [
        { weightLabel: "250g", price: 650, stockQty: 35, sku: "BK-250" },
        { weightLabel: "500g", price: 1200, discountedPrice: 1050, stockQty: 30, sku: "BK-500" },
        { weightLabel: "1kg", price: 2300, discountedPrice: 2000, stockQty: 15, sku: "BK-1000" },
      ],
    },
    {
      name: "Royal Festive Sweet & Namkeen Box (Grand Pack)",
      slug: "royal-festive-gift-box",
      categoryId: catCorporate.id,
      description: "Luxury corporate gift box containing Kaju Katli, Baklava, Dry Fruits & Savories",
      ratingAvg: 5.0,
      ratingCount: 310,
      tag: ProductTag.premium,
      imageUrl: "/images/sweet-10.jpg",
      variants: [
        { weightLabel: "1kg", price: 1499, stockQty: 50, sku: "GB-1000" },
        { weightLabel: "2kg", price: 2899, discountedPrice: 2499, stockQty: 40, sku: "GB-2000" },
      ],
    },
  ];

  for (const item of productsData) {
    const existing = await prisma.product.findUnique({ where: { slug: item.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          categoryId: item.categoryId,
          description: item.description,
          ratingAvg: item.ratingAvg,
          ratingCount: item.ratingCount,
          tag: item.tag,
          isActive: true,
          productImages: {
            create: [{ imageUrl: item.imageUrl, sortOrder: 0 }],
          },
          variants: {
            create: item.variants,
          },
        },
      });
      console.log(`Created product: ${item.name}`);
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: { categoryId: item.categoryId },
      });
      console.log(`Updated product category for: ${item.name}`);
    }
  }

  console.log("Database catalog seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
