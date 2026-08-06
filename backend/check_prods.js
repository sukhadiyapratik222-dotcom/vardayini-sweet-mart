const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    include: { category: true, variants: true, productImages: true }
  });
  console.log("Total Products in DB:", prods.length);
  prods.forEach(p => console.log(`ID: ${p.id} | Name: ${p.name} | Category: ${p.category?.name} | Active: ${p.isActive}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
