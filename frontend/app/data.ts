// Category structure with nested subcategories
export const categories = {
  sweets: {
    name: "Sweets (Mithai)",
    slug: "sweets",
    subcategories: [
      { name: "Kaju Sweets", slug: "kaju-sweets" },
      { name: "Mawa Sweets", slug: "mawa-sweets" },
      { name: "Penda", slug: "penda" },
      { name: "Sugarless", slug: "sugarless" },
      { name: "Premium Packed", slug: "premium-packed" },
      { name: "Indian Ghee", slug: "indian-ghee" }
    ]
  },
  namkeen: {
    name: "Namkeen",
    slug: "namkeen",
    subcategories: [
      { name: "Millet", slug: "millet" },
      { name: "Farali", slug: "farali" },
      { name: "Gujarati", slug: "gujarati" },
      { name: "Khakhra", slug: "khakhra" },
      { name: "Roasted", slug: "roasted" },
      { name: "Mixture", slug: "mixture" },
      { name: "Sev", slug: "sev" },
      { name: "Chips & Puris", slug: "chips-puris" }
    ]
  },
  bakery: {
    name: "Bakery",
    slug: "bakery",
    subcategories: [
      { name: "Biscuits & Cookies", slug: "biscuits-cookies" },
      { name: "Toast & Khari", slug: "toast-khari" }
    ]
  },
  mukhwas: {
    name: "Mukhwas",
    slug: "mukhwas",
    subcategories: []
  },
  dryFruits: {
    name: "Dry Fruits & Nuts",
    slug: "dry-fruits-nuts",
    subcategories: [
      { name: "Cashews", slug: "cashews" },
      { name: "Almonds", slug: "almonds" },
      { name: "Pistachios", slug: "pistachios" },
      { name: "Trail Mix", slug: "trail-mix" }
    ]
  },
  baklava: {
    name: "Premium Baklava",
    slug: "premium-baklava",
    subcategories: []
  },
  corporateGifts: {
    name: "Festive Gift Boxes",
    slug: "corporate-gift-boxes",
    subcategories: [
      { name: "Diwali Hampers", slug: "diwali-hampers" },
      { name: "Corporate Gifts", slug: "corporate-gifts" },
      { name: "Wedding Favours", slug: "wedding-favours" }
    ]
  }
};

// ─── CATEGORY PAGE HERO CONFIG ──────────────────────────────────────────────
export const CATEGORY_PAGE_META: Record<string, { displayName: string; emoji: string }> = {
  sweets: { displayName: 'Sweets (Mithai)', emoji: '🍮' },
  namkeen: { displayName: 'Namkeen & Savories', emoji: '🥨' },
  'dry-fruits-nuts': { displayName: 'Dry Fruits & Nuts', emoji: '🫘' },
  'corporate-gift-boxes': { displayName: 'Festive Gift Boxes', emoji: '🎁' },
  bakery: { displayName: 'Bakery & Baked Goods', emoji: '🥐' },
};

export interface ProductVariant {
  id?: string;
  weight: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  variants: ProductVariant[];
  isBestSeller?: boolean;
  isNew?: boolean;
  isPremium?: boolean;
  isCombo?: boolean;
}

