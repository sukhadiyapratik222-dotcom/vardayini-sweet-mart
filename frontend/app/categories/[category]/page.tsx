'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import ProductGrid from '../../components/ProductGrid';
import { products, priceRanges, sortOptions, categories } from '../../data';
import { ChevronDown, ChevronRight, Filter, Layers, ArrowRight } from 'lucide-react';

interface Filters {
  category: string[];
  priceRange: [number, number];
  weight: string[];
  sortBy: string;
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const categorySlug = params.category;
  const [showFilters, setShowFilters] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    price: true,
    weight: true,
  });
  const [filters, setFilters] = useState<Filters>({
    category: [categorySlug],
    priceRange: [0, Infinity],
    weight: [],
    sortBy: 'popularity',
  });

  const parentCatObj = Object.values(categories).find(c => c.slug === categorySlug);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.category === categorySlug);

    // Price filter
    result = result.filter((p) => {
      const productMinPrice = Math.min(...p.variants.map((v) => v.discountedPrice || v.price));
      const productMaxPrice = Math.max(...p.variants.map((v) => v.price));
      return productMinPrice >= filters.priceRange[0] && productMaxPrice <= filters.priceRange[1];
    });

    // Weight filter
    if (filters.weight.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => filters.weight.includes(v.weight))
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_low':
        result.sort(
          (a, b) =>
            Math.min(...a.variants.map((v) => v.discountedPrice || v.price)) -
            Math.min(...b.variants.map((v) => v.discountedPrice || v.price))
        );
        break;
      case 'price_high':
        result.sort(
          (a, b) =>
            Math.max(...b.variants.map((v) => v.price)) -
            Math.max(...a.variants.map((v) => v.price))
        );
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'popularity':
      default:
        result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [filters, categorySlug]);

  const toggleFilter = (filterType: string) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const toggleWeight = (weight: string) => {
    setFilters((prev) => ({
      ...prev,
      weight: prev.weight.includes(weight)
        ? prev.weight.filter((w) => w !== weight)
        : [...prev.weight, weight],
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: [categorySlug],
      priceRange: [0, Infinity],
      weight: [],
      sortBy: 'popularity',
    });
  };

  const allWeights = Array.from(
    new Set(products.filter((p) => p.category === categorySlug).flatMap((p) => p.variants.map((v) => v.weight)))
  );

  const categoryName = parentCatObj?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace('-', ' ');

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gold/20 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 max-w-7xl mx-auto">
          <Link href="/" className="hover:text-gold-dark transition font-medium">Home</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-bold text-[#0B1B3D] capitalize">{categoryName}</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Mobile / Narrow Screen Horizontal Subcategory Pills */}
        {parentCatObj?.subcategories && parentCatObj.subcategories.length > 0 && (
          <div className="md:hidden mb-6 bg-[#0B1B3D] border border-gold/30 rounded-xl p-4 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase text-gold tracking-wider flex items-center gap-1.5">
                <Layers size={13} />
                {categoryName} Categories
              </span>
              <span className="text-[11px] text-gray-300 font-semibold">{filteredProducts.length} products</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
              {parentCatObj.subcategories.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/categories/${categorySlug}/${sub.slug}`}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap bg-white/10 text-gray-200 hover:bg-gold/20 hover:text-gold border border-white/10"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          
          {/* Sidebar Menu & Filters (Visible on md and larger) */}
          <aside className="hidden md:block md:col-span-1 space-y-6 md:sticky md:top-24">
            {/* Category Left Menu Card */}
            <div className="bg-[#0B1B3D] border-2 border-gold/40 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-[10px] font-bold uppercase tracking-wider mb-3">
                  <Layers size={12} />
                  <span>Category Menu</span>
                </div>

                <h1 className="text-2xl font-extrabold text-white capitalize tracking-tight">
                  {categoryName}
                </h1>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  Browse our authentic {categoryName.toLowerCase()} handcrafted with pure ghee & love.
                </p>

                {/* Subcategories List */}
                {parentCatObj?.subcategories && parentCatObj.subcategories.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-gold/30">
                    <span className="text-[11px] font-bold uppercase text-gold tracking-wider block mb-2">
                      Subcategories
                    </span>
                    <div className="space-y-1.5">
                      {parentCatObj.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${categorySlug}/${sub.slug}`}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-gray-200 hover:bg-gold/20 hover:text-gold transition"
                        >
                          <span>{sub.name}</span>
                          <ArrowRight size={12} className="opacity-60" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gold/20 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
                  <Filter size={16} className="text-gold-dark" />
                  Filter Products
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gold-dark hover:underline font-semibold"
                >
                  Clear All
                </button>
              </div>

              {/* Price Range */}
              <div className="border-b border-gray-100 pb-3">
                <button
                  onClick={() => toggleFilter('price')}
                  className="flex items-center justify-between w-full font-bold text-xs text-[#0B1B3D]"
                >
                  Price Range
                  <ChevronDown
                    size={14}
                    className={`transition ${expandedFilters.price ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.price && (
                  <div className="mt-2.5 space-y-1.5">
                    {priceRanges.map((range) => (
                      <label key={range.label} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={
                            filters.priceRange[0] === range.min &&
                            filters.priceRange[1] === range.max
                          }
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: [range.min, range.max],
                            }))
                          }
                          className="rounded border-gray-300 text-[#0B1B3D]"
                        />
                        <span>{range.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Weight */}
              {allWeights.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleFilter('weight')}
                    className="flex items-center justify-between w-full font-bold text-xs text-[#0B1B3D]"
                  >
                    Pack Weight
                    <ChevronDown
                      size={14}
                      className={`transition ${expandedFilters.weight ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedFilters.weight && (
                    <div className="mt-2.5 space-y-1.5">
                      {allWeights.map((weight) => (
                        <label key={weight} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={filters.weight.includes(weight)}
                            onChange={() => toggleWeight(weight)}
                            className="rounded border-gray-300 text-[#0B1B3D]"
                          />
                          <span>{weight}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="md:col-span-2 lg:col-span-3">
            {/* Top Controls Bar */}
            <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4 border border-gold/20 shadow-sm">
              <span className="text-xs sm:text-sm font-semibold text-[#0B1B3D]">
                Showing <strong className="text-gold-dark font-extrabold">{filteredProducts.length}</strong> products in <span className="capitalize">{categoryName}</span>
              </span>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-gray-700">Sort By:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
                  }
                  className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg focus:outline-none focus:border-gold bg-white"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gold/20 shadow-sm">
                <p className="text-gray-600 text-sm">No products found in this category.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2.5 bg-[#0B1B3D] text-gold rounded-xl text-xs font-extrabold hover:bg-[#162C5B] transition border border-gold/30"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

