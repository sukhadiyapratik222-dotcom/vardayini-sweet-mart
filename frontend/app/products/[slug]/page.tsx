'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductDetailClient from '../../components/ProductDetailClient';
import { productService, ApiProduct, ApiReview } from '../../lib/api';
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

        const productResponse = await productService.getBySlug(slug);
        if (!active) return;

        if (productResponse && productResponse.id) {
          setProduct(productResponse);
          try {
            const reviewResponse = await productService.getReviews(productResponse.id);
            if (active) setReviews(reviewResponse);
          } catch (e) {}
          setLoading(false);
          return;
        }
      } catch (fetchError) {
        // Fallback to local products dataset
      }

      if (!active) return;

      // Find in local products
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
          },
          {
            id: 'rev-2',
            productId: String(localMatch.id || '1'),
            userId: 'u2',
            rating: 5,
            comment: 'Fast delivery to Surat. The taste is exactly like traditional homemade sweets.',
            createdAt: new Date().toISOString(),
            user: { id: 'u2', name: 'Priya Shah' }
          }
        ]);
        setLoading(false);
        return;
      }

      setError('The product you are looking for does not exist.');
      setLoading(false);
    };

    loadProduct();

    return () => {
      active = false;
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

