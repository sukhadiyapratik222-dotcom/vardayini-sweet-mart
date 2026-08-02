import { PrismaClient } from "@prisma/client";

async function run() {
  const url = "mysql://user:123@127.0.0.1:3306/sweet_shop";
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });

  try {
    const result = await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(15) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
    `);
    console.log("SUCCESS! Created users table in sweet_shop database!", result);

    const usersCount = await prisma.user.count();
    console.log("Current users count in sweet_shop database:", usersCount);
  } catch (err: any) {
    console.error("ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
