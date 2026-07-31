// Category structure with nested subcategories
export const categories = {
  sweets: {
    name: "Sweets",
    slug: "sweets",
    subcategories: [
      { name: "Kaju", slug: "kaju" },
      { name: "Mawa", slug: "mawa" },
      { name: "Penda", slug: "penda" },
      { name: "Premium Packed", slug: "premium-packed" },
      { name: "Sugarless", slug: "sugarless" },
      { name: "Ghee Sweets", slug: "ghee-sweets" },
      { name: "Festival Sweets", slug: "festival-sweets" },
      { name: "City-Specific", slug: "city-specific" }
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
      { name: "Biscuits/Cookies", slug: "biscuits-cookies" },
      { name: "Toast/Khari", slug: "toast-khari" }
    ]
  },
  mukhwas: {
    name: "Mukhwas",
    slug: "mukhwas",
    subcategories: []
  },
  ourSpecials: {
    name: "Our Special",
    slug: "our-special",
    subcategories: [
      { name: "Dry Fruits & Nuts", slug: "dry-fruits-nuts" },
      { name: "Premium Baklava", slug: "premium-baklava" },
      { name: "Corporate Gift Boxes", slug: "corporate-gift-boxes" }
    ]
  }
};

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
}

export interface ProductVariant {
  weight: string;
  price: number;
  discountedPrice?: number;
  stock: number;
}

// Sample products data
export const products: Product[] = [
  {
    id: "1",
    name: "Kaju Katli Premium",
    slug: "kaju-katli-premium",
    category: "sweets",
    subcategory: "kaju",
    image: "/images/sweet-1.jpg",
    rating: 4.8,
    reviews: 156,
    description: "Pure cashew sweets made with finest cashews and ghee",
    variants: [
      { weight: "250g", price: 450, stock: 50 },
      { weight: "500g", price: 850, discountedPrice: 799, stock: 45 },
      { weight: "1kg", price: 1600, discountedPrice: 1450, stock: 30 }
    ],
    isBestSeller: true
  },
  {
    id: "2",
    name: "Mysore Pak Deluxe",
    slug: "mysore-pak-deluxe",
    category: "sweets",
    subcategory: "premium-packed",
    image: "/images/sweet-2.jpg",
    rating: 4.7,
    reviews: 98,
    description: "Traditional Mysore Pak with roasted gram flour and ghee",
    variants: [
      { weight: "250g", price: 320, stock: 60 },
      { weight: "500g", price: 600, stock: 50 },
      { weight: "1kg", price: 1100, stock: 35 }
    ],
    isBestSeller: true
  },
  {
    id: "3",
    name: "Samosa Namkeen Combo",
    slug: "samosa-namkeen-combo",
    category: "namkeen",
    subcategory: "mixture",
    image: "/images/sweet-3.jpg",
    rating: 4.6,
    reviews: 124,
    description: "Crispy samosas with assorted namkeen mix",
    variants: [
      { weight: "250g", price: 280, stock: 70 },
      { weight: "500g", price: 520, stock: 65 },
      { weight: "1kg", price: 950, stock: 40 }
    ],
    isBestSeller: true
  },
  {
    id: "4",
    name: "Dry Fruit Mix Premium",
    slug: "dry-fruit-mix-premium",
    category: "our-special",
    subcategory: "dry-fruits-nuts",
    image: "/images/sweet-4.jpg",
    rating: 4.9,
    reviews: 203,
    description: "Assorted premium dry fruits and nuts - cashews, almonds, raisins",
    variants: [
      { weight: "250g", price: 750, stock: 40 },
      { weight: "500g", price: 1400, discountedPrice: 1200, stock: 35 },
      { weight: "1kg", price: 2600, discountedPrice: 2250, stock: 25 }
    ],
    isPremium: true
  },
  {
    id: "5",
    name: "Mawa Cake Festive",
    slug: "mawa-cake-festive",
    category: "sweets",
    subcategory: "mawa",
    image: "/images/sweet-5.jpg",
    rating: 4.5,
    reviews: 87,
    description: "Soft mawa cake with cardamom and nuts",
    variants: [
      { weight: "300g", price: 380, stock: 55 },
      { weight: "600g", price: 700, stock: 50 }
    ],
    isNew: true
  },
  {
    id: "6",
    name: "Sugarless Kaju Katli",
    slug: "sugarless-kaju-katli",
    category: "sweets",
    subcategory: "sugarless",
    image: "/images/sweet-6.jpg",
    rating: 4.4,
    reviews: 52,
    description: "Healthy sugarless cashew sweets made with stevia",
    variants: [
      { weight: "250g", price: 520, stock: 30 },
      { weight: "500g", price: 980, stock: 25 }
    ]
  },
  {
    id: "7",
    name: "Baked Khakhra Spice",
    slug: "baked-khakhra-spice",
    category: "namkeen",
    subcategory: "khakhra",
    image: "/images/sweet-7.jpg",
    rating: 4.7,
    reviews: 145,
    description: "Crispy baked khakhra with traditional spices",
    variants: [
      { weight: "200g", price: 180, stock: 80 },
      { weight: "400g", price: 320, stock: 75 },
      { weight: "800g", price: 580, stock: 60 }
    ]
  },
  {
    id: "8",
    name: "Moong Dal Sev Pack",
    slug: "moong-dal-sev-pack",
    category: "namkeen",
    subcategory: "sev",
    image: "/images/sweet-8.jpg",
    rating: 4.6,
    reviews: 178,
    description: "Traditional moong dal sev - crispy and flavorful",
    variants: [
      { weight: "250g", price: 220, stock: 90 },
      { weight: "500g", price: 400, stock: 85 },
      { weight: "1kg", price: 750, stock: 70 }
    ],
    isBestSeller: true
  },
  {
    id: "9",
    name: "Choco Baklava Premium",
    slug: "choco-baklava-premium",
    category: "our-special",
    subcategory: "premium-baklava",
    image: "/images/sweet-9.jpg",
    rating: 4.8,
    reviews: 134,
    description: "Premium baklava with chocolate and pistachios",
    variants: [
      { weight: "250g", price: 650, stock: 35 },
      { weight: "500g", price: 1200, discountedPrice: 1050, stock: 30 }
    ],
    isPremium: true
  },
  {
    id: "10",
    name: "Festival Gift Box - Gold",
    slug: "festival-gift-box-gold",
    category: "giftBoxes",
    subcategory: "corporate-gift-boxes",
    image: "/images/sweet-10.jpg",
    rating: 4.9,
    reviews: 267,
    description: "Premium gift box with assorted sweets and namkeen",
    variants: [
      { weight: "1.5kg", price: 1999, stock: 50 },
      { weight: "2.5kg", price: 3299, discountedPrice: 2999, stock: 40 }
    ],
    isBestSeller: true
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
  "2.5kg"
];

// Sort options
export const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest Arrivals" }
];
