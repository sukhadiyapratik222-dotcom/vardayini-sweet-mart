============================================================
VARDAYINI SWEET MART - MINIMAL SIGNUP PROOF OF CONCEPT (POC)
============================================================

This is a standalone, 100% working proof-of-concept for user registration 
connecting directly to your MySQL database.

------------------------------------------------------------
STEP 1: INSTALL BACKEND DEPENDENCIES
------------------------------------------------------------
Open PowerShell / Terminal in the `backend` folder and run:

  cd backend
  npm install express mysql2 bcryptjs cors dotenv

------------------------------------------------------------
STEP 2: IMPORT THE MYSQL DATABASE SCHEMA
------------------------------------------------------------
Run this SQL in phpMyAdmin, MySQL Workbench, or MySQL CLI:

  & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u user -p123 < database/schema.sql

Or in phpMyAdmin / MySQL Workbench SQL window:
  Open file: database/schema.sql and click EXECUTE.

------------------------------------------------------------
STEP 3: START THE EXPRESS BACKEND SERVER
------------------------------------------------------------
Inside the `backend` folder, run:

  node server.js

You will see:
  [DB] Connecting to MySQL database: vardayini_sweet_mart
  [DB] DATABASE CONNECTED OK
  ================================================
  Server running on port http://localhost:5000
  API Endpoint: http://localhost:5000/api/auth/register
  ================================================

------------------------------------------------------------
STEP 4: TEST THE SIGNUP FORM
------------------------------------------------------------
Open `frontend/signup.html` directly in your browser:
Double-click `frontend/signup.html` or open in Chrome:

  file:///C:/Users/sukha/OneDrive/Desktop/dec 2/New folder (2)/new project/frontend/signup.html

1. Enter Name: Test User
2. Enter Email: testuser@gmail.com
3. Enter Phone: 9876543210
4. Enter Password: 123456
5. Click [Sign Up]

------------------------------------------------------------
STEP 5: VERIFY IN MYSQL DATABASE DIRECTLY
------------------------------------------------------------
Run this query in phpMyAdmin or MySQL CLI to confirm data landed:

  SELECT * FROM users ORDER BY id DESC LIMIT 5;

You will see the new row with your hashed password!
