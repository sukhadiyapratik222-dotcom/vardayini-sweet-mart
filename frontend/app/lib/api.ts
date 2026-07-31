// API Service for Vardayinin Sweet Mart
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiProductImage {
  id: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  category?: ApiCategory;
  images: ApiProductImage[];
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;
  variants: ApiProductVariant[];
  createdAt: string;
  reviews?: ApiReview[];
  primaryImage?: string;
}

export interface ApiProductVariant {
  id: string;
  productId: string;
  weightLabel: string;
  price: number;
  discountedPrice?: number;
  stockQty: number;
  sku: string;
}

export interface ApiReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface ApiSearchResponse {
  suggestions: ApiProduct[];
}

export interface ApiProductListResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  limit: number;
}

// Product APIs
export const productService = {
  async getAll(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    priceMin?: number;
    priceMax?: number;
    weight?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.priceMin !== undefined) queryParams.append('priceMin', params.priceMin.toString());
    if (params?.priceMax !== undefined) queryParams.append('priceMax', params.priceMax.toString());
    if (params?.weight) queryParams.append('weight', params.weight);

    const response = await fetch(`${API_BASE}/products?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return (await response.json()) as ApiProductListResponse;
  },

  async getBySlug(slug: string) {
    const response = await fetch(`${API_BASE}/products/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return (await response.json()) as ApiProduct;
  },

  async searchSuggestions(query: string) {
    const params = new URLSearchParams();
    params.append('q', query);
    const response = await fetch(`${API_BASE}/search?${params}`);
    if (!response.ok) throw new Error('Failed to search products');
    return (await response.json()) as ApiSearchResponse;
  },

  async getReviews(productId: string) {
    const response = await fetch(`${API_BASE}/products/${productId}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return (await response.json()) as ApiReview[];
  },

  async createReview(productId: string, payload: { rating: number; comment: string; token?: string }) {
    const response = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(payload.token ? { Authorization: `Bearer ${payload.token}` } : {}),
      },
      body: JSON.stringify({ rating: payload.rating, comment: payload.comment }),
    });

    if (!response.ok) throw new Error('Failed to submit review');
    return (await response.json()) as ApiReview;
  },
};

// Category APIs
export const categoryService = {
  async getAll() {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getBySlug(slug: string) {
    const response = await fetch(`${API_BASE}/categories/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  },
};

// Cart APIs (example - update as needed)
export const cartService = {
  async addToCart(productVariantId: string, quantity: number) {
    const response = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productVariantId, quantity }),
    });
    if (!response.ok) throw new Error('Failed to add to cart');
    return response.json();
  },
};

// Wishlist APIs (example - update as needed)
export const wishlistService = {
  async addToWishlist(productId: string) {
    const response = await fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    if (!response.ok) throw new Error('Failed to add to wishlist');
    return response.json();
  },
};
