import { PrismaClient } from "@prisma/client";

async function main() {
  const dbs = ["sweet_shop", "vardayini_sweet_mart", "test", "mysql", "sys", "shop", "store", "db", "app"];
  for (const db of dbs) {
    const url = `mysql://user:123@127.0.0.1:3306/${db}`;
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      await prisma.$connect();
      console.log("CONNECTED TO DATABASE:", db);
      const res = await prisma.$queryRaw`SHOW TABLES;`;
      console.log("Tables in", db, ":", res);
      await prisma.$disconnect();
      return;
    } catch (e: any) {
      console.log("Cannot connect to", db, ":", e.message);
      await prisma.$disconnect();
    }
  }
}

main();
