import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding default coupons into MySQL database...");

  const initialCoupons = [
    { code: "SWEET10", discountValue: 10, minOrderValue: 500 },
    { code: "FESTIVE5", discountValue: 5, minOrderValue: 1000 },
    { code: "GIFT15", discountValue: 15, minOrderValue: 2500 },
    { code: "SPIN10-1001", discountValue: 10, minOrderValue: 0 },
    { code: "FREESHIP-2002", discountValue: 100, minOrderValue: 0 },
  ];

  for (const c of initialCoupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      create: {
        code: c.code,
        discountType: "PERCENTAGE",
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
        usageLimit: 100,
      },
      update: {
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
      },
    });
    console.log(`Seeded coupon: ${c.code}`);
  }

  console.log("Coupons seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
