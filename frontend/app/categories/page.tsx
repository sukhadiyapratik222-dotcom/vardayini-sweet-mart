'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, List, ChevronDown, X } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { products, priceRanges, sortOptions, categories } from '../data';

interface Filters {
  category: string[];
  priceRange: [number, number];
  weight: string[];
  sortBy: string;
}

export default function CategoriesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    weight: true,
  });
  const [filters, setFilters] = useState<Filters>({
    category: [],
    priceRange: [0, Infinity],
    weight: [],
    sortBy: 'popularity',
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (filters.category.length > 0) {
      result = result.filter((p) => filters.category.includes(p.category));
    }

    // Price filter
    const minPrice = Math.min(...result.map((p) => Math.min(...p.variants.map((v) => v.discountedPrice || v.price))));
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
  }, [filters]);

  const toggleFilter = (filterType: string) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category],
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
      category: [],
      priceRange: [0, Infinity],
      weight: [],
      sortBy: 'popularity',
    });
  };

  const categoryOptions = Object.entries(categories).map(([_, cat]) => ({
    value: cat.slug,
    label: cat.name,
  }));

  const allWeights = Array.from(new Set(products.flatMap((p) => p.variants.map((v) => v.weight))));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-maroon">Products</h1>
        <p className="text-gray-600 mt-2">Browse our collection of sweets, namkeen, and more</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="bg-white rounded-lg p-6 space-y-6 sticky top-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-maroon">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-xs text-maroon hover:underline font-semibold"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => toggleFilter('category')}
                  className="flex items-center justify-between w-full font-semibold text-gray-800 hover:text-maroon"
                >
                  Categories
                  <ChevronDown
                    size={16}
                    className={`transition ${expandedFilters.category ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.category && (
                  <div className="mt-3 space-y-2">
                    {categoryOptions.map((cat) => (
                      <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(cat.value)}
                          onChange={() => toggleCategory(cat.value)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => toggleFilter('price')}
                  className="flex items-center justify-between w-full font-semibold text-gray-800 hover:text-maroon"
                >
                  Price Range
                  <ChevronDown
                    size={16}
                    className={`transition ${expandedFilters.price ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.price && (
                  <div className="mt-3 space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.label} className="flex items-center gap-2 cursor-pointer">
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
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Weight Filter */}
              <div>
                <button
                  onClick={() => toggleFilter('weight')}
                  className="flex items-center justify-between w-full font-semibold text-gray-800 hover:text-maroon"
                >
                  Weight
                  <ChevronDown
                    size={16}
                    className={`transition ${expandedFilters.weight ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.weight && (
                  <div className="mt-3 space-y-2">
                    {allWeights.map((weight) => (
                      <label key={weight} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.weight.includes(weight)}
                          onChange={() => toggleWeight(weight)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{weight}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Top Bar */}
            <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-3 py-2 text-sm font-semibold text-maroon border border-maroon rounded-lg"
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <span className="text-sm text-gray-600">
                  Showing {filteredProducts.length} products
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
                  }
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition ${
                      viewMode === 'grid'
                        ? 'bg-maroon text-cream'
                        : 'text-gray-600 hover:text-maroon'
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition ${
                      viewMode === 'list'
                        ? 'bg-maroon text-cream'
                        : 'text-gray-600 hover:text-maroon'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No products found matching your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-maroon text-cream rounded-lg font-semibold hover:bg-[#5f1313] transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
