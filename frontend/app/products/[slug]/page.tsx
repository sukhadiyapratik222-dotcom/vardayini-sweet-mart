'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductDetailClient from '../../components/ProductDetailClient';
import { productService, ApiProduct, ApiReview } from '../../lib/api';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [product, setProduct] = useState<ApiProduct | null>(null);
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

        setProduct(productResponse);

        const reviewResponse = await productService.getReviews(productResponse.id);
        if (!active) return;

        setReviews(reviewResponse);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load product');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-[#fbf7f2] px-4 py-16 text-center text-gray-600">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fbf7f2] px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-maroon">Product not found</h1>
        <p className="mt-2 text-gray-600">{error || 'The product you are looking for does not exist.'}</p>
      </div>
    );
  }

  return <ProductDetailClient product={product} initialReviews={reviews} />;
}
