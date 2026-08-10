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

import adminRouter from "./admin/adminRoutes";

export const router = Router();

router.get("/health", async (_req, res) => {
	try {
		await prisma.$runCommandRaw({ ping: 1 });
		res.json({
			status: "ok",
			database: "connected",
			timestamp: new Date().toISOString()
		});
	} catch (error: any) {
		res.status(503).json({
			status: "error",
			database: "disconnected",
			error: error.message || "Database connectivity check failed"
		});
	}
});

router.get("/", (req, res) => {
	if ((req.headers.accept && req.headers.accept.includes("application/json")) || req.query.json === "true") {
		return res.json({
			status: "ok",
			message: "Vardayini Sweet Mart REST API v1.0",
			endpoints: {
				health: "/api/health",
				products: "/api/products",
				categories: "/api/categories",
				stores: "/api/stores",
				orders: "/api/orders",
				cart: "/api/cart",
				auth: "/api/auth",
				search: "/api/search?q=sweet",
				admin: "/api/admin",
				coupons: "/api/coupons"
			}
		});
	}

	res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vardayini Sweet Mart — Admin REST API Portal</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #07122A; color: #FAF7F0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .card { background: #0B1B3D; border: 2px solid #D4AF37; border-radius: 24px; max-width: 720px; width: 100%; padding: 36px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(212,175,55,0.3); padding-bottom: 20px; margin-bottom: 24px; }
        .badge { background: rgba(34,197,94,0.15); color: #4ADE80; border: 1px solid #22C55E; padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; }
        .badge-dot { width: 8px; height: 8px; background: #4ADE80; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #4ADE80; }
        h1 { color: #FFD700; font-size: 26px; font-weight: 900; margin-bottom: 4px; }
        p { color: #D4AF37; font-size: 13px; opacity: 0.9; }
        .cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 24px 0; }
        .cta-btn { background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%); color: #0B1B3D; text-decoration: none; padding: 14px; border-radius: 14px; font-weight: 900; font-size: 13px; text-align: center; transition: transform 0.2s; display: block; box-shadow: 0 4px 15px rgba(212,175,55,0.3); }
        .cta-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .cta-btn-alt { background: rgba(212,175,55,0.15); color: #FFD700; border: 1px solid #D4AF37; box-shadow: none; }
        .endpoints-title { font-size: 12px; text-transform: uppercase; font-weight: 800; color: #D4AF37; letter-spacing: 1px; margin-bottom: 14px; }
        .endpoint-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .endpoint-card { background: rgba(7,18,42,0.8); border: 1px solid rgba(212,175,55,0.25); padding: 12px 16px; border-radius: 14px; text-decoration: none; color: #FAF7F0; font-size: 13px; font-weight: 700; transition: border-color 0.2s, background 0.2s; }
        .endpoint-card:hover { border-color: #FFD700; background: rgba(212,175,55,0.1); color: #FFD700; }
        .endpoint-path { color: #FFD700; font-family: monospace; font-size: 11px; display: block; opacity: 0.85; margin-top: 3px; }
        .footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(212,175,55,0.2); text-align: center; font-size: 11px; color: #888; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <h1>Vardayini Sweet Mart</h1>
            <p>Admin REST API Control Center & Documentation</p>
          </div>
          <div class="badge">
            <span class="badge-dot"></span> API ONLINE & ACTIVE
          </div>
        </div>

        <div class="cta-grid">
          <a href="http://localhost:4000/admin" class="cta-btn">🔐 Open Admin Control Room Page</a>
          <a href="http://localhost:3000" class="cta-btn cta-btn-alt">🛒 Open Customer Storefront</a>
        </div>

        <div class="endpoints-title">Active Backend REST API Endpoints</div>
        <div class="endpoint-grid">
          <a href="/api/products" class="endpoint-card">
            📦 Product Catalog
            <span class="endpoint-path">GET /api/products</span>
          </a>
          <a href="/api/categories" class="endpoint-card">
            🏷️ Product Categories
            <span class="endpoint-path">GET /api/categories</span>
          </a>
          <a href="/api/stores" class="endpoint-card">
            🏬 Store Outlets
            <span class="endpoint-path">GET /api/stores</span>
          </a>
          <a href="/api/orders" class="endpoint-card">
            🛍️ Orders Management
            <span class="endpoint-path">GET /api/orders</span>
          </a>
          <a href="/api/coupons" class="endpoint-card">
            🎟️ Coupons & Discounts
            <span class="endpoint-path">GET /api/coupons</span>
          </a>
          <a href="/api/search?q=sweet" class="endpoint-card">
            🔍 Product Search API
            <span class="endpoint-path">GET /api/search?q=sweet</span>
          </a>
          <a href="/api/admin/products" class="endpoint-card">
            🔐 Admin Product Inventory
            <span class="endpoint-path">GET /api/admin/products</span>
          </a>
          <a href="/api/cart" class="endpoint-card">
            🛒 Shopping Cart API
            <span class="endpoint-path">GET /api/cart</span>
          </a>
          <a href="/api/auth/me" class="endpoint-card">
            👤 User Auth & Profile
            <span class="endpoint-path">GET /api/auth/me</span>
          </a>
          <a href="/api/home" class="endpoint-card">
            🏡 Homepage Banners
            <span class="endpoint-path">GET /api/home</span>
          </a>
          <a href="/api/reviews" class="endpoint-card">
            💬 Product Reviews
            <span class="endpoint-path">GET /api/reviews</span>
          </a>
          <a href="/api/wishlist" class="endpoint-card">
            ❤️ Wishlist API
            <span class="endpoint-path">GET /api/wishlist</span>
          </a>
        </div>

        <div class="footer">
          Vardayini Sweet Mart Since 1976 • Express API Server on Port 4000
        </div>
      </div>
    </body>
    </html>
  `);
});

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
		suggestions: products.map((product: any) => {
			const primaryImg = product.productImages?.[0]?.imageUrl ?? product.imageUrls?.[0] ?? product.primaryImage ?? product.image ?? "/images/sweet-1.jpg";
			return {
				...product,
				image: primaryImg,
				primaryImage: primaryImg,
				images: (product.productImages ?? []).map((image: any) => ({
					id: image.id,
					imageUrl: image.imageUrl,
					altText: image.altText,
					sortOrder: image.sortOrder
				}))
			};
		})
	});
});

import addressRouter from "./addresses";
import paymentRouter from "./payments";
import homeRouter from "./home";
import marketingRouter from "./marketing";
import uploadRouter from "./upload";
import blogsRouter from "./blogs";

router.use("/auth", authRouter);
router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/admin/products", adminProductRouter);
router.use("/admin", adminRouter);
router.use("/cart", cartRouter);
router.use("/orders", orderRouter);
router.use("/stores", storeRouter);
router.use("/reviews", reviewRouter);
router.use("/wishlist", wishlistRouter);
router.use("/coupons", couponRouter);
router.use("/addresses", addressRouter);
router.use("/payments", paymentRouter);
router.use("/home", homeRouter);
router.use("/spinwheel", marketingRouter);
router.use("/newsletter", marketingRouter);
router.use("/upload", uploadRouter);
router.use("/blogs", blogsRouter);
router.use("/blog", blogsRouter);
