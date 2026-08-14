'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { products as localProducts } from '../data';
import { trackAddToCart } from '../lib/analytics';

export interface CartItem {
  id: string;
  productVariantId: string;
  quantity: number;
  stockQty?: number;
  maxStock?: number;
  productVariant?: {
    id: string;
    weightLabel: string;
    price: number;
    discountedPrice?: number;
    stockQty?: number;
    product?: {
      id: string;
      name: string;
      slug: string;
      imageUrls: string[];
    };
  };
}

export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  appliedCoupon?: string | null;
  couponDiscountAmount: number;
  bulkDiscountAmount: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountForFreeDelivery: number;
  total: number;
  itemCount: number;
  items: CartItem[];
}

interface CartContextType {
  cart: CartTotals | null;
  loading: boolean;
  couponLoading: boolean;
  couponError: string | null;
  addToCart: (productVariantId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  getCartCount: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
import { getApiBaseUrl } from "../utils/apiConfig";

const API_BASE = getApiBaseUrl();

const FREE_DELIVERY_THRESHOLD = 1000;
const BULK_DISCOUNT_THRESHOLD = 4200;
const BULK_DISCOUNT_PERCENT = 5;

const validatedCouponsCache: Record<string, { type: string, value: number, minOrder: number }> = {};



export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartTotals | null>(null);
  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let sid = localStorage.getItem('sessionId');
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('sessionId', sid);
      }
      return sid;
    }
    return null;
  });

  // Calculate cart totals client side
  const calculateCart = useCallback((itemsList: CartItem[], couponCode: string | null): CartTotals => {
    let subtotal = 0;
    let itemCount = 0;

    itemsList.forEach((item) => {
      const price = Number(
        item.productVariant?.discountedPrice ?? item.productVariant?.price ?? 250
      );
      subtotal += price * item.quantity;
      itemCount += item.quantity;
    });

    let couponDiscountAmount = 0;
    let validCouponCode = couponCode;

    if (couponCode) {
      const cleanCode = couponCode.toUpperCase();
      const cached = validatedCouponsCache[cleanCode];
      
      if (cached) {
        if (cached.minOrder > 0 && subtotal < cached.minOrder) {
          validCouponCode = null;
        } else {
          if (cached.type === 'PERCENTAGE' || cached.type === 'percentage') {
            couponDiscountAmount = Math.round((subtotal * cached.value) / 100);
          } else {
            couponDiscountAmount = cached.value;
          }
        }
      }
    }
    const bulkDiscountAmount = subtotal >= BULK_DISCOUNT_THRESHOLD ? (subtotal * BULK_DISCOUNT_PERCENT) / 100 : 0;
    
    // Avoid double counting bulk discount if BULK coupon is applied
    const discountAmount = validCouponCode?.includes('BULK')
      ? couponDiscountAmount
      : couponDiscountAmount + bulkDiscountAmount;

    const discountPercent = subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;

    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || itemCount === 0 ? 0 : 100;
    const amountForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    const total = Math.max(0, subtotal - discountAmount + deliveryFee);

    return {
      subtotal,
      discountAmount,
      discountPercent,
      appliedCoupon: validCouponCode,
      couponDiscountAmount,
      bulkDiscountAmount,
      deliveryFee,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
      amountForFreeDelivery,
      total,
      itemCount,
      items: itemsList,
    };
  }, []);

  // Fetch or initialize cart
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    let loadedItems: CartItem[] = [];

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);

      const response = await fetch(`${API_BASE}/cart?${params}`, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          loadedItems = data.items;
        }
      }
    } catch (error) {
      // API offline
    }

    // Local cart initialization from localStorage
    if (loadedItems.length === 0 && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vardayini_cart');
        if (stored) {
          const parsed = JSON.parse(stored) as CartItem[];
          if (Array.isArray(parsed)) {
            // Filter out old pre-populated demo items
            loadedItems = parsed.filter(item => {
              const name = item.productVariant?.product?.name || '';
              const isOldDemo = item.id === 'cart-item-1' ||
                                item.productVariantId === 'sweet-1-500g' ||
                                (name === 'Royal Kaju Katli' && item.productVariant?.price === 850 && item.id === 'cart-item-1') ||
                                (name === 'Sugarless Anjeer Khajur Barfi' && item.quantity === 7) ||
                                (name === 'Vardayini Special Sweets' && item.productVariantId === 'sweet-1-500g');
              return !isOldDemo;
            });
            localStorage.setItem('vardayini_cart', JSON.stringify(loadedItems));
          }
        }
      } catch (e) {}
    }

    // Start with ONLY user-added items (empty if customer hasn't added items yet)
    setLocalItems(loadedItems);
    setCart(calculateCart(loadedItems, appliedCoupon));
    setLoading(false);
  };

  const saveLocalItems = (items: CartItem[], couponCode = appliedCoupon) => {
    setLocalItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vardayini_cart', JSON.stringify(items));
    }
    const newCart = calculateCart(items, couponCode);
    if (appliedCoupon && newCart.appliedCoupon === null) {
      setAppliedCoupon(null);
    }
    setCart(newCart);
  };

  const addToCart = async (productVariantId: string, quantity: number = 1, productData?: any) => {
    trackAddToCart({
      id: productVariantId,
      name: productData?.name || "Sweet Product Item",
      quantity,
    });

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productVariantId, quantity, sessionId }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setCart(calculateCart(data.items, appliedCoupon));
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      // Local fallback
    }

    // Local cart addition logic
    let matchedProduct: any = productData || null;
    let matchedVariant: any = null;

    if (matchedProduct && matchedProduct.variants && Array.isArray(matchedProduct.variants)) {
      matchedVariant = matchedProduct.variants.find((v: any) =>
        v.id === productVariantId || `${matchedProduct.id}-${v.weight}` === productVariantId
      ) || matchedProduct.variants[0];
    }

    // Search in localProducts if matchedProduct is not set
    if (!matchedProduct) {
      for (const p of localProducts) {
        if (p.id === productVariantId || p.slug === productVariantId) {
          matchedProduct = p;
          matchedVariant = p.variants[0];
          break;
        }
        for (const v of p.variants) {
          if (v.id === productVariantId || `${p.id}-${v.weight}` === productVariantId || v.sku === productVariantId) {
            matchedProduct = p;
            matchedVariant = v;
            break;
          }
        }
        if (matchedProduct) break;
      }
    }

    // Fallback search by string match in localProducts
    if (!matchedProduct && typeof productVariantId === 'string') {
      const lower = productVariantId.toLowerCase();
      matchedProduct = localProducts.find(p =>
        p.slug.toLowerCase().includes(lower) ||
        p.name.toLowerCase().includes(lower) ||
        lower.includes(p.slug.toLowerCase()) ||
        lower.includes(p.name.toLowerCase())
      );
      if (matchedProduct) {
        matchedVariant = matchedProduct.variants[0];
      }
    }

    // Extract exact title, image, price, weight, stock
    const itemTitle = matchedProduct?.name || productData?.name || 'Vardayini Sweets Item';
    const itemSlug = matchedProduct?.slug || productData?.slug || 'sweet-item';
    const itemImage = matchedProduct?.image || matchedProduct?.primaryImage || matchedProduct?.imageUrls?.[0] || productData?.image || '/images/sweet-1.jpg';
    const itemWeight = matchedVariant?.weight || matchedVariant?.weightLabel || '500g';
    const itemPrice = Number(matchedVariant?.price || productData?.price || 500);
    const itemDiscountedPrice = Number(matchedVariant?.discountedPrice || matchedVariant?.price || productData?.discountedPrice || productData?.price || itemPrice);
    const itemStock = Math.max(1, Number(matchedVariant?.stockQty ?? matchedVariant?.stock ?? productData?.stockQty ?? 50));

    let updated = [...localItems];
    const existingIdx = updated.findIndex((i) =>
      i.productVariantId === productVariantId ||
      i.id === productVariantId ||
      i.productVariant?.product?.name === itemTitle
    );

    if (existingIdx >= 0) {
      const nextQty = Math.min(itemStock, updated[existingIdx].quantity + quantity);
      updated[existingIdx].quantity = nextQty;
      updated[existingIdx].stockQty = itemStock;
      updated[existingIdx].maxStock = itemStock;
    } else {
      const newItem: CartItem = {
        id: `item-${Date.now()}`,
        productVariantId,
        quantity: Math.min(itemStock, quantity),
        stockQty: itemStock,
        maxStock: itemStock,
        productVariant: {
          id: productVariantId,
          weightLabel: itemWeight,
          price: itemPrice,
          discountedPrice: itemDiscountedPrice,
          stockQty: itemStock,
          product: {
            id: matchedProduct?.id || productData?.id || `prod-${Date.now()}`,
            name: itemTitle,
            slug: itemSlug,
            imageUrls: [itemImage],
          },
        },
      };
      updated.push(newItem);
    }

    saveLocalItems(updated);
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          setCart(calculateCart(data.items, appliedCoupon));
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      // Local fallback
    }

    const itemToUpdate = localItems.find((i) => i.id === itemId);
    const maxStock = (itemToUpdate as any)?.stockQty ?? (itemToUpdate as any)?.maxStock ?? itemToUpdate?.productVariant?.stockQty ?? 50;
    const cappedQty = Math.min(maxStock, Math.max(1, quantity));

    const updated = localItems.map((item) =>
      item.id === itemId ? { ...item, quantity: cappedQty, stockQty: maxStock, maxStock } : item
    );
    saveLocalItems(updated);
    setLoading(false);
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          setCart(calculateCart(data.items, appliedCoupon));
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      // Local fallback
    }

    const updated = localItems.filter((item) => item.id !== itemId);
    saveLocalItems(updated);
    setLoading(false);
  };

  const applyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const currentSubtotal = cart?.subtotal || 0;

    if (!cleanCode) {
      const errorMsg = "Invalid coupon code.";
      setCouponError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setCouponLoading(true);
    setCouponError(null);

    // Validate with backend API first to fetch exact rules & minOrderValue from MongoDB
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, subtotal: currentSubtotal, cartItems: localItems }),
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        const errorMsg = data.errors?.code || data.error || "Invalid coupon code.";
        setCouponError(errorMsg);
        setCouponLoading(false);
        return { success: false, message: errorMsg };
      }

      const discVal = Number(data.discountValue ?? data.coupon?.discountValue ?? 10);
      const minOrderVal = Number(data.minOrderValue ?? data.coupon?.minOrderValue ?? 0);

      if (minOrderVal > 0 && currentSubtotal < minOrderVal) {
        const remaining = minOrderVal - currentSubtotal;
        const errorMsg = `Add ₹${remaining.toLocaleString('en-IN')} more to use this coupon.`;
        setCouponError(errorMsg);
        setCouponLoading(false);
        return { success: false, message: errorMsg };
      }

      const discType = data.discountType || data.coupon?.discountType || 'PERCENTAGE';
      
      validatedCouponsCache[cleanCode] = {
        type: discType,
        value: discVal,
        minOrder: minOrderVal
      };

      setAppliedCoupon(cleanCode);
      setCart(calculateCart(localItems, cleanCode));
      setCouponLoading(false);
      return { success: true, message: `✓ Coupon ${cleanCode} applied` };
    } catch (err) {
      const errorMsg = "Unable to validate coupon. Please check your connection or try again later.";
      setCouponError(errorMsg);
      setCouponLoading(false);
      return { success: false, message: errorMsg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vardayini_applied_coupon');
    }
    setCart(calculateCart(localItems, null));
  };

  const getCartCount = () => {
    return cart?.itemCount || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        couponLoading,
        couponError,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        getCartCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
