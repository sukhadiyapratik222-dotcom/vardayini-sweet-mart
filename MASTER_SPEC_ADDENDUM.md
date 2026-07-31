Requested Stack Options & Core Modules (Addendum)

Stack options:
- Node.js (Express/NestJS) or Django/Laravel — headless API
- WordPress + WooCommerce — CMS-style content editing (matches original site's stack)

Core modules / APIs to include:

- Auth: Register/login (email/phone + OTP), JWT sessions, password reset
- Product Catalog API: CRUD for products, categories, variants (weight/price), tags (Best Seller, New Arrival, Premium)
- Cart & Pricing API: Add/update/remove items, calculate subtotal, apply free-delivery/discount rules, coupon validation
- Order & Checkout API: Create order, address management, delivery slot/date logic, order status updates
- Payment Gateway Integration: Razorpay/PayU/Stripe (India-focused → Razorpay recommended), webhook handling for payment confirmation
- Inventory Management: Stock levels per variant, low-stock alerts
- Store Locator API: CRUD for outlet locations with geo-coordinates
- Reviews & Ratings API
- Wishlist API
- Notifications: Order confirmation/shipping emails & SMS (via SendGrid/Twilio)
- Admin/CMS APIs: Manage products, categories, banners, blog posts, combos/offers, coupon codes, spin-wheel campaign config
- Search API: Full-text/autocomplete product search (Elasticsearch or Algolia optional)
- Analytics hooks: GTM/GA4 event tracking for e-commerce (view_item, add_to_cart, purchase)

Security:
- Rate limiting
- Input validation
- HTTPS
- PCI-compliant payment handling (never store card data directly)
- CSRF protection for admin

Notes:
- This addendum reproduces your requested stack options, core module list, and security checklist verbatim. Merge into the main spec or keep as a separate quick-reference as you prefer.