// Sample products data
export const products: Product[] = [
  {
    id: "prod-kjuuuu",
    name: "kaju katri 1111",
    slug: "kjuuuu",
    category: "sweets",
    subcategory: "kaju-sweets",
    image: "/images/sweet-1.jpg",
    rating: 4.9,
    reviews: 186,
    description: "Special Kaju Katri 1111 prepared with premium cashew nuts and pure ghee.",
    variants: [
      { id: "vkj-1", weight: "250g", price: 400, discountedPrice: 200, stock: 500, sku: "SKU-250G" }
    ],
    isBestSeller: true,
    isPremium: true
  },
  {
    id: "1",
    name: "Kaju Katli Premium Pure Ghee",
    slug: "kaju-katli-premium",
    category: "sweets",
    subcategory: "kaju-sweets",
    image: "/images/sweet-1.jpg",
    rating: 4.9,
    reviews: 186,
    description: "Pure cashew sweets made with finest cashews and silver foil",
    variants: [
      { id: "v1-1", weight: "250g", price: 450, stock: 50, sku: "KK-250" },
      { id: "v1-2", weight: "500g", price: 850, discountedPrice: 799, stock: 45, sku: "KK-500" },
      { id: "v1-3", weight: "1kg", price: 1600, discountedPrice: 1450, stock: 30, sku: "KK-1000" }
    ],
    isBestSeller: true,
    isPremium: true
  },
  {
    id: "2",
    name: "Mysore Pak Deluxe Pure Desi Ghee",
    slug: "mysore-pak-deluxe",
    category: "sweets",
    subcategory: "indian-ghee",
    image: "/images/sweet-2.jpg",
    rating: 4.8,
    reviews: 112,
    description: "Melt-in-mouth traditional Mysore Pak crafted with pure desi ghee",
    variants: [
      { id: "v2-1", weight: "250g", price: 320, stock: 60, sku: "MP-250" },
      { id: "v2-2", weight: "500g", price: 600, discountedPrice: 560, stock: 50, sku: "MP-500" },
      { id: "v2-3", weight: "1kg", price: 1100, discountedPrice: 999, stock: 35, sku: "MP-1000" }
    ],
    isBestSeller: true
  },
  {
    id: "3",
    name: "Royal Gujarati Mixture & Samosa Combo",
    slug: "samosa-namkeen-combo",
    category: "namkeen",
    subcategory: "mixture",
    image: "/images/sweet-3.jpg",
    rating: 4.7,
    reviews: 144,
    description: "Crispy min-samosas paired with authentic spicy Gujarati namkeen mixture",
    variants: [
      { id: "v3-1", weight: "250g", price: 280, stock: 70, sku: "SN-250" },
      { id: "v3-2", weight: "500g", price: 520, discountedPrice: 470, stock: 65, sku: "SN-500" },
      { id: "v3-3", weight: "1kg", price: 950, discountedPrice: 860, stock: 40, sku: "SN-1000" }
    ],
    isBestSeller: true,
    isCombo: true
  },
  {
    id: "4",
    name: "Dry Fruit Mix Super Premium Box",
    slug: "dry-fruit-mix-premium",
    category: "dry-fruits-nuts",
    subcategory: "dry-fruits-nuts",
    image: "/images/sweet-4.jpg",
    rating: 4.9,
    reviews: 230,
    description: "Assorted hand-picked cashews, California almonds, pistachios & raisins",
    variants: [
      { id: "v4-1", weight: "250g", price: 750, stock: 40, sku: "DF-250" },
      { id: "v4-2", weight: "500g", price: 1400, discountedPrice: 1200, stock: 35, sku: "DF-500" },
      { id: "v4-3", weight: "1kg", price: 2600, discountedPrice: 2250, stock: 25, sku: "DF-1000" }
    ],
    isPremium: true
  },
  {
    id: "5",
    name: "Kesar Mawa Penda",
    slug: "kesar-mawa-penda",
    category: "sweets",
    subcategory: "penda",
    image: "/images/sweet-5.jpg",
    rating: 4.6,
    reviews: 87,
    description: "Soft saffron enriched mawa penda garnished with pistachios",
    variants: [
      { id: "v5-1", weight: "250g", price: 340, stock: 55, sku: "KP-250" },
      { id: "v5-2", weight: "500g", price: 650, discountedPrice: 599, stock: 50, sku: "KP-500" },
      { id: "v5-3", weight: "1kg", price: 1250, stock: 30, sku: "KP-1000" }
    ],
    isNew: true
  },
  {
    id: "6",
    name: "Sugarless Anjeer Khajur Barfi",
    slug: "sugarless-anjeer-khajur-barfi",
    category: "sweets",
    subcategory: "sugarless",
    image: "/images/sweet-6.jpg",
    rating: 4.8,
    reviews: 95,
    description: "100% natural sugarless sweet made from dates, figs, and crunchy nuts",
    variants: [
      { id: "v6-1", weight: "250g", price: 520, stock: 40, sku: "SL-250" },
      { id: "v6-2", weight: "500g", price: 980, discountedPrice: 899, stock: 35, sku: "SL-500" },
      { id: "v6-3", weight: "1kg", price: 1850, discountedPrice: 1699, stock: 20, sku: "SL-1000" }
    ],
    isPremium: true
  },
  {
    id: "7",
    name: "Crispy Methi & Masala Khakhra Pack",
    slug: "crispy-methi-masala-khakhra",
    category: "namkeen",
    subcategory: "khakhra",
    image: "/images/sweet-7.jpg",
    rating: 4.7,
    reviews: 165,
    description: "Authentic roasted whole wheat khakhra with fenugreek and Gujarati spices",
    variants: [
      { id: "v7-1", weight: "250g", price: 180, stock: 80, sku: "KH-250" },
      { id: "v7-2", weight: "500g", price: 340, stock: 75, sku: "KH-500" },
      { id: "v7-3", weight: "1kg", price: 620, discountedPrice: 560, stock: 60, sku: "KH-1000" }
    ],
    isNew: true
  },
  {
    id: "8",
    name: "Ratlami & Thin Nylon Sev Pack",
    slug: "ratlami-nylon-sev-pack",
    category: "namkeen",
    subcategory: "sev",
    image: "/images/sweet-8.jpg",
    rating: 4.8,
    reviews: 198,
    description: "Spicy Ratlami sev blended with fine crunchy nylon sev",
    variants: [
      { id: "v8-1", weight: "250g", price: 160, stock: 90, sku: "SV-250" },
      { id: "v8-2", weight: "500g", price: 300, stock: 85, sku: "SV-500" },
      { id: "v8-3", weight: "1kg", price: 580, discountedPrice: 520, stock: 70, sku: "SV-1000" }
    ],
    isBestSeller: true
  },
  {
    id: "9",
    name: "Assorted Turkish Chocolate Baklava",
    slug: "assorted-turkish-baklava",
    category: "premium-baklava",
    subcategory: "premium-baklava",
    image: "/images/sweet-9.jpg",
    rating: 4.9,
    reviews: 142,
    description: "Layered filo pastry with pistachio, Belgian chocolate & honey syrup",
    variants: [
      { id: "v9-1", weight: "250g", price: 650, stock: 35, sku: "BK-250" },
      { id: "v9-2", weight: "500g", price: 1200, discountedPrice: 1050, stock: 30, sku: "BK-500" },
      { id: "v9-3", weight: "1kg", price: 2300, discountedPrice: 2000, stock: 15, sku: "BK-1000" }
    ],
    isPremium: true
  },
  {
    id: "10",
    name: "Royal Festive Sweet & Namkeen Box (Grand Pack)",
    slug: "royal-festive-gift-box",
    category: "corporate-gift-boxes",
    subcategory: "corporate-gift-boxes",
    image: "/images/sweet-10.jpg",
    rating: 5.0,
    reviews: 310,
    description: "Luxury corporate gift box containing Kaju Katli, Baklava, Dry Fruits & Savories",
    variants: [
      { id: "v10-1", weight: "1kg", price: 1499, stock: 50, sku: "GB-1000" },
      { id: "v10-2", weight: "2kg", price: 2899, discountedPrice: 2499, stock: 40, sku: "GB-2000" },
      { id: "v10-3", weight: "3kg", price: 4200, discountedPrice: 3699, stock: 20, sku: "GB-3000" }
    ],
    isBestSeller: true,
    isCombo: true,
    isPremium: true
  }
];

