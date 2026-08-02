import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function run() {
  try {
    const passwordHash = bcrypt.hashSync("admin1234", 10);
    const custHash = bcrypt.hashSync("customer1234", 10);

    // Insert Seed Admin
    await prisma.$executeRawUnsafe(`
      INSERT INTO admins (id, name, email, phone, password_hash, role)
      VALUES ('admin-seed-1', 'Admin Owner', 'admin@vardayinisweets.com', '+91 98765 43210', '${passwordHash}', 'admin')
      ON DUPLICATE KEY UPDATE name='Admin Owner', password_hash='${passwordHash}';
    `);
    console.log("SUCCESS: Seeded Admin into 'admins' table!");

    // Insert Seed Customer User
    await prisma.$executeRawUnsafe(`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES ('user-cust-1', 'Pratik Sukhadiya', 'pratik.sukhadiya@example.com', '+91 98765 43210', '${custHash}', 'customer')
      ON DUPLICATE KEY UPDATE name='Pratik Sukhadiya', password_hash='${custHash}';
    `);
    console.log("SUCCESS: Seeded Customer into 'users' table!");

  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
