Radhe / Vardayinin Sweet Mart — Master Specification

Overview

This document spells out the recommended stack options and the full set of core modules/APIs to build the Radhe / Vardayinin Sweet Mart e‑commerce site (headless API + Next.js frontend). Use this as the module-by-module master prompt for implementation, migration and testing.

1) Stack options (summary & recommendation)

- Node.js + Express (REST)  
  - Pros: minimal, flexible, wide ecosystem, easy to integrate with Prisma and Next.js. Quick to iterate. Good for small/medium teams.  
  - Cons: you must design structure + conventions yourself; more wiring for batteries-included features.

- Node.js + NestJS (REST/GraphQL)  
  - Pros: opinionated, built-in modules, DI, nicer for large apps, easier to add role-based guards and testable services. Great for structured APIs and teams.
  - Cons: steeper learning curve vs Express.

- Django (Django REST Framework) / Laravel (PHP)  
  - Pros: full-stack frameworks with batteries included (auth, admin UI, ORM, migrations), fast to ship a robust backend. Good if team prefers Python/PHP.
  - Cons: different language/runtime than Node – adds context switching for Next.js frontend teams.

- WordPress + WooCommerce (CMS style)  
  - Pros: best choice if business wants a familiar CMS, non-technical editors, and an out-of-the-box store + admin UI. Matches many existing sites.  
  - Cons: heavier, plugin security maintenance, less tailored API design; scaling and custom pricing rules can be more work.

Recommendation: If you want tight integration with the existing Next.js frontend and a modern developer DX, use Node.js with Prisma + MySQL and either Express (small team / fast) or NestJS (bigger codebase / better structure). For CMS-style editing + non-technical editors, consider WordPress + WooCommerce as an alternative.

2) Core modules & API surface (module-by-module)

Auth
- Features: register (email | phone + OTP), login, JWT sessions, refresh tokens (optional), password reset, profile, roles (admin), `me` endpoint.
- Endpoints:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/login-otp (start)
  - POST /api/auth/verify-otp (verify)
  - POST /api/auth/refresh
  - POST /api/auth/forgot-password
  - POST /api/auth/reset-password
  - GET /api/auth/me

Product Catalog & Category Navigation
- Features: hierarchical categories, products with variants (weight / sku / price / discountedPrice), images, tags (best_seller, new_arrival, premium, combo), product search and featured lists.
- Endpoints:
  - GET /api/categories
  - GET /api/categories/:slug
  - GET /api/categories/:slug/products?page=&limit=&search=&sort=
  - GET /api/products?page=&limit=&category=&search=&sort=
  - GET /api/products/featured?type=best_seller|new_arrival|premium
  - GET /api/products/search?q=
  - GET /api/products/:slug
  - POST /api/admin/products
  - PUT /api/admin/products/:id
  - DELETE /api/admin/products/:id

Cart & Pricing
- Features: session or user-based cart, add/remove/update items (productVariant id + quantity), coupon application, subtotal/tax/delivery calculation, free-delivery rules, rounding rules.
- Endpoints:
  - GET /api/cart (session or user)
  - POST /api/cart (add/update) { productVariantId, quantity }
  - PUT /api/cart/:itemId { quantity }
  - DELETE /api/cart/:itemId
  - POST /api/cart/apply-coupon { code }
  - POST /api/cart/calculate  (returns breakdown)

Orders & Checkout
- Features: create order from cart, handle address selection, delivery slot validation, generate order number, order lifecycle (pending, confirmed, shipped, delivered, cancelled), order history.
- Endpoints:
  - POST /api/orders  (create + payment intent)
  - GET /api/orders (user or admin filter)
  - GET /api/orders/:orderNumber
  - POST /api/orders/:orderNumber/cancel
  - PUT /api/orders/:orderNumber/status (admin)

Payment Gateway (Razorpay recommended)
- Features: create payment intent, client-side integration (Razorpay), server-side verification, webhook endpoint for payment success/failure.
- Endpoints:
  - POST /api/payments/razorpay/create-order
  - POST /api/payments/webhook (verify signature)

Inventory Management
- Features: stock per variant, decrement during order capture, configurable low-stock threshold and alerting (email/SMS), safe concurrency handling (DB transactions / optimistic locking).
- Endpoints:
  - GET /api/inventory/variants/:id
  - PUT /api/inventory/variants/:id (admin)
  - GET /api/inventory/low-stock (admin)

