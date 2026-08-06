import { z } from "zod";

// Structured error response formatter
export function formatZodError(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "field";
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return { success: false, errors };
}

// 1. Product Schema
export const ProductCreateSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(120, "Product name cannot exceed 120 characters"),
  slug: z.string().optional(),
  categorySlug: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number greater than 0").optional(),
  weightLabel: z.string().optional(),
  imageUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  variants: z.array(
    z.object({
      weightLabel: z.string().min(1, "Variant weight label is required"),
      price: z.number().positive("Variant price must be greater than 0"),
      discountedPrice: z.number().positive("Discounted price must be greater than 0").optional().nullable(),
      stockQty: z.number().int("Stock quantity must be an integer").min(0, "Stock quantity cannot be negative"),
      sku: z.string().optional(),
    })
  ).optional(),
  isActive: z.boolean().optional(),
});

// 2. Coupon Schema
export const CouponSchema = z.object({
  code: z.string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(30, "Coupon code cannot exceed 30 characters")
    .regex(/^[A-Z0-9_-]+$/, "Coupon code must be uppercase alphanumeric"),
  discountPercent: z.number().min(1, "Discount percentage must be at least 1%").max(100, "Discount percentage cannot exceed 100%"),
  minPurchase: z.number().min(0, "Minimum order purchase cannot be negative"),
  expiryDate: z.string().optional(),
});

// 3. Store Schema
export const StoreSchema = z.object({
  name: z.string().min(3, "Store branch name must be at least 3 characters"),
  address: z.string().min(5, "Store address must be at least 5 characters"),
  city: z.string().min(2, "City name is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be a valid 6-digit Indian postal code"),
  phone: z.string().regex(/^[+\d\s-]{10,15}$/, "Valid phone number is required"),
});

// 4. Customer Schema
export const CustomerSchema = z.object({
  name: z.string().min(2, "Customer name must be at least 2 characters"),
  email: z.string().email("Invalid email address format"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian mobile number").optional().or(z.literal("")),
});

// 5. Order Status Update Schema with Regression Safeguard
export const OrderStatusSchema = z.object({
  status: z.enum(["Placed", "Packed", "Shipped", "Delivered", "Cancelled"]),
});

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  Placed: ["Packed", "Cancelled"],
  Packed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};
