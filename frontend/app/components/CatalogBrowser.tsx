'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, LayoutGrid, List, Star } from 'lucide-react';
import { ApiProduct, productService } from '../lib/api';
import { categories, priceRanges, sortOptions, weightOptions } from '../data';

type CatalogBrowserProps = {
  initialCategory?: string;
  initialSearch?: string;
};

const pageSize = 12;

const categoryOptions = [
  { label: 'All', value: '' },
  ...Object.values(categories).map((category) => ({ label: category.name, value: category.slug })),
];

function getMinPrice(product: ApiProduct) {
  return Math.min(...product.variants.map((variant) => Number(variant.discountedPrice ?? variant.price)));
}

function getMaxPrice(product: ApiProduct) {
  return Math.max(...product.variants.map((variant) => Number(variant.price)));
}

function getPrimaryImage(product: ApiProduct) {
  return product.primaryImage ?? product.images[0]?.imageUrl ?? '/images/sweet-1.jpg';
}

export default function CatalogBrowser({ initialCategory = '', initialSearch = '' }: CatalogBrowserProps) {
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('rating');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedRange = useMemo(
    () => priceRanges.find((range) => range.label === selectedPrice) ?? null,
    [selectedPrice]
  );

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await productService.getAll({
          category: category || undefined,
          search: initialSearch || undefined,
          page,
          limit: pageSize,
          sort,
          priceMin: selectedRange?.min !== undefined ? selectedRange.min : undefined,
          priceMax: selectedRange?.max !== undefined && Number.isFinite(selectedRange.max) ? selectedRange.max : undefined,
          weight: selectedWeights.length > 0 ? selectedWeights.join(',') : undefined,
        });

        if (!active) return;

        setProducts(response.products);
        setTotal(response.total);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load products');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, [category, initialSearch, page, selectedRange, selectedWeights, sort]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleWeight = (weight: string) => {
    setPage(1);
    setSelectedWeights((current) =>
      current.includes(weight) ? current.filter((item) => item !== weight) : [...current, weight]
    );
  };

  const clearFilters = () => {
    setCategory('');
    setSort('rating');
    setSelectedPrice('');
    setSelectedWeights([]);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#fbf7f2]">
      <section className="border-b border-gray-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Product catalog</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-maroon sm:text-4xl">
                Browse sweets, namkeen, gifts, and bakery items
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-gray-600">
                Filter by category, price, weight, and rating to find the right pack size for your order.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className="rounded-full border border-maroon px-4 py-2 text-sm font-semibold text-maroon"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-cream"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-maroon">Filters</h2>
                <span className="text-xs uppercase tracking-[0.25em] text-gray-400">Refine</span>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <button className="flex w-full items-center justify-between text-left text-sm font-semibold text-gray-800">
                    Category
                    <ChevronDown size={16} />
                  </button>
                  <div className="mt-3 space-y-2">
                    {categoryOptions.map((option) => (
                      <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="category"
                          checked={category === option.value}
                          onChange={() => {
                            setCategory(option.value);
                            setPage(1);
                          }}
                          className="border-gray-300 text-maroon focus:ring-maroon"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <button className="flex w-full items-center justify-between text-left text-sm font-semibold text-gray-800">
                    Price Range
                    <ChevronDown size={16} />
                  </button>
                  <div className="mt-3 space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPrice === ''}
                        onChange={() => {
                          setSelectedPrice('');
                          setPage(1);
                        }}
                        className="border-gray-300 text-maroon focus:ring-maroon"
                      />
                      <span>All prices</span>
                    </label>
                    {priceRanges.map((range) => (
                      <label key={range.label} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="price"
                          checked={selectedPrice === range.label}
                          onChange={() => {
                            setSelectedPrice(range.label);
                            setPage(1);
                          }}
                          className="border-gray-300 text-maroon focus:ring-maroon"
                        />
                        <span>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <button className="flex w-full items-center justify-between text-left text-sm font-semibold text-gray-800">
                    Weight
                    <ChevronDown size={16} />
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {weightOptions.map((weight) => (
                      <label
                        key={weight}
                        className={`flex cursor-pointer items-center justify-center rounded-full border px-3 py-2 text-sm transition ${
                          selectedWeights.includes(weight)
                            ? 'border-maroon bg-maroon text-cream'
                            : 'border-gray-200 text-gray-700 hover:border-maroon'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedWeights.includes(weight)}
                          onChange={() => toggleWeight(weight)}
                          className="sr-only"
                        />
                        {weight}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Showing {loading ? '...' : `${Math.min(total, (page - 1) * pageSize + products.length)} of ${total}`}
                </p>
                {initialSearch && <p className="mt-1 text-sm text-gray-600">Search results for “{initialSearch}”</p>}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-full border border-gray-300 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-full p-2 ${viewMode === 'grid' ? 'bg-maroon text-cream' : 'text-gray-500'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`rounded-full p-2 ${viewMode === 'list' ? 'bg-maroon text-cream' : 'text-gray-500'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-80 animate-pulse rounded-3xl bg-white" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <p className="text-lg font-semibold text-gray-800">No products matched these filters.</p>
                <p className="mt-2 text-sm text-gray-500">Try clearing the filters or searching another category.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
                {products.map((product) => {
                  const displayPrice = getMinPrice(product);
                  const maxPrice = getMaxPrice(product);
                  const image = getPrimaryImage(product);

                  return (
                    <article
                      key={product.id}
                      className={`overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                        viewMode === 'list' ? 'flex flex-col gap-4 p-4 sm:flex-row' : ''
                      }`}
                    >
                      <div className={`relative ${viewMode === 'list' ? 'h-56 w-full sm:h-44 sm:w-48 sm:flex-shrink-0' : 'h-72 w-full'}`}>
                        <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                              {product.category?.name ?? 'Product'}
                            </p>
                            <Link href={`/products/${product.slug}`} className="mt-2 block text-xl font-semibold text-maroon transition hover:text-[#5f1313]">
                              {product.name}
                            </Link>
                          </div>
                          <div className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-maroon">
                            featured
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                size={14}
                                className={index < Math.round(product.ratingAvg) ? 'fill-gold text-gold' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span>{product.ratingAvg.toFixed(1)}</span>
                          <span>({product.ratingCount} reviews)</span>
                        </div>

                        <p className="mt-4 line-clamp-2 text-sm text-gray-600">
                          {product.description || 'Freshly prepared product with premium ingredients and careful packaging.'}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                          {product.variants.slice(0, 3).map((variant) => (
                            <span key={variant.id} className="rounded-full bg-gray-100 px-3 py-1">
                              {variant.weightLabel}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Starting at</p>
                            <div className="mt-1 flex items-baseline gap-2">
                              <span className="text-2xl font-semibold text-maroon">₹{displayPrice.toLocaleString('en-IN')}</span>
                              {maxPrice > displayPrice && <span className="text-sm text-gray-400 line-through">₹{maxPrice.toLocaleString('en-IN')}</span>}
                            </div>
                          </div>
                          <Link
                            href={`/products/${product.slug}`}
                            className="rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-cream"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPage(index + 1)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      page === index + 1 ? 'bg-maroon text-cream' : 'border border-gray-300 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}