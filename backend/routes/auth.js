const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('[AUTH] Signup route hit. Payload received:', req.body);

  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    console.warn('[AUTH] Validation failed: missing required fields');
    return res.status(400).json({
      error: 'All fields (name, email, phone, password) are required.'
    });
  }

  try {
    console.log('[AUTH] Hashing password for user:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID ? crypto.randomUUID() : 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    console.log('[AUTH] About to insert into users table:', { id: userId, name, email, phone });
    const [result] = await db.query(
      'INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
      [userId, name.trim(), email.trim(), phone.trim(), hashedPassword]
    );

    console.log('[AUTH] INSERT SUCCESS! User created with ID:', userId);

    return res.status(201).json({
      message: 'User registered successfully!',
      userId: userId,
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      }
    });

  } catch (err) {
    console.error('[AUTH] INSERT FAILED with MySQL error:', err.message);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        error: 'This email address or phone number is already registered.'
      });
    }

    return res.status(500).json({
      error: `Database insertion error: ${err.message}`
    });
  }
});

module.exports = router;
