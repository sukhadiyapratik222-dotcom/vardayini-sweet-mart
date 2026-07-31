const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultCategories = [
  { name: "Sweets", slug: "sweets" },
  { name: "Kaju", slug: "kaju" },
  { name: "Mawa", slug: "mawa" },
  { name: "Penda", slug: "penda" },
  { name: "Premium Packed", slug: "premium-packed" },
  { name: "Sugarless", slug: "sugarless" },
  { name: "Ghee Sweets", slug: "ghee-sweets" },
  { name: "Festival Sweets", slug: "festival-sweets" },
  { name: "City-Specific", slug: "city-specific" },
  { name: "Namkeen", slug: "namkeen" },
  { name: "Millet", slug: "millet" },
  { name: "Farali", slug: "farali" },
  { name: "Gujarati", slug: "gujarati" },
  { name: "Khakhra", slug: "khakhra" },
  { name: "Roasted", slug: "roasted" },
  { name: "Mixture", slug: "mixture" },
  { name: "Sev", slug: "sev" },
  { name: "Chips & Puris", slug: "chips-puris" },
  { name: "Bakery", slug: "bakery" },
  { name: "Biscuits/Cookies", slug: "biscuits-cookies" },
  { name: "Toast/Khari", slug: "toast-khari" },
  { name: "Mukhwas", slug: "mukhwas" },
  { name: "Dry Fruits & Nuts", slug: "dry-fruits-nuts" },
  { name: "Premium Baklava", slug: "premium-baklava" },
  { name: "Corporate Gift Boxes", slug: "corporate-gift-boxes" }
];

async function seed() {
  console.log('Seeding categories...');
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: { name: cat.name, slug: cat.slug },
      update: { name: cat.name }
    });
  }
  console.log('Categories seeded successfully!');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
