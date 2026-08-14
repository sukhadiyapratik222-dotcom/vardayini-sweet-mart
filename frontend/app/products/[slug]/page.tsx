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

        const productResponse = await productService.getBySlug(slug);
        if (!productResponse || !productResponse.id) {
          throw new Error('Product not found via API');
        }

        if (active) setProduct(productResponse);
        try {
          const reviewResponse = await productService.getReviews(productResponse.id);
          if (active) setReviews(reviewResponse);
        } catch (e) { /* Reviews might not be available */ }
      } catch (err) {
        if (active) {
          setError('Failed to load product details. It may not exist or the service is unavailable.');
          setLoading(false);
        }
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
