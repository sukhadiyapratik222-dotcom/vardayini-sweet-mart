'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  getCartCount: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartTotals | null>(null);
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

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);

      const response = await fetch(
        `${API_BASE}/cart?${params}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productVariantId: string, quantity: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productVariantId,
          quantity,
          sessionId
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/items/${itemId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/items/${itemId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    } finally {
      setLoading(false);
    }
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
        getCartCount,
        isOpen,
        setIsOpen
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
