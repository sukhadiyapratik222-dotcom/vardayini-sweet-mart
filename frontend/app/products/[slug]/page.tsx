'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductDetailClient from '../../components/ProductDetailClient';
import { productService, ApiReview } from '../../lib/api';
import { products as localProducts } from '../../data';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError('');

        // 1. Try live backend API first
        try {
          const productResponse = await productService.getBySlug(slug);
          if (productResponse && productResponse.id) {
            if (active) setProduct(productResponse);
            try {
              const reviewResponse = await productService.getReviews(productResponse.id);
              if (active) setReviews(reviewResponse);
            } catch (e) {}
            setLoading(false);
            return;
          }
        } catch (fetchError) {}

        // 2. Check admin created/edited products catalog in localStorage
        let adminProducts: any[] = [];
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('admin_products_catalog');
          if (stored) {
            try {
              adminProducts = JSON.parse(stored);
            } catch (e) {}
          }
        }

        const adminMatch = adminProducts.find((p) => p.slug === slug || p.id === slug);
        if (adminMatch) {
          const formattedAdmin = {
            id: adminMatch.id,
            name: adminMatch.name,
            slug: adminMatch.slug,
            description: adminMatch.description,
            ratingAvg: adminMatch.ratingAvg || 4.9,
            ratingCount: adminMatch.ratingCount || 42,
            primaryImage: adminMatch.primaryImage || adminMatch.imageUrls?.[0] || '/images/sweet-1.jpg',
            category: { name: adminMatch.categorySlug?.replace(/-/g, ' ').toUpperCase() || 'SWEETS', slug: adminMatch.categorySlug || 'sweets' },
            images: (adminMatch.imageUrls || [adminMatch.primaryImage || '/images/sweet-1.jpg']).map((img: string, idx: number) => ({
              id: idx + 1,
              imageUrl: img,
              altText: `${adminMatch.name} ${idx + 1}`
            })),
            variants: (adminMatch.variants || []).map((v: any, idx: number) => ({
              id: v.id || `${adminMatch.id}-${v.weightLabel || v.weight || idx}`,
              weightLabel: v.weightLabel || v.weight || '500g',
              price: Number(v.price || 250),
              discountedPrice: v.discountedPrice ? Number(v.discountedPrice) : undefined,
              stockQty: Number(v.stockQty ?? v.stock ?? 20),
              sku: v.sku || `SKU-${idx + 1}`
            }))
          };

          if (active) setProduct(formattedAdmin as any);
          setReviews([
            {
              id: 'rev-admin-1',
              productId: String(adminMatch.id),
              userId: 'u1',
              rating: 5,
              comment: 'Freshly made with 100% pure A2 desi ghee. Highest quality sweets!',
              createdAt: new Date().toISOString(),
              user: { id: 'u1', name: 'Pratik Sukhadiya' }
            }
          ]);
          setLoading(false);
          return;
        }

        if (!active) return;

        // 2. Find in static local products
        const localMatch = localProducts.find((p) => p.slug === slug || p.id === slug);
        if (localMatch) {
          const formattedLocal = {
            id: localMatch.id,
            name: localMatch.name,
            slug: localMatch.slug,
            description: localMatch.description,
            ratingAvg: localMatch.rating,
            ratingCount: localMatch.reviews,
            primaryImage: localMatch.image,
            category: { name: localMatch.category.toUpperCase().replace(/-/g, ' '), slug: localMatch.category },
            images: [{ id: 1, imageUrl: localMatch.image, altText: localMatch.name }],
            variants: localMatch.variants.map((v, idx) => ({
              id: v.id || `${localMatch.id}-${v.weight}`,
              weightLabel: v.weight,
              price: v.price,
              discountedPrice: v.discountedPrice,
              stockQty: v.stock || 50,
              sku: v.sku || `SKU-${idx}`
            }))
          };
          setProduct(formattedLocal);
          setReviews([
            {
              id: 'rev-1',
              productId: String(localMatch.id || '1'),
              userId: 'u1',
              rating: 5,
              comment: 'Extremely fresh and delicious! Packed with authentic pure ghee flavors.',
              createdAt: new Date().toISOString(),
              user: { id: 'u1', name: 'Ramesh Patel' }
            }
          ]);
          setLoading(false);
          return;
        }

        setError('The product you are looking for does not exist.');
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details.');
        setLoading(false);
      }
    };

    loadProduct();

    window.addEventListener("admin_data_updated", loadProduct);
    window.addEventListener("storage", loadProduct);

    return () => {
      active = false;
      window.removeEventListener("admin_data_updated", loadProduct);
      window.removeEventListener("storage", loadProduct);
    };
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-[#FAF7F0] px-4 py-16 text-center text-[#0B1B3D] font-bold">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] px-4 py-16 text-center">
        <h1 className="text-2xl font-black text-[#0B1B3D]">Product not found</h1>
        <p className="mt-2 text-gray-600 text-sm">{error || 'The product you are looking for does not exist.'}</p>
      </div>
    );
  }

  return <ProductDetailClient product={product} initialReviews={reviews} />;
}
