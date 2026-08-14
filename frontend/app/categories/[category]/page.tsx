'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CategoryNav from '../../components/CategoryNav';
import CategoryHeroBanner from '../../components/CategoryHeroBanner';
import CategoryProductCard from '../../components/CategoryProductCard';
import { products as localProducts, placeholderProducts, priceRanges, sortOptions, categories } from '../../data';
import { ChevronDown, Filter, RefreshCw, MessageCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const WHATSAPP_NUMBER = '919825012345'; // TODO: replace with real WhatsApp number

interface Filters {
  priceRange: [number, number];
  weight: string[];
  sortBy: string;
  tag: string;
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const categorySlug = params.category;
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    price: true,
    weight: false,
    tag: false,
  });
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, Infinity],
    weight: [],
    sortBy: 'popularity',
    tag: '',
  });

  const normalizeCat = (slug: string) => {
    if (slug === 'corporate-gifts' || slug === 'corporate-gift-boxes') return 'corporate-gift-boxes';
    if (['dry-fruits-nuts', 'dry-fruits', 'dry-fruits-and-nuts', 'dryfruits'].includes(slug)) return 'dry-fruits-nuts';
    if (slug === 'premium-baklava' || slug === 'baklava') return 'premium-baklava';
    return slug;
  };

  const targetCategory = normalizeCat(categorySlug);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      let apiProducts: any[] = [];

      try {
        const res = await fetch(`${API_BASE}/products?limit=200`);
        if (res.ok) {
          const data = await res.json();
          apiProducts = Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : [];
        }
      } catch (e) {}

      let adminProducts: any[] = [];
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('admin_products_catalog');
        if (cached) {
          try { adminProducts = JSON.parse(cached); } catch (e) {}
        }
      }

      // Merge: API → admin cache. Fallback to local static → placeholder only if db is empty
      const dbProducts = [...apiProducts, ...adminProducts];
      const pool = dbProducts.length > 0 ? dbProducts : [...localProducts, ...placeholderProducts];
      const uniqueMap = new Map<string, any>();
      const seenNames = new Set<string>();

      pool.forEach((p) => {
        const nameKey = (p.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '');
        const slugKey = (p.slug || String(p.id)).toLowerCase().trim();
        if (nameKey && !seenNames.has(nameKey) && !uniqueMap.has(slugKey)) {
          seenNames.add(nameKey);
          uniqueMap.set(slugKey, p);
        }
      });

      const active = Array.from(uniqueMap.values()).filter((p: any) => p.isActive !== false);
      setAllProducts(active);
      setLoading(false);
    }

    loadCatalog();
  }, []);

  const parentCatObj = Object.values(categories).find((c) => normalizeCat(c.slug) === targetCategory);
  const categoryName =
    parentCatObj?.name ||
    categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => {
      const pCat = normalizeCat(p.category || (p as any).categorySlug || (p as any).category?.slug || '');
      const pSub = normalizeCat((p as any).subcategory || '');

      if (pCat === targetCategory || pSub === targetCategory) return true;

      if (parentCatObj?.subcategories) {
        const subSlugs = parentCatObj.subcategories.map((s: any) => normalizeCat(s.slug));
        if (subSlugs.includes(pCat) || subSlugs.includes(pSub)) return true;
      }

      return false;
    });

    // Price filter
    result = result.filter((p) => {
      const vars = p.variants || [];
      if (!vars.length) return true;
      const minP = Math.min(...vars.map((v: any) => v.discountedPrice || v.price || 0));
      return minP >= filters.priceRange[0] && minP <= filters.priceRange[1];
    });

    // Weight filter
    if (filters.weight.length > 0) {
      result = result.filter((p) =>
        (p.variants || []).some((v: any) => filters.weight.includes(v.weight || v.weightLabel))
      );
    }

    // Tag filter
    if (filters.tag) {
      result = result.filter((p) => {
        if (filters.tag === 'best_seller') return p.isBestSeller || p.tag === 'best_seller';
        if (filters.tag === 'new_arrival') return p.isNew || p.tag === 'new_arrival';
        if (filters.tag === 'premium') return p.isPremium || p.tag === 'premium';
        return true;
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_low':
        result.sort((a, b) =>
          Math.min(...(a.variants || [{ price: 0 }]).map((v: any) => v.discountedPrice || v.price)) -
          Math.min(...(b.variants || [{ price: 0 }]).map((v: any) => v.discountedPrice || v.price))
        );
        break;
      case 'price_high':
        result.sort((a, b) =>
          Math.max(...(b.variants || [{ price: 0 }]).map((v: any) => v.price)) -
          Math.max(...(a.variants || [{ price: 0 }]).map((v: any) => v.price))
        );
        break;
      case 'rating':
        result.sort((a, b) => Number(b.ratingAvg || b.rating || 4.8) - Number(a.ratingAvg || a.rating || 4.8));
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        result.sort((a, b) => Number(b.ratingCount || b.reviews || 0) - Number(a.ratingCount || a.reviews || 0));
    }

    return result;
  }, [allProducts, filters, targetCategory, parentCatObj]);

  const allWeights = Array.from(
    new Set(allProducts.flatMap((p) => (p.variants || []).map((v: any) => v.weight || v.weightLabel)))
  ).filter(Boolean);

  const whatsappCategoryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello! I'd like to enquire about your ${categoryName} range. Please share the full catalog.`
  )}`;

  const hasTodoProducts = filteredProducts.some(
    (p) => p.id?.startsWith('todo-') || p.slug?.endsWith('-todo')
  );

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Header />
      <CategoryNav />

      <CategoryHeroBanner
        categorySlug={targetCategory}
        categoryName={categoryName}
        productCount={filteredProducts.length}
        subcategories={parentCatObj?.subcategories}
        parentSlug={targetCategory}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 max-w-7xl mx-auto">
          <Link href="/" className="hover:text-[#D4AF37] transition font-medium">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-[#D4AF37] transition font-medium">All Products</Link>
          <span>/</span>
          <span className="font-bold text-[#0B1B3D] capitalize">{categoryName}</span>
        </div>
      </div>

      {/* TODO notice bar */}
      {hasTodoProducts && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <p className="max-w-7xl mx-auto text-xs text-amber-700 font-medium">
            🔔 <strong>Placeholder products</strong> are marked with a dashed border &amp; "TODO: Replace" badge.
            Add real products via the{' '}
            <a href="http://localhost:4000/admin" className="underline font-bold">Admin Panel</a>{' '}
            or update <code className="bg-amber-100 px-1 rounded">frontend/app/data.ts</code>.
          </p>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-start">

          {/* Sidebar */}
          <aside className="hidden md:block md:col-span-1 space-y-4 sticky top-20">
            {parentCatObj?.subcategories && parentCatObj.subcategories.length > 0 && (
              <div className="bg-[#0B1B3D] rounded-2xl p-5 shadow-lg text-white">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37] mb-3">
                  Browse Subcategories
                </p>
                <div className="space-y-1">
                  {parentCatObj.subcategories.map((sub: any) => (
                    <Link
                      key={sub.slug}
                      href={`/categories/${targetCategory}/${sub.slug}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-gray-200 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition"
                    >
                      {sub.name}
                      <span className="opacity-50">›</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D4AF37]/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
                  <Filter size={15} className="text-[#D4AF37]" />
                  Filter
                </h3>
                <button
                  onClick={() => setFilters({ priceRange: [0, Infinity], weight: [], sortBy: 'popularity', tag: '' })}
                  className="text-xs text-[#AA7C11] hover:underline font-semibold"
                >
                  Clear All
                </button>
              </div>

              {/* Price */}
              <div className="border-b border-gray-100 pb-3">
                <button
                  onClick={() => setExpandedFilters((p) => ({ ...p, price: !p.price }))}
                  className="flex items-center justify-between w-full text-xs font-bold text-[#0B1B3D]"
                >
                  Price Range
                  <ChevronDown size={14} className={`transition ${expandedFilters.price ? 'rotate-180' : ''}`} />
                </button>
                {expandedFilters.price && (
                  <div className="mt-2 space-y-1.5">
                    {priceRanges.map((r) => (
                      <label key={r.label} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.priceRange[0] === r.min && filters.priceRange[1] === r.max}
                          onChange={() => setFilters((p) => ({ ...p, priceRange: [r.min, r.max] }))}
                          className="rounded border-gray-300 accent-[#0B1B3D]"
                        />
                        {r.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="border-b border-gray-100 pb-3">
                <button
                  onClick={() => setExpandedFilters((p) => ({ ...p, tag: !p.tag }))}
                  className="flex items-center justify-between w-full text-xs font-bold text-[#0B1B3D]"
                >
                  Product Tags
                  <ChevronDown size={14} className={`transition ${expandedFilters.tag ? 'rotate-180' : ''}`} />
                </button>
                {expandedFilters.tag && (
                  <div className="mt-2 space-y-1.5">
                    {[
                      { value: '', label: 'All' },
                      { value: 'best_seller', label: '🏆 Best Sellers' },
                      { value: 'new_arrival', label: '✨ New Arrivals' },
                      { value: 'premium', label: '💎 Premium' },
                    ].map((t) => (
                      <label key={t.value} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="radio"
                          name="tag"
                          checked={filters.tag === t.value}
                          onChange={() => setFilters((p) => ({ ...p, tag: t.value }))}
                          className="accent-[#0B1B3D]"
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Weight */}
              {allWeights.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedFilters((p) => ({ ...p, weight: !p.weight }))}
                    className="flex items-center justify-between w-full text-xs font-bold text-[#0B1B3D]"
                  >
                    Pack Weight
                    <ChevronDown size={14} className={`transition ${expandedFilters.weight ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFilters.weight && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {allWeights.slice(0, 10).map((w: any) => (
                        <button
                          key={w}
                          onClick={() =>
                            setFilters((p) => ({
                              ...p,
                              weight: p.weight.includes(w)
                                ? p.weight.filter((x) => x !== w)
                                : [...p.weight, w],
                            }))
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                            filters.weight.includes(w)
                              ? 'bg-[#0B1B3D] text-[#D4AF37] border-[#0B1B3D]'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37]'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <a
              href={whatsappCategoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              id={`whatsapp-bulk-${targetCategory}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold transition hover:scale-105 shadow-md"
              style={{ background: '#25D366', color: '#fff' }}
            >
              <MessageCircle size={18} />
              Bulk / Wholesale Enquiry
            </a>
          </aside>

          {/* Product area */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl p-4 mb-5 flex items-center justify-between flex-wrap gap-3 border border-[#D4AF37]/20 shadow-sm">
              <span className="text-xs sm:text-sm font-semibold text-[#0B1B3D]">
                Showing <strong className="text-[#AA7C11]">{filteredProducts.length}</strong> products
                {filters.tag && (
                  <span className="ml-1 text-gray-500">({filters.tag.replace('_', ' ')})</span>
                )}
              </span>

              <div className="flex items-center gap-2.5">
                <a
                  href={whatsappCategoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: '#25D36620', color: '#128C7E', border: '1px solid #25D36640' }}
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>

                <label className="text-xs font-bold text-gray-600">Sort:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-[#D4AF37]/20 shadow-sm flex items-center justify-center gap-2 text-sm font-bold text-gray-400">
                <RefreshCw size={18} className="animate-spin text-[#D4AF37]" />
                Loading {categoryName} products...
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <CategoryProductCard
                    key={product.id || product.slug}
                    product={product}
                    isTodoPlaceholder={!!(product.id?.startsWith('todo-') || product.slug?.endsWith('-todo'))}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#D4AF37]/20 shadow-sm space-y-4">
                <p className="text-gray-500 text-sm font-bold">No products match your filters.</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => setFilters({ priceRange: [0, Infinity], weight: [], sortBy: 'popularity', tag: '' })}
                    className="px-5 py-2.5 bg-[#0B1B3D] text-[#D4AF37] rounded-xl text-xs font-extrabold hover:bg-[#162C5B] transition border border-[#D4AF37]/30"
                  >
                    Clear Filters
                  </button>
                  <a
                    href={whatsappCategoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: '#25D366', color: '#fff' }}
                  >
                    <MessageCircle size={14} />
                    Ask on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
