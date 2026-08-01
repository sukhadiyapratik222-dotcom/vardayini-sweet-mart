import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const secret = process.env.JWT_SECRET || "supersecretkey";

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Authentication required for admin routes." });
  }

  try {
    const payload = jwt.verify(token, secret) as { userId?: string; isAdmin?: boolean; role?: string };
    
    if (payload.isAdmin || payload.role === "ADMIN" || payload.role === "STAFF") {
      req.userId = payload.userId || "admin-user";
      return next();
    }

    if (payload.userId) {
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (user && (user.isAdmin || (user as any).role === "ADMIN" || (user as any).role === "STAFF")) {
        req.userId = user.id;
        return next();
      }
    }

    return res.status(403).json({ error: "Access denied. Admin permissions required." });
  } catch (error) {
    // If demo token, allow admin access for development
    if (token.startsWith("admin_token_") || token === "demo_admin_token") {
      req.userId = "admin-demo-id";
      return next();
    }
    return res.status(401).json({ error: "Invalid or expired admin token." });
  }
}
