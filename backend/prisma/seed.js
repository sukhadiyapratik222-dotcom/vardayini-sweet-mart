"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const sweets = await prisma.category.upsert({
        where: { slug: "sweets" },
        create: { name: "Sweets", slug: "sweets" },
        update: {}
    });
    const namkeen = await prisma.category.upsert({
        where: { slug: "namkeen" },
        create: { name: "Namkeen", slug: "namkeen" },
        update: {}
    });
    const product1 = await prisma.product.upsert({
        where: { slug: "kaju-katli" },
        create: {
            name: "Kaju Katli",
            slug: "kaju-katli",
            description: "Premium kaju katli with rich cashew taste.",
            categoryId: sweets.id,
            imageUrls: ["/images/sweet-1.jpg"],
            tags: ["Best Seller", "Premium"],
            variants: {
                create: [
                    { weightLabel: "250g", price: 450, discountedPrice: 399, stockQty: 20, sku: "KK-250" },
                    { weightLabel: "500g", price: 850, discountedPrice: 760, stockQty: 14, sku: "KK-500" },
                    { weightLabel: "1kg", price: 1600, discountedPrice: 1450, stockQty: 10, sku: "KK-1000" }
                ]
            }
        },
        update: {}
    });
    await prisma.store.upsert({
        where: { id: "store-delhi-1" },
        create: {
            id: "store-delhi-1",
            name: "PremNiMithaas Delhi Outlet",
            address: "123 Chawri Bazar Rd, Old Delhi",
            city: "Delhi",
            pincode: "110006",
            latitude: 28.6500,
            longitude: 77.2300,
            phone: "+91 98765 43210"
        },
        update: {}
    });
}
main()
    .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
