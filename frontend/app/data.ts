// Category structure with nested subcategories
export const categories = {
  sweets: {
    name: "Sweets",
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
    name: "Dried Fruits & Nuts",
    slug: "dry-fruits-nuts",
    subcategories: []
  },
  baklava: {
    name: "Premium Baklava",
    slug: "premium-baklava",
    subcategories: []
  },
  corporateGifts: {
    name: "Corporate Gifts",
    slug: "corporate-gift-boxes",
    subcategories: []
  }
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

