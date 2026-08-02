import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const sweets = await prisma.category.upsert({
    where: { slug: "sweets" },
    create: { name: "Sweets", slug: "sweets" },
    update: {}
  });

  await prisma.category.upsert({
    where: { slug: "namkeen" },
    create: { name: "Namkeen", slug: "namkeen" },
    update: {}
  });

  await prisma.product.upsert({
    where: { slug: "kaju-katli" },
    create: {
      name: "Kaju Katli",
      slug: "kaju-katli",
      description: "Premium kaju katli with rich cashew taste.",
      categoryId: sweets.id,
      tag: "best_seller",
      variants: {
        create: [
          { weightLabel: "250g", price: 450, discountedPrice: 399, stockQty: 20, sku: "KK-250" },
          { weightLabel: "500g", price: 850, discountedPrice: 760, stockQty: 14, sku: "KK-500" },
          { weightLabel: "1kg", price: 1600, discountedPrice: 1450, stockQty: 10, sku: "KK-1000" }
        ]
      }
    },
    update: {}
  });

  await prisma.store.upsert({
    where: { id: "store-delhi-1" },
    create: {
      id: "store-delhi-1",
      name: "PremNiMithaas Delhi Outlet",
      address: "123 Chawri Bazar Rd, Old Delhi",
      city: "Delhi",
      pincode: "110006",
      latitude: 28.6500,
      longitude: 77.2300,
      phone: "+91 98765 43210"
    },
    update: {}
  });

  // Create seed Admin users in dedicated admins table
  await prisma.admin.upsert({
    where: { email: "admin@vardayinisweets.com" },
    create: {
      name: "Admin Owner",
      email: "admin@vardayinisweets.com",
      phone: "+91 98765 43210",
      passwordHash: bcrypt.hashSync("admin1234", 10),
      role: "admin"
    },
    update: { name: "Admin Owner", role: "admin" }
  });

  await prisma.admin.upsert({
    where: { email: "admin@local" },
    create: {
      name: "Admin",
      email: "admin@local",
      phone: null,
      passwordHash: bcrypt.hashSync("password", 10),
      role: "admin"
    },
    update: { role: "admin" }
  });

  // Seed default customer user
  await prisma.user.upsert({
    where: { email: "pratik.sukhadiya@example.com" },
    create: {
      name: "Pratik Sukhadiya",
      email: "pratik.sukhadiya@example.com",
      phone: "+91 98765 43210",
      passwordHash: bcrypt.hashSync("customer1234", 10),
      role: "customer"
    },
    update: { name: "Pratik Sukhadiya" }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
