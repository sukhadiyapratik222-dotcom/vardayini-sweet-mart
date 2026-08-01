// Google Analytics & GTM Event Hooks Utility

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track Product View Event (view_item)
 */
export function trackViewItem(product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
}) {
  if (typeof window === "undefined") return;

  const itemPayload = {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category || "Sweets",
    price: product.price || 0,
    currency: "INR",
  };

  // 1. Google Analytics Event
  if (typeof window.gtag === "function") {
    window.gtag("event", "view_item", {
      currency: "INR",
      value: product.price || 0,
      items: [itemPayload],
    });
  }

  // 2. Google Tag Manager DataLayer
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "view_item",
      ecommerce: {
        currency: "INR",
        value: product.price || 0,
        items: [itemPayload],
      },
    });
  }
}

/**
 * Track Add to Cart Event (add_to_cart)
 */
export function trackAddToCart(item: {
  id: string;
  name: string;
  category?: string;
  price?: number;
  quantity?: number;
}) {
  if (typeof window === "undefined") return;

  const qty = item.quantity || 1;
  const price = item.price || 0;

  const itemPayload = {
    item_id: item.id,
    item_name: item.name,
    item_category: item.category || "Sweets",
    price,
    quantity: qty,
    currency: "INR",
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", "add_to_cart", {
      currency: "INR",
      value: price * qty,
      items: [itemPayload],
    });
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "INR",
        value: price * qty,
        items: [itemPayload],
      },
    });
  }
}

/**
 * Track Purchase Event (purchase)
 */
export function trackPurchase(order: {
  orderId: string;
  total: number;
  items?: Array<{ id: string; name: string; price: number; quantity: number }>;
}) {
  if (typeof window === "undefined") return;

  const itemsPayload = (order.items || []).map((i) => ({
    item_id: i.id,
    item_name: i.name,
    price: i.price,
    quantity: i.quantity,
    currency: "INR",
  }));

  if (typeof window.gtag === "function") {
    window.gtag("event", "purchase", {
      transaction_id: order.orderId,
      value: order.total,
      currency: "INR",
      items: itemsPayload,
    });
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: order.orderId,
        value: order.total,
        currency: "INR",
        items: itemsPayload,
      },
    });
  }
}