// Filter options
export const priceRanges = [
  { label: "Under ₹250", min: 0, max: 250 },
  { label: "₹250 - ₹500", min: 250, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { label: "₹2000+", min: 2000, max: Infinity }
];

export const weightOptions = [
  "250g",
  "300g",
  "400g",
  "500g",
  "600g",
  "800g",
  "1kg",
  "1.5kg",
  "2kg",
  "2.5kg",
  "3kg"
];

// Sort options
export const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest Arrivals" }
];

// ─── PLACEHOLDER PRODUCTS — TODO: Replace images & prices with real data ─────
// Each item marked _isTodo: true shows a "TODO: Replace" badge on the card.
// Steps: swap image paths → update prices → set _isTodo to false (or remove).
export const placeholderProducts: Product[] = [

  // ── SWEETS (Mithai) ────────────────────────────────────────────────────────
  {
    id: 'todo-sw-001',
    name: 'Motichoor Ladoo',
    slug: 'motichoor-ladoo-todo',
    category: 'sweets',
    subcategory: 'indian-ghee',
    image: '/images/sweet-2.jpg', // TODO: replace with actual product image
    rating: 4.8, reviews: 0,
    description: 'Soft, melt-in-mouth besan pearls fried in pure desi ghee, soaked in saffron syrup. A classic for every celebration.',
    variants: [
      { id: 'todo-sw-001-v1', weight: '250g', price: 180, discountedPrice: 160, stock: 50, sku: 'ML-250-TODO' },
      { id: 'todo-sw-001-v2', weight: '500g', price: 340, discountedPrice: 299, stock: 50, sku: 'ML-500-TODO' },
      { id: 'todo-sw-001-v3', weight: '1kg',  price: 640, discountedPrice: 570, stock: 30, sku: 'ML-1000-TODO' },
    ],
    isBestSeller: true,
  } as any,
  {
    id: 'todo-sw-002',
    name: 'Anjeer Barfi',
    slug: 'anjeer-barfi-todo',
    category: 'sweets',
    subcategory: 'mawa-sweets',
    image: '/images/sweet-6.jpg', // TODO: replace with actual product image
    rating: 4.7, reviews: 0,
    description: 'Rich and dense fig barfi made with dried figs, mawa, cardamom & topped with pistachio slivers.',
    variants: [
      { id: 'todo-sw-002-v1', weight: '250g', price: 280, stock: 40, sku: 'AB-250-TODO' },
      { id: 'todo-sw-002-v2', weight: '500g', price: 520, discountedPrice: 480, stock: 35, sku: 'AB-500-TODO' },
    ],
    isPremium: true,
  } as any,
  {
    id: 'todo-sw-003',
    name: 'Gajar Halwa (Carrot Halwa)',
    slug: 'gajar-halwa-todo',
    category: 'sweets',
    subcategory: 'indian-ghee',
    image: '/images/sweet-7.jpg', // TODO: replace with actual product image
    rating: 4.9, reviews: 0,
    description: 'Traditional slow-cooked carrot halwa with fresh milk, sugar, pure ghee & dry fruits. Available in season.',
    variants: [
      { id: 'todo-sw-003-v1', weight: '250g', price: 200, stock: 30, sku: 'GH-250-TODO' },
      { id: 'todo-sw-003-v2', weight: '500g', price: 380, discountedPrice: 340, stock: 25, sku: 'GH-500-TODO' },
    ],
    isNew: true,
  } as any,
  {
    id: 'todo-sw-004',
    name: 'Kesar Gulab Jamun',
    slug: 'kesar-gulab-jamun-todo',
    category: 'sweets',
    subcategory: 'mawa-sweets',
    image: '/images/sweet-5.jpg', // TODO: replace with actual product image
    rating: 4.8, reviews: 0,
    description: 'Soft khoya balls fried golden and soaked in rose-cardamom-saffron syrup. Best served warm.',
    variants: [
      { id: 'todo-sw-004-v1', weight: '500g (12 pcs)', price: 220, stock: 40, sku: 'GJ-500-TODO' },
      { id: 'todo-sw-004-v2', weight: '1kg (25 pcs)',  price: 420, discountedPrice: 380, stock: 30, sku: 'GJ-1000-TODO' },
    ],
  } as any,

  // ── NAMKEEN ────────────────────────────────────────────────────────────────
  {
    id: 'todo-nk-001',
    name: 'Farali Chevdo',
    slug: 'farali-chevdo-todo',
    category: 'namkeen',
    subcategory: 'farali',
    image: '/images/sweet-3.jpg', // TODO: replace with actual product image
    rating: 4.7, reviews: 0,
    description: 'Traditional Gujarati fasting snack made with samo (barnyard millet), peanuts, potato chips & light spices.',
    variants: [
      { id: 'todo-nk-001-v1', weight: '200g', price: 130, stock: 60, sku: 'FC-200-TODO' },
      { id: 'todo-nk-001-v2', weight: '400g', price: 240, discountedPrice: 220, stock: 55, sku: 'FC-400-TODO' },
    ],
    isBestSeller: true,
  } as any,
  {
    id: 'todo-nk-002',
    name: 'Millet Puff Namkeen',
    slug: 'millet-puff-namkeen-todo',
    category: 'namkeen',
    subcategory: 'millet',
    image: '/images/sweet-8.jpg', // TODO: replace with actual product image
    rating: 4.6, reviews: 0,
    description: 'Air-puffed bajra & jowar namkeen with no maida — nutritious, crunchy, low-oil & lightly spiced.',
    variants: [
      { id: 'todo-nk-002-v1', weight: '150g', price: 90, stock: 80, sku: 'MP-150-TODO' },
      { id: 'todo-nk-002-v2', weight: '300g', price: 165, discountedPrice: 149, stock: 70, sku: 'MP-300-TODO' },
    ],
    isNew: true,
  } as any,
  {
    id: 'todo-nk-003',
    name: 'Spicy Masala Puri',
    slug: 'spicy-masala-puri-todo',
    category: 'namkeen',
    subcategory: 'chips-puris',
    image: '/images/sweet-4.jpg', // TODO: replace with actual product image
    rating: 4.5, reviews: 0,
    description: 'Crispy fried wheat puris coated in tangy chaat masala — ideal with tea or as a travel snack.',
    variants: [
      { id: 'todo-nk-003-v1', weight: '250g', price: 110, stock: 90, sku: 'SP-250-TODO' },
      { id: 'todo-nk-003-v2', weight: '500g', price: 200, discountedPrice: 180, stock: 80, sku: 'SP-500-TODO' },
    ],
  } as any,

  // ── DRY FRUITS & NUTS ──────────────────────────────────────────────────────
  {
    id: 'todo-df-001',
    name: 'California Almonds (Badaam)',
    slug: 'california-almonds-todo',
    category: 'dry-fruits-nuts',
    subcategory: 'almonds',
    image: '/images/sweet-4.jpg', // TODO: replace with actual product image
    rating: 4.9, reviews: 0,
    description: 'Premium grade California almonds — high in protein, vitamin E & healthy fats. Ideal for gifting & daily snacking.',
    variants: [
      { id: 'todo-df-001-v1', weight: '250g', price: 320, stock: 50, sku: 'CA-250-TODO' },
      { id: 'todo-df-001-v2', weight: '500g', price: 600, discountedPrice: 550, stock: 40, sku: 'CA-500-TODO' },
      { id: 'todo-df-001-v3', weight: '1kg',  price: 1150, discountedPrice: 1050, stock: 30, sku: 'CA-1000-TODO' },
    ],
    isPremium: true,
  } as any,
  {
    id: 'todo-df-002',
    name: 'Premium Cashews (Kaju W240)',
    slug: 'premium-cashews-w240-todo',
    category: 'dry-fruits-nuts',
    subcategory: 'cashews',
    image: '/images/sweet-1.jpg', // TODO: replace with actual product image
    rating: 5.0, reviews: 0,
    description: 'Jumbo W240 grade whole cashews — creamy, buttery & perfect for cooking, gifting or snacking.',
    variants: [
      { id: 'todo-df-002-v1', weight: '250g', price: 420, stock: 40, sku: 'KJ-250-TODO' },
      { id: 'todo-df-002-v2', weight: '500g', price: 800, discountedPrice: 750, stock: 35, sku: 'KJ-500-TODO' },
    ],
    isPremium: true,
  } as any,
  {
    id: 'todo-df-003',
    name: 'Mixed Dry Fruit Trail Pack',
    slug: 'mixed-trail-pack-todo',
    category: 'dry-fruits-nuts',
    subcategory: 'trail-mix',
    image: '/images/sweet-9.jpg', // TODO: replace with actual product image
    rating: 4.8, reviews: 0,
    description: 'A blend of cashews, almonds, raisins, cranberries & pistachios. Pre-portioned for daily wellness.',
    variants: [
      { id: 'todo-df-003-v1', weight: '200g', price: 280, stock: 60, sku: 'TM-200-TODO' },
      { id: 'todo-df-003-v2', weight: '500g', price: 650, discountedPrice: 599, stock: 50, sku: 'TM-500-TODO' },
    ],
    isBestSeller: true,
  } as any,

  // ── FESTIVE GIFT BOXES ─────────────────────────────────────────────────────
  {
    id: 'todo-gb-001',
    name: 'Diwali Premium Sweet Hamper',
    slug: 'diwali-sweet-hamper-todo',
    category: 'corporate-gift-boxes',
    subcategory: 'diwali-hampers',
    image: '/images/sweet-10.jpg', // TODO: replace with actual product image
    rating: 5.0, reviews: 0,
    description: 'Handpicked Diwali gift hamper with Kaju Katli, Motichoor Ladoo, Soan Papdi, Dry Fruits & premium packaging.',
    variants: [
      { id: 'todo-gb-001-v1', weight: '1kg Box', price: 1299, stock: 25, sku: 'DH-1K-TODO' },
      { id: 'todo-gb-001-v2', weight: '2kg Box', price: 2499, discountedPrice: 2199, stock: 20, sku: 'DH-2K-TODO' },
      { id: 'todo-gb-001-v3', weight: '3kg Box', price: 3699, discountedPrice: 3299, stock: 10, sku: 'DH-3K-TODO' },
    ],
    isBestSeller: true, isPremium: true, isCombo: true,
  } as any,
  {
    id: 'todo-gb-002',
    name: 'Corporate Sweet & Namkeen Box',
    slug: 'corporate-sweet-namkeen-box-todo',
    category: 'corporate-gift-boxes',
    subcategory: 'corporate-gifts',
    image: '/images/sweet-5.jpg', // TODO: replace with actual product image
    rating: 4.9, reviews: 0,
    description: 'Elegant branded corporate gift box with Kaju Katli, Sev, Khakhra & Dry Fruits. Minimum 20 boxes for bulk orders.',
    variants: [
      { id: 'todo-gb-002-v1', weight: '500g Box', price: 699, stock: 50, sku: 'CG-500-TODO' },
      { id: 'todo-gb-002-v2', weight: '1kg Box',  price: 1299, discountedPrice: 1199, stock: 40, sku: 'CG-1K-TODO' },
    ],
    isPremium: true, isCombo: true,
  } as any,
  {
    id: 'todo-gb-003',
    name: 'Wedding Favour Sweet Boxes',
    slug: 'wedding-favour-boxes-todo',
    category: 'corporate-gift-boxes',
    subcategory: 'wedding-favours',
    image: '/images/sweet-2.jpg', // TODO: replace with actual product image
    rating: 4.9, reviews: 0,
    description: 'Custom-decorated small gift boxes with assorted premium sweets for wedding guests. Min. order 50 boxes.',
    variants: [
      { id: 'todo-gb-003-v1', weight: '100g Box', price: 150, stock: 100, sku: 'WF-100-TODO' },
      { id: 'todo-gb-003-v2', weight: '250g Box', price: 320, discountedPrice: 280, stock: 80, sku: 'WF-250-TODO' },
    ],
    isNew: true,
  } as any,

  // ── BAKERY ─────────────────────────────────────────────────────────────────
  {
    id: 'todo-bk-001',
    name: 'Butter Jeera Khari',
    slug: 'butter-jeera-khari-todo',
    category: 'bakery',
    subcategory: 'toast-khari',
    image: '/images/sweet-3.jpg', // TODO: replace with actual product image
    rating: 4.6, reviews: 0,
    description: 'Flaky, buttery khari biscuits flavoured with whole cumin seeds — freshly baked every morning.',
    variants: [
      { id: 'todo-bk-001-v1', weight: '200g', price: 80,  stock: 100, sku: 'BK-200-TODO' },
      { id: 'todo-bk-001-v2', weight: '400g', price: 150, discountedPrice: 135, stock: 90, sku: 'BK-400-TODO' },
    ],
    isBestSeller: true,
  } as any,
  {
    id: 'todo-bk-002',
    name: 'Ghee Nan Khatai',
    slug: 'ghee-nan-khatai-todo',
    category: 'bakery',
    subcategory: 'biscuits-cookies',
    image: '/images/sweet-6.jpg', // TODO: replace with actual product image
    rating: 4.8, reviews: 0,
    description: 'Traditional melt-in-mouth Nan Khatai biscuits made with pure ghee, maida & cardamom. No artificial flavours.',
    variants: [
      { id: 'todo-bk-002-v1', weight: '250g', price: 110, stock: 80, sku: 'NK-250-TODO' },
      { id: 'todo-bk-002-v2', weight: '500g', price: 200, discountedPrice: 179, stock: 70, sku: 'NK-500-TODO' },
    ],
  } as any,
];