Store Locator
- Features: CRUD for outlets, geo-coordinates, store hours, search by city/pincode, nearest store lookup (Haversine).
- Endpoints:
  - GET /api/stores
  - GET /api/stores/:id
  - POST /api/admin/stores
  - PUT /api/admin/stores/:id
  - DELETE /api/admin/stores/:id

Reviews & Ratings
- Features: create review (authenticated), rating aggregation, list reviews for product.
- Endpoints:
  - POST /api/reviews
  - GET /api/reviews/product/:productId

Wishlist
- Features: user-only wishlist CRUD, unique (userId, productId) constraint.
- Endpoints:
  - POST /api/wishlist
  - GET /api/wishlist
  - DELETE /api/wishlist/:id

Notifications & Emails (SendGrid) and SMS (Twilio)
- Features: transactional emails for order creation, order status updates, password resets; SMS OTP for phone login and order updates.
- Endpoints / hooks:
  - Use background job queue (BullMQ / Redis) to send emails & SMS asynchronously.

Admin / CMS APIs
- Features: manage products/categories/banners/blogs/coupons/combos/spin-wheel campaigns, user management, order management, reports.
- Endpoints: mirror admin CRUD for main resources (prefix /api/admin/*). Protect with admin-only JWT and CSRF for UI actions.

Search (optional: Elasticsearch / Algolia)
- Features: full-text product search, autocomplete, typo-tolerance, faceted filters.
- Implementation options:
  - Algolia: easiest to integrate for instant search UX (sync product data from backend to Algolia index).
  - Elasticsearch: self-hosted more control and cheaper at scale.

Analytics & Marketing
- Features: GTM / GA4 e-commerce events: view_item, view_item_list, add_to_cart, begin_checkout, purchase.
- Implementation:
  - Frontend fires events to GTM/GA4; backend may send server-side purchase events for reliability.

3) MySQL / Prisma notes (since you requested MySQL schema)
- Use Prisma (already present in repo) with MySQL datasource. Ensure `DATABASE_URL` points to MySQL:  
  mysql://USER:PASSWORD@HOST:PORT/DATABASE
- Use Decimal types for currency (Prisma + MySQL): Prisma `Decimal` with @db.Decimal(10,2) for prices and totals.
- Migrations: `prisma migrate dev --name init` (local). For production, use `prisma migrate deploy`.

4) Security checklist
- Use HTTPS in production (TLS).  
- JWT best practices: short-lived access JWT, refresh tokens stored securely (httpOnly cookie).  
- Rate limiting: apply per-IP and per-account limits for sensitive endpoints (auth, password reset).  
- Input validation: use a validated schema (Zod / Joi / class-validator).  
- CSRF: protect admin UI routes and state-changing endpoints if using cookies.  
- PCI: do not store raw card data. Use payment gateway tokenization and webhooks.  
- Sanitize HTML for blog content and user-generated content.

5) Dev & infra recommendations
- Background worker: BullMQ (Redis) or serverless worker for emails/SMS and long-running tasks.
- Caching: Redis for sessions, cart-resolve, rate limits, and search caching.  
- Logs & error tracking: Sentry, structured logs (JSON), daily backup for DB.
- Deployment: containerized images (Docker), or platform like Vercel (frontend) + Render/Heroku/Azure/AWS ECS for backend.

6) Implementation next steps (practical tasks you can run now)
- Confirm stack choice (Express vs NestJS vs WordPress).  
- Ensure `DATABASE_URL` is set to a MySQL instance and run `prisma generate` + `prisma migrate dev` then `npm run seed`.  
- Create an admin user in DB (`isAdmin = true`) so admin API calls can be exercised.  
- (Optional) Create a simple admin UI at `frontend/app/admin` that consumes `/api/admin/*` endpoints.

7) Example minimal admin UI tasks (optional)
- `GET /api/admin/products` (list)
- `POST /api/admin/products` (create) — send JSON with `variants` payload
- `PUT /api/admin/products/:id` (update)

If you'd like, I can:
- Generate a small `frontend/app/admin` scaffold with product list/create forms that call the admin API, or
- Create Postman/Insomnia collection of the API endpoints, or
- Run Prisma migration and create an admin user in the DB for testing.

Tell me which follow-up you'd like and I'll proceed with the next step.