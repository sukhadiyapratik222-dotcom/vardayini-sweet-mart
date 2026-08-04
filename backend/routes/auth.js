const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_vardayini_2026';
const ADMIN_SECRET = process.env.ADMIN_SECRET || '4220';

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login  (Customer + Admin login)
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  console.log('[AUTH] Login route hit. Payload:', req.body);
  const { email, password, isAdminLogin, adminSecret } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    if (isAdminLogin) {
      // ── Admin login ──────────────────────────────────────────
      if (!adminSecret || adminSecret.trim() !== ADMIN_SECRET) {
        return res.status(403).json({ error: 'Invalid Admin Secret Key.' });
      }

      const [rows] = await db.query(
        'SELECT * FROM admins WHERE email = ?',
        [email.trim()]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'No admin account found with this email.' });
      }

      const admin = rows[0];
      const passwordMatch = await bcrypt.compare(password, admin.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Incorrect password.' });
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('[AUTH] Admin login SUCCESS:', admin.email);
      return res.json({
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'admin',
          isAdmin: true,
        },
      });

    } else {
      // ── Customer login ───────────────────────────────────────
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email.trim()]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'No account found with this email.' });
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Incorrect password.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'customer' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('[AUTH] Customer login SUCCESS:', user.email);
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role || 'customer',
        },
      });
    }

  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register  (Customer registration)
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  console.log('[AUTH] Customer register route hit. Payload:', req.body);
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields (name, email, phone, password) are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID ? crypto.randomUUID() : 'usr_' + Date.now();

    await db.query(
      'INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
      [userId, name.trim(), email.trim(), phone.trim(), hashedPassword]
    );

    console.log('[AUTH] Customer registered:', email);
    return res.status(201).json({
      message: 'User registered successfully!',
      userId,
      user: { id: userId, name: name.trim(), email: email.trim(), phone: phone.trim() },
    });

  } catch (err) {
    console.error('[AUTH] Register error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'This email or phone number is already registered.' });
    }
    return res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/admin/register  (Admin registration)
// ─────────────────────────────────────────────────────────────
router.post('/admin/register', async (req, res) => {
  console.log('[AUTH] Admin register route hit. Payload:', req.body);
  const { name, email, phone, password, adminSecret } = req.body;

  if (!adminSecret || adminSecret.trim() !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid Admin Secret Key. Access denied.' });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminId = crypto.randomUUID ? crypto.randomUUID() : 'adm_' + Date.now();

    await db.query(
      'INSERT INTO admins (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [adminId, name.trim(), email.trim(), phone ? phone.trim() : null, hashedPassword, 'admin']
    );

    console.log('[AUTH] Admin registered:', email);

    const token = jwt.sign(
      { id: adminId, email: email.trim(), role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Admin account created successfully!',
      token,
      user: {
        id: adminId,
        name: name.trim(),
        email: email.trim(),
        role: 'admin',
        isAdmin: true,
      },
    });

  } catch (err) {
    console.error('[AUTH] Admin register error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'An admin with this email or phone already exists.' });
    }
    return res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

module.exports = router;
