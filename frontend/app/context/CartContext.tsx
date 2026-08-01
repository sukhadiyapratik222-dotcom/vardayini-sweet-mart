'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { products as localProducts } from '../data';

export interface CartItem {
  id: string;
  productVariantId: string;
  quantity: number;
  productVariant?: {
    id: string;
    weightLabel: string;
    price: number;
    discountedPrice?: number;
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
  addToCart: (productVariantId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getCartCount: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const FREE_DELIVERY_THRESHOLD = 1000;
const BULK_DISCOUNT_THRESHOLD = 5000;
const BULK_DISCOUNT_PERCENT = 5;

const VALID_COUPONS: Record<string, number> = {
  SWEET10: 10,
  FESTIVE5: 5,
  GIFT15: 15,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartTotals | null>(null);
  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

    let couponPercent = 0;
    if (couponCode && VALID_COUPONS[couponCode.toUpperCase()]) {
      couponPercent = VALID_COUPONS[couponCode.toUpperCase()];
    }

    const couponDiscountAmount = (subtotal * couponPercent) / 100;
    const bulkDiscountAmount = subtotal >= BULK_DISCOUNT_THRESHOLD ? (subtotal * BULK_DISCOUNT_PERCENT) / 100 : 0;
    const discountAmount = couponDiscountAmount + bulkDiscountAmount;
    const discountPercent = subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;

    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || itemCount === 0 ? 0 : 100;
    const amountForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    const total = Math.max(0, subtotal - discountAmount + deliveryFee);

    return {
      subtotal,
      discountAmount,
      discountPercent,
      appliedCoupon: couponCode,
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
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);

      const response = await fetch(`${API_BASE}/cart?${params}`, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setCart(calculateCart(data.items, appliedCoupon));
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      // API offline
    }

    // Fallback local cart initialization
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vardayini_cart');
        if (stored) {
          const parsed = JSON.parse(stored) as CartItem[];
          setLocalItems(parsed);
          setCart(calculateCart(parsed, appliedCoupon));
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    // Default sample item if completely empty
    const initialItem: CartItem = {
      id: 'cart-item-1',
      productVariantId: 'sweet-1-500g',
      quantity: 1,
      productVariant: {
        id: 'sweet-1-500g',
        weightLabel: '500g',
        price: 850,
        discountedPrice: 799,
        product: {
          id: 'sweet-1',
          name: 'Royal Kaju Katli',
          slug: 'royal-kaju-katli',
          imageUrls: ['/images/sweet-1.jpg'],
        },
      },
    };

    setLocalItems([initialItem]);
    setCart(calculateCart([initialItem], appliedCoupon));
    setLoading(false);
  };

  const saveLocalItems = (items: CartItem[], couponCode = appliedCoupon) => {
    setLocalItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vardayini_cart', JSON.stringify(items));
    }
    setCart(calculateCart(items, couponCode));
  };

  const addToCart = async (productVariantId: string, quantity: number) => {
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
        setCart(calculateCart(data.items, appliedCoupon));
        setLoading(false);
        return;
      }
    } catch (error) {
      // Local fallback
    }

    // Local cart addition logic
    let updated = [...localItems];
    const existingIdx = updated.findIndex((i) => i.productVariantId === productVariantId || i.id === productVariantId);

    if (existingIdx >= 0) {
      updated[existingIdx].quantity += quantity;
    } else {
      // Construct item from local dataset if possible
      let matchedProduct: any = null;
      let matchedVariant: any = null;

      for (const p of localProducts) {
        for (const v of p.variants) {
          if (v.id === productVariantId || `${p.id}-${v.weight}` === productVariantId) {
            matchedProduct = p;
            matchedVariant = v;
            break;
          }
        }
        if (matchedProduct) break;
      }

      const newItem: CartItem = {
        id: `item-${Date.now()}`,
        productVariantId,
        quantity,
        productVariant: {
          id: productVariantId,
          weightLabel: matchedVariant?.weight || '500g',
          price: matchedVariant?.price || 500,
          discountedPrice: matchedVariant?.discountedPrice || matchedVariant?.price || 450,
          product: {
            id: matchedProduct?.id || 'prod',
            name: matchedProduct?.name || 'Vardayini Special Sweets',
            slug: matchedProduct?.slug || 'special-sweets',
            imageUrls: [matchedProduct?.image || '/images/sweet-1.jpg'],
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
        setCart(calculateCart(data.items, appliedCoupon));
        setLoading(false);
        return;
      }
    } catch (error) {
      // Local fallback
    }

    const updated = localItems.map((item) =>
      item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
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
        setCart(calculateCart(data.items, appliedCoupon));
        setLoading(false);
        return;
      }
    } catch (error) {
      // Local fallback
    }

    const updated = localItems.filter((item) => item.id !== itemId);
    saveLocalItems(updated);
    setLoading(false);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (VALID_COUPONS[cleanCode]) {
      setAppliedCoupon(cleanCode);
      setCart(calculateCart(localItems, cleanCode));
      return { success: true, message: `Coupon '${cleanCode}' applied! You get ${VALID_COUPONS[cleanCode]}% OFF.` };
    }
    return { success: false, message: `Invalid coupon code. Try SWEET10 or FESTIVE5.` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
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

