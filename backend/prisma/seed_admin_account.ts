import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync("admin123", 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: "admin@vardayinisweets.com" },
    update: {
      name: "Admin Owner",
      passwordHash,
      phone: "+91 98765 43210",
      role: "admin"
    },
    create: {
      id: "admin-owner-1",
      name: "Admin Owner",
      email: "admin@vardayinisweets.com",
      phone: "+91 98765 43210",
      passwordHash,
      role: "admin"
    }
  });

  console.log("SUCCESS: Admin account seeded into sweet_shop.admins table!", admin);
}

main().catch(console.error).finally(() => prisma.$disconnect());
