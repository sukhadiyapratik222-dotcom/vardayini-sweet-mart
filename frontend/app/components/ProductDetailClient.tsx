'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { ApiProduct, ApiReview } from '../lib/api';

type ProductDetailClientProps = {
  product: ApiProduct;
  initialReviews: ApiReview[];
};

const nutritionRows = [
  ['Energy', '412 kcal'],
  ['Carbohydrates', '52 g'],
  ['Protein', '6 g'],
  ['Fat', '19 g'],
];

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function ProductDetailClient({ product, initialReviews }: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');
  const [reviews] = useState(initialReviews);

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0],
    [product.variants, selectedVariantId]
  );

  const displayPrice = Number(selectedVariant?.discountedPrice ?? selectedVariant?.price ?? 0);
  const originalPrice = Number(selectedVariant?.price ?? displayPrice);
  const imageUrls = product.images.length > 0 ? product.images.map((image) => image.imageUrl) : [product.primaryImage ?? '/images/sweet-1.jpg'];
  const selectedRating = product.ratingAvg || (reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0);

  return (
    <main className="min-h-screen bg-[#fbf7f2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/products" className="hover:text-maroon">
            Products
          </Link>
          <span>/</span>
          <span>{product.category?.name ?? 'Catalog'}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="space-y-4">
            <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={imageUrls[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />
              </div>
              {selectedVariant?.discountedPrice && (
                <div className="absolute right-4 top-4 rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-cream">
                  Save {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
                </div>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {imageUrls.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    selectedImage === index ? 'border-maroon' : 'border-transparent'
                  }`}
                >
                  <Image src={imageUrl} alt={`${product.name} ${index + 1}`} fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{product.category?.name ?? 'Product'}</p>
                <h1 className="mt-2 text-3xl font-semibold text-maroon">{product.name}</h1>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        className={index < Math.round(selectedRating) ? 'fill-gold text-gold' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span>{selectedRating.toFixed(1)}</span>
                  <span>({product.ratingCount || reviews.length} reviews)</span>
                </div>
              </div>
              <div className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-maroon">
                featured
              </div>
            </div>

            <div className="mt-6 border-y border-gray-200 py-5">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-semibold text-maroon">{formatPrice(displayPrice)}</span>
                {originalPrice > displayPrice && (
                  <span className="text-lg text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Inclusive of packaging and GST. Quantity pricing updates as you switch the weight.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-800">Select weight</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        selectedVariant?.id === variant.id
                          ? 'border-maroon bg-maroon text-cream'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-maroon'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{variant.weightLabel}</span>
                      <span className="mt-1 block text-xs opacity-80">{formatPrice(Number(variant.discountedPrice ?? variant.price))}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800">Quantity</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="rounded-2xl border border-gray-200 p-3 text-gray-700 transition hover:border-maroon"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="min-w-16 rounded-2xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-800">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="rounded-2xl border border-gray-200 p-3 text-gray-700 transition hover:border-maroon"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-full bg-maroon px-5 py-4 text-sm font-semibold text-cream transition hover:bg-[#5f1313]"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button
                  type="button"
                  className="rounded-full border border-maroon px-5 py-4 text-sm font-semibold text-maroon transition hover:bg-maroon hover:text-cream"
                >
                  Buy Now
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex flex-wrap gap-2">
                {(['description', 'nutrition', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                      activeTab === tab ? 'bg-maroon text-cream' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab === 'nutrition' ? 'Ingredients & Nutrition' : tab}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-[#fcfaf6] p-5">
                {activeTab === 'description' && (
                  <p className="text-sm leading-7 text-gray-700">
                    {product.description || 'Freshly prepared in small batches with premium ingredients and careful packaging for gifting and daily indulgence.'}
                  </p>
                )}

                {activeTab === 'nutrition' && (
                  <div className="space-y-4 text-sm text-gray-700">
                    <p>
                      Ingredients vary by flavor and preparation. This batch is made with premium milk solids, ghee, nuts, and natural flavoring.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {nutritionRows.map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">{label}</p>
                          <p className="mt-1 font-semibold text-maroon">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-sm text-gray-600">No reviews yet. Be the first to rate this product.</p>
                    ) : (
                      reviews.map((review) => (
                        <article key={review.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{review.user.name}</p>
                              <div className="mt-1 flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    size={14}
                                    className={index < review.rating ? 'fill-gold text-gold' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-gray-700">{review.comment}</p>
                        </article>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}