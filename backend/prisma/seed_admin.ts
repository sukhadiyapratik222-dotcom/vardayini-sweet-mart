import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Admin account in MySQL database...");

  const adminPasswordHash = bcrypt.hashSync("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@vardayinisweets.com" },
    create: {
      name: "Admin Officer",
      email: "admin@vardayinisweets.com",
      phone: "9876543210",
      passwordHash: adminPasswordHash,
      isAdmin: true,
      role: "admin",
    },
    update: {
      isAdmin: true,
      role: "admin",
      passwordHash: adminPasswordHash,
    },
  });

  // Also seed in Admin table if exists
  try {
    await (prisma as any).admin.upsert({
      where: { email: "admin@vardayinisweets.com" },
      create: {
        name: "Admin Officer",
        email: "admin@vardayinisweets.com",
        phone: "9876543210",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
      update: {
        passwordHash: adminPasswordHash,
      },
    });
  } catch (e) {}

  console.log(`✓ Admin user created/updated successfully: ${adminUser.email} (Key: 4220)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
