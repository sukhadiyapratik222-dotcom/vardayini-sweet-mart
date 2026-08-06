'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, LayoutGrid, List, Star, Filter, RotateCcw, ShoppingCart } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { ApiProduct, productService } from '../lib/api';
import { categories, priceRanges, sortOptions, weightOptions, products as localProducts, Product as LocalProduct } from '../data';
import { useCart } from '../context/CartContext';

type CatalogBrowserProps = {
  initialCategory?: string;
  initialSearch?: string;
};

const pageSize = 9;

const categoryOptions = [
  { label: 'All Categories', value: '' },
  ...Object.values(categories).map((category) => ({ label: category.name, value: category.slug })),
];

export default function CatalogBrowser({ initialCategory = '', initialSearch = '' }: CatalogBrowserProps) {
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('rating');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const selectedRange = useMemo(
    () => priceRanges.find((range) => range.label === selectedPrice) ?? null,
    [selectedPrice]
  );

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      setLoading(true);
      let apiProductsList: any[] = [];
      let apiTotalCount = 0;
      let apiFetchedSuccess = false;

      try {
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

        if (response && Array.isArray(response.products)) {
          apiProductsList = response.products;
          apiTotalCount = response.total || response.products.length;
          apiFetchedSuccess = true;
        }
      } catch (e) {
        // Fallback to local dataset
      }

      if (!active) return;

      // 1. Get products from admin localStorage catalog
      let adminProducts: any[] = [];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('admin_products_catalog');
        if (stored) {
          try {
            adminProducts = JSON.parse(stored);
          } catch (e) {}
        }
      }

      const poolSource = apiProductsList.length > 0 ? [...apiProductsList, ...adminProducts, ...localProducts] : [...adminProducts, ...localProducts];

      // Remove duplicates by normalized name and slug
      const uniqueMap = new Map();
      const seenNames = new Set();

      poolSource.forEach((p) => {
        const nameKey = (p.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "");
        const slugKey = (p.slug || String(p.id)).toLowerCase().trim();

        if (nameKey && !seenNames.has(nameKey) && !uniqueMap.has(slugKey)) {
          seenNames.add(nameKey);
          uniqueMap.set(slugKey, p);
        }
      });

      let filtered = Array.from(uniqueMap.values()).filter((p: any) => p.isActive !== false);

      // Filter by Category
      if (category) {
        const catLower = category.toLowerCase().trim();
        const normalizeCat = (slug: string) => {
          if (slug === 'corporate-gifts' || slug === 'corporate-gift-boxes') return 'corporate-gift-boxes';
          if (slug === 'dry-fruits-nuts' || slug === 'dry-fruits' || slug === 'dry-fruits-and-nuts') return 'dry-fruits-nuts';
          return slug;
        };

        const targetCat = normalizeCat(catLower);

        filtered = filtered.filter((p: any) => {
          const pCat = normalizeCat((p.category || p.categorySlug || '').toLowerCase().trim());
          const pSub = (p.subcategory || '').toLowerCase().trim();

          return pCat === targetCat || pSub === targetCat || pCat.includes(targetCat) || targetCat.includes(pCat);
        });
      }

      // Filter by search text
      if (initialSearch && initialSearch.trim()) {
        const query = initialSearch.toLowerCase().trim();
        filtered = filtered.filter(
          (p: any) =>
            p.name.toLowerCase().includes(query) ||
            (p.description || '').toLowerCase().includes(query) ||
            (p.category || '').toLowerCase().includes(query)
        );
      }

      // Filter by Price Range
      if (selectedRange) {
        filtered = filtered.filter((p: any) => {
          const price = p.variants?.[0]?.discountedPrice || p.variants?.[0]?.price || 0;
          return price >= selectedRange.min && price <= selectedRange.max;
        });
      }

      // Filter by Weight
      if (selectedWeights.length > 0) {
        filtered = filtered.filter((p: any) =>
          p.variants?.some((v: any) => selectedWeights.includes(v.weight || v.weightLabel))
        );
      }

      // Sorting
      if (sort === 'price_low') {
        filtered.sort((a: any, b: any) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));
      } else if (sort === 'price_high') {
        filtered.sort((a: any, b: any) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));
      } else if (sort === 'rating') {
        filtered.sort((a: any, b: any) => (b.rating || b.ratingAvg || 0) - (a.rating || a.ratingAvg || 0));
      } else if (sort === 'newest') {
        filtered.sort((a: any, b: any) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      }

      setProducts(filtered);
      setTotal(apiFetchedSuccess ? apiTotalCount : filtered.length);
      setLoading(false);
    }

    loadCatalog();

    window.addEventListener('admin_data_updated', loadCatalog);
    window.addEventListener('storage', loadCatalog);

    return () => {
      active = false;
      window.removeEventListener('admin_data_updated', loadCatalog);
      window.removeEventListener('storage', loadCatalog);
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
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between">
      <div>
        <Header />

        {/* Page Banner Header */}
        <section className="border-b border-gold/30 bg-[#0B1B3D] text-white px-4 py-8 sm:px-6 lg:px-8 shadow-inner">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gold uppercase tracking-widest mb-2">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span>Category Catalog</span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-gold">
                  Explore Sweets, Namkeen & Gift Collections
                </h1>
                <p className="mt-2 max-w-2xl text-xs sm:text-sm text-gray-300">
                  Filter by categories, price ranges, weight pack sizes, and ratings.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-2 text-xs sm:text-sm font-bold text-gold hover:bg-gold/20 transition flex items-center gap-1.5"
                >
                  <Filter size={15} />
                  <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl bg-gold text-[#0B1B3D] px-4 py-2 text-xs sm:text-sm font-extrabold hover:bg-gold-light transition flex items-center gap-1.5 border border-gold"
                >
                  <RotateCcw size={15} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            
            {/* Left Filter Sidebar */}
            <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="sticky top-24 rounded-2xl border-2 border-gold/30 bg-white p-5 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                  <h2 className="text-base font-black text-[#0B1B3D]">Filter Options</h2>
                  <span className="text-[10px] uppercase font-bold text-gold-dark bg-gold/15 px-2 py-0.5 rounded">Refine</span>
                </div>

                {/* 1. Category Filter */}
                <div>
                  <h3 className="text-xs font-black text-[#0B1B3D] uppercase tracking-wider mb-2">Category</h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {categoryOptions.map((option) => (
                      <label key={option.value} className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#0B1B3D]">
                        <input
                          type="radio"
                          name="category"
                          checked={category === option.value}
                          onChange={() => {
                            setCategory(option.value);
                            setPage(1);
                          }}
                          className="text-[#0B1B3D] focus:ring-gold"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Price Range Filter */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-black text-[#0B1B3D] uppercase tracking-wider mb-2">Price Range</h3>
                  <div className="space-y-1.5">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPrice === ''}
                        onChange={() => {
                          setSelectedPrice('');
                          setPage(1);
                        }}
                        className="text-[#0B1B3D] focus:ring-gold"
                      />
                      <span>All Prices</span>
                    </label>
                    {priceRanges.map((range) => (
                      <label key={range.label} className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700">
                        <input
                          type="radio"
                          name="price"
                          checked={selectedPrice === range.label}
                          onChange={() => {
                            setSelectedPrice(range.label);
                            setPage(1);
                          }}
                          className="text-[#0B1B3D] focus:ring-gold"
                        />
                        <span>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Weight Variant Chips Filter */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-black text-[#0B1B3D] uppercase tracking-wider mb-2">Weight Pack Sizes</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {weightOptions.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => toggleWeight(w)}
                        className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border transition ${
                          selectedWeights.includes(w)
                            ? 'bg-[#0B1B3D] text-gold border-[#0B1B3D]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gold'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Listing Section */}
            <section className="space-y-6">
              {/* Header Bar: Count, Search query info, Sort dropdown, Grid/List switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-gold/30 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-700">
                    Showing <span className="text-[#0B1B3D] font-black">{total > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(total, page * pageSize)}</span> of <span className="text-[#0B1B3D] font-black">{total}</span> items
                  </p>
                  {initialSearch && <p className="text-xs text-gold-dark font-semibold mt-0.5">Results for &quot;{initialSearch}&quot;</p>}
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort dropdown */}
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-gold"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>

                  {/* Grid / List Layout Switcher */}
                  <div className="flex border border-gray-200 rounded-xl p-1 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-[#0B1B3D] text-gold' : 'text-gray-400'}`}
                      title="Grid View"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-[#0B1B3D] text-gold' : 'text-gray-400'}`}
                      title="List View"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Display */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-80 bg-white rounded-2xl animate-pulse border border-gray-200" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gold/40 p-12 text-center space-y-3">
                  <h3 className="text-lg font-black text-[#0B1B3D]">No products matched your criteria</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">Try clearing selected filters or searching for another sweet or namkeen category.</p>
                  <button
                    onClick={clearFilters}
                    className="bg-[#0B1B3D] text-gold px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#162C5B] transition shadow"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {products.map((p) => {
                    const variantsList = p.variants || [{ weightLabel: '250g', price: 200 }];
                    const minPrice = Math.min(...variantsList.map((v: any) => v.discountedPrice || v.price || p.price || 100));
                    const maxPrice = Math.max(...variantsList.map((v: any) => v.price || p.price || 100));
                    const priceDisplay = minPrice === maxPrice ? `₹${minPrice.toLocaleString('en-IN')}` : `₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`;
                    const totalStock = variantsList.reduce((sum: number, v: any) => sum + Number(v.stockQty ?? v.stock ?? 0), 0);
                    const isOutOfStock = totalStock <= 0;

                    const mainImage = p.image || p.primaryImage || p.imageUrls?.[0] || p.images?.[0]?.imageUrl || '/images/sweet-1.jpg';

                    return (
                      <article
                        key={p.id || p.slug}
                        className={`bg-white rounded-2xl border-2 border-gold/20 overflow-hidden shadow-sm hover:shadow-xl hover:border-gold/60 transition-all flex ${
                          viewMode === 'list' ? 'flex-col sm:flex-row items-center p-4 gap-6' : 'flex-col'
                        }`}
                      >
                        {/* Image */}
                        <div className={`relative overflow-hidden bg-gray-50 ${viewMode === 'list' ? 'w-full sm:w-48 h-44 shrink-0 rounded-xl' : 'w-full h-52'}`}>
                          <img
                            src={mainImage}
                            alt={p.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/sweet-1.jpg';
                            }}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          {isOutOfStock && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-md">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark bg-gold/15 px-2 py-0.5 rounded">
                                {p.category?.name || p.categorySlug || p.category || 'Vardayini Special'}
                              </span>
                              <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                                <Star size={13} className="fill-amber-400 text-amber-400" />
                                <span>{p.ratingAvg || p.rating || 4.8}</span>
                              </div>
                            </div>

                            <Link href={`/products/${p.slug}`}>
                              <h3 className="font-extrabold text-[#0B1B3D] text-base hover:text-gold-dark transition line-clamp-1">
                                {p.name}
                              </h3>
                            </Link>

                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {p.description || 'Authentic traditional Indian sweet/namkeen prepared with pure ingredients.'}
                            </p>
                          </div>

                          {/* Weight variants */}
                          <div className="flex flex-wrap gap-1">
                            {variantsList.slice(0, 3).map((v: any, idx: number) => (
                              <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                {v.weightLabel || v.weight}
                              </span>
                            ))}
                          </div>

                          {/* Footer action */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div>
                              <span className="text-[10px] text-gray-400 block font-semibold">Price</span>
                              <span className="text-lg font-black text-[#0B1B3D]">{priceDisplay}</span>
                            </div>

                            <Link
                              href={`/products/${p.slug}`}
                              className={`px-4 py-2 rounded-xl text-xs font-extrabold shadow transition border ${
                                isOutOfStock ? 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300' : 'bg-[#0B1B3D] text-gold hover:bg-[#162C5B] border-gold/30'
                              }`}
                            >
                              {isOutOfStock ? 'Out of Stock' : 'View Details'}
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 flex items-center justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-white border border-gold/40 text-[#0B1B3D] disabled:opacity-40 hover:bg-gold/20 transition"
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx + 1)}
                      className={`w-9 h-9 rounded-xl text-xs font-extrabold transition ${
                        page === idx + 1
                          ? 'bg-[#0B1B3D] text-gold shadow'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gold'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-white border border-gold/40 text-[#0B1B3D] disabled:opacity-40 hover:bg-gold/20 transition"
                  >
                    Next →
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}