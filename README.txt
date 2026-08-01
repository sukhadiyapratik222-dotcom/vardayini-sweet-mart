================================================================================
VARDAYINI SWEET MART — FULL STACK E-COMMERCE & ADMIN SYSTEM SETUP GUIDE
================================================================================

DIRECTORY STRUCTURE:
--------------------
/frontend         - Customer storefront Next.js App (React + Tailwind + TypeScript)
/admin            - Admin Dashboard Management Portal (/admin/products, /admin/login)
/backend          - Node.js Express Backend API (TypeScript + Prisma + MySQL)
/database         - DDL MySQL Database Schema file (schema.sql)
/.env.example     - Sample Environment File with DB & JWT secret keys

================================================================================
STEP-BY-STEP INSTALLATION & DEPLOYMENT INSTRUCTIONS (VPS / SHARED HOSTING)
================================================================================

1. MYSQL DATABASE SETUP:
------------------------
  a. Open phpMyAdmin or MySQL Command Line Interface on your server.
  b. Create a database named: vardayini_sweet_mart
  c. Import the database schema file:
     Import -> Choose File -> /database/schema.sql -> Go / Execute

2. BACKEND API SETUP & CONFIGURATION:
-------------------------------------
  a. Navigate to the backend directory:
     cd backend

  b. Install dependencies:
     npm install

  c. Create and configure your .env file:
     Copy .env.example to .env:
     
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_USER=root
     DB_PASS=your_mysql_password
     DB_NAME=vardayini_sweet_mart
     DATABASE_URL="mysql://root:your_mysql_password@127.0.0.1:3306/vardayini_sweet_mart"
     PORT=4000
     JWT_SECRET=vardayini_super_secret_jwt_key_2026_production
     NEXT_PUBLIC_API_URL=http://localhost:4000/api

  d. Build and run the Backend API server:
     npm run build
     npm run start
     (Or use PM2 for background process management: pm2 start dist/server.js --name "vardayini-backend")

3. FRONTEND & ADMIN DASHBOARD SETUP:
------------------------------------
  a. Open another terminal and navigate to the frontend directory:
     cd frontend

  b. Install dependencies:
     npm install

  c. Create .env.local file:
     NEXT_PUBLIC_API_URL=http://localhost:4000/api

  d. Build and start the Frontend & Admin Web Server:
     npm run build
     npm run start
     (Or use PM2: pm2 start npm --name "vardayini-frontend" -- start)

================================================================================
ADMIN DASHBOARD LOGIN & CREDENTIALS:
================================================================================
- URL: http://localhost:3000/admin/login
- Sign In or Register Admin Account:
  Email: admin@vardayini.com
  Password: adminpassword
  Admin Secret Key (Sign Up mode): ADMIN123

================================================================================
SYSTEM BEHAVIOR CONFIRMED:
================================================================================
✓ Live Product Updates: Products created/edited in Admin reflect instantly on Storefront.
✓ Inactive Product Guard: Products set to Inactive (isActive = false) are hidden immediately.
✓ Out of Stock Guard: 0 stock variants display "Out of Stock" button badge & disable checkout.
✓ Multi-Variant Pricing: Product cards display lowest variant price or price range.
✓ Category Delete Guard: Blocks deletion of categories with attached products.
================================================================================
