import { PrismaClient } from "@prisma/client";

async function test(url: string) {
  console.log("Testing connection string:", url);
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    const result: any = await prisma.$queryRaw`SHOW DATABASES;`;
    console.log("SUCCESS! Available databases:", result);
    return true;
  } catch (err: any) {
    console.error("FAILED for:", url, err.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const urls = [
    "mysql://user:123@127.0.0.1:3306/vardayini_sweet_mart",
    "mysql://root:@127.0.0.1:3306/vardayini_sweet_mart",
    "mysql://root:root@127.0.0.1:3306/vardayini_sweet_mart",
    "mysql://root:admin@127.0.0.1:3306/vardayini_sweet_mart",
    "mysql://root:123456@127.0.0.1:3306/vardayini_sweet_mart",
    "mysql://user:123@127.0.0.1:3306/mysql",
    "mysql://root:@127.0.0.1:3306/mysql"
  ];

  for (const url of urls) {
    const ok = await test(url);
    if (ok) break;
  }
}

main();
