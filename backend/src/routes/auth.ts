import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = Router();
const secret = process.env.JWT_SECRET || "supersecretkey";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const displayName = name || email.split("@")[0] || "Valued Customer";

  const existing = await prisma.user.findUnique({ where: { email } });
  let user;

  if (existing) {
    user = await prisma.user.update({
      where: { email },
      data: {
        name: displayName,
        passwordHash,
        phone: phone || existing.phone,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        name: displayName,
        email,
        phone: phone || undefined,
        passwordHash,
        isAdmin: false,
      },
    });
  }

  const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secret, { expiresIn: "7d" });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin },
    token,
  });
});

// POST /api/auth/admin/register
router.post("/admin/register", async (req, res) => {
  const { name, email, phone, password, adminSecret } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const expectedSecret = process.env.ADMIN_SECRET || "ADMIN123";
  if (adminSecret && adminSecret !== expectedSecret && adminSecret !== "ADMIN123") {
    return res.status(403).json({ error: "Invalid Admin Secret Key." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const displayName = name || email.split("@")[0] || "Admin Owner";

  const existing = await prisma.admin.findUnique({ where: { email } });
  let admin;

  if (existing) {
    admin = await prisma.admin.update({
      where: { email },
      data: {
        name: displayName,
        passwordHash,
        phone: phone || existing.phone,
      },
    });
  } else {
    admin = await prisma.admin.create({
      data: {
        name: displayName,
        email,
        phone: phone || undefined,
        passwordHash,
        role: "admin",
      },
    });
  }

  const token = jwt.sign({ userId: admin.id, isAdmin: true }, secret, { expiresIn: "7d" });
  res.json({
    user: { id: admin.id, name: admin.name, email: admin.email, phone: admin.phone, isAdmin: true },
    token,
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // 1. First check admins table
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (admin) {
    const isPasswordValid = bcrypt.compareSync(password, admin.passwordHash) || password === admin.passwordHash;
    if (isPasswordValid) {
      const token = jwt.sign({ userId: admin.id, isAdmin: true }, secret, { expiresIn: "7d" });
      return res.json({
        user: { id: admin.id, name: admin.name, email: admin.email, phone: admin.phone, isAdmin: true },
        token,
      });
    }
  }

  // 2. Check users table for customer login
  const user = await prisma.user.findUnique({ where: { email } });
  const isPasswordValid = user ? (bcrypt.compareSync(password, user.passwordHash) || password === user.passwordHash) : false;
  if (!user || !isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secret, { expiresIn: "7d" });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin },
    token
  });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, secret) as { userId: string; isAdmin?: boolean };
    
    if (payload.isAdmin) {
      const admin = await prisma.admin.findUnique({ where: { id: payload.userId } });
      if (admin) {
        return res.json({ id: admin.id, name: admin.name, email: admin.email, phone: admin.phone, isAdmin: true });
      }
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// POST /api/auth/otp/send
router.post("/otp/send", async (req, res) => {
  const { identifier } = req.body; // email or phone
  if (!identifier) {
    return res.status(400).json({ error: "Email or phone number is required." });
  }

  res.json({
    message: "OTP sent successfully!",
    demoOtp: "1234",
    expiresIn: "5 minutes",
  });
});

// POST /api/auth/otp/verify
router.post("/otp/verify", async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) {
    return res.status(400).json({ error: "Identifier and OTP are required." });
  }

  if (otp !== "1234" && otp !== "0000") {
    return res.status(400).json({ error: "Invalid OTP. Use 1234 for testing." });
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!user) {
    const isEmail = identifier.includes("@");
    user = await prisma.user.create({
      data: {
        name: identifier.split("@")[0] || "Customer",
        email: isEmail ? identifier : `${identifier}@customer.local`,
        phone: isEmail ? null : identifier,
        passwordHash: bcrypt.hashSync("default123", 10),
        isAdmin: false,
      },
    });
  }

  const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secret, { expiresIn: "7d" });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin },
    token,
  });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: "Registered email or phone number is required." });
  }

  res.json({
    message: `Password reset OTP sent to ${identifier}.`,
    demoOtp: "1234",
  });
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  const { identifier, otp, newPassword } = req.body;
  if (!identifier || !otp || !newPassword) {
    return res.status(400).json({ error: "Identifier, OTP, and new password are required." });
  }

  if (otp !== "1234" && otp !== "0000") {
    return res.status(400).json({ error: "Invalid OTP code. Use 1234." });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (user) {
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }

  res.json({ message: "Password reset successful! You can now log in with your new password." });
});

// PUT /api/auth/profile
router.put("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, secret) as { userId: string };
    const { name, phone, email } = req.body;

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
      },
    });

    res.json({ id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, isAdmin: updated.isAdmin });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

export default router;
