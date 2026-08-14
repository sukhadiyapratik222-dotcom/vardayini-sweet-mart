const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCollection(collectionName, fieldName = 'created_at') {
  try {
    const result = await prisma.$runCommandRaw({
      update: collectionName,
      updates: [
        {
          q: {
            $or: [
              { [fieldName]: null },
              { [fieldName]: { $exists: false } }
            ]
          },
          u: {
            $set: { [fieldName]: new Date() }
          },
          multi: true
        }
      ]
    });
    console.log(`Updated ${collectionName}:`, result);
  } catch (error) {
    console.error(`Error updating ${collectionName}:`, error.message);
  }
}

async function main() {
  console.log("Starting database cleanup for null/missing created_at fields...");
  await fixCollection('products');
  await fixCollection('users');
  await fixCollection('admins');
  await fixCollection('carts');
  await fixCollection('orders');
  await fixCollection('payments');
  await fixCollection('coupons');
  await fixCollection('reviews');
  await fixCollection('blog_posts');
  console.log("Cleanup complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
