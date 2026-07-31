import { Router } from "express";
import { prisma } from "../prisma";
import authRouter from "./auth";
import categoryRouter from "./categories";
import productRouter from "./products";
import adminProductRouter from "./adminProducts";
import cartRouter from "./cart";
import orderRouter from "./orders";
import storeRouter from "./stores";
import reviewRouter from "./reviews";
import wishlistRouter from "./wishlist";
import couponRouter from "./coupons";

export const router = Router();

router.get("/search", async (req, res) => {
	const query = String(req.query.q ?? "").trim();

	if (!query) {
		return res.json({ suggestions: [] });
	}

	const products = await prisma.product.findMany({
		where: {
			isActive: true,
			OR: [
				{ name: { contains: query } },
				{ description: { contains: query } }
			]
		},
		include: {
			category: true,
			variants: true,
			productImages: true
		},
		orderBy: [{ ratingCount: "desc" }, { ratingAvg: "desc" }, { createdAt: "desc" }],
		take: 8
	});

	res.json({
		suggestions: products.map((product) => ({
			...product,
			images: (product.productImages ?? []).map((image: any) => ({
				id: image.id,
				imageUrl: image.imageUrl,
				altText: image.altText,
				sortOrder: image.sortOrder
			})),
			primaryImage: product.productImages?.[0]?.imageUrl ?? "/images/sweet-1.jpg"
		}))
	});
});

router.use("/auth", authRouter);
router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/admin/products", adminProductRouter);
router.use("/cart", cartRouter);
router.use("/orders", orderRouter);
router.use("/stores", storeRouter);
router.use("/reviews", reviewRouter);
router.use("/wishlist", wishlistRouter);
router.use("/coupons", couponRouter);
