import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function run() {
  try {
    // Drop foreign keys if existing
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE addresses DROP FOREIGN KEY addresses_ibfk_1;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE carts DROP FOREIGN KEY carts_ibfk_1;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE reviews DROP FOREIGN KEY reviews_ibfk_1;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE wishlists DROP FOREIGN KEY wishlists_ibfk_1;`);
    } catch (e) {}

    // Modify users.id column to VARCHAR(50)
    await prisma.$executeRawUnsafe(`ALTER TABLE users MODIFY id VARCHAR(50) NOT NULL;`);
    console.log("SUCCESS: Modified users.id column to VARCHAR(50) in MySQL!");

    const passwordHash = bcrypt.hashSync("admin1234", 10);
    const custHash = bcrypt.hashSync("customer1234", 10);

    // Insert Seed Admin in admins table
    await prisma.$executeRawUnsafe(`
      INSERT INTO admins (id, name, email, phone, password_hash, role)
      VALUES ('admin-seed-1', 'Admin Owner', 'admin@vardayinisweets.com', '+91 98765 43210', '${passwordHash}', 'admin')
      ON DUPLICATE KEY UPDATE name='Admin Owner', password_hash='${passwordHash}';
    `);
    console.log("SUCCESS: Seeded Admin into 'admins' table!");

    // Insert Seed Customer User in users table
    await prisma.$executeRawUnsafe(`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES ('user-cust-1', 'Pratik Sukhadiya', 'pratik.sukhadiya@example.com', '+91 98765 43210', '${custHash}', 'customer')
      ON DUPLICATE KEY UPDATE name='Pratik Sukhadiya', password_hash='${custHash}';
    `);
    console.log("SUCCESS: Seeded Customer into 'users' table!");

  } catch (err) {
    console.error("Fix error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
