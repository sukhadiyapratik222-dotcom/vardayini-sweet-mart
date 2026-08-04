'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import ProductGrid from '../../../components/ProductGrid';
import { products as localProducts, categories } from '../../../data';
import { ChevronRight, Filter, ShoppingBag, Layers, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function SubcategoryPage({
  params
}: {
  params: { category: string; subcategory: string }
}) {
  const { category: categorySlug, subcategory: subcategorySlug } = params;
  const [allProducts, setAllProducts] = useState<any[]>(localProducts);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const { t } = useLanguage();

  // Fetch full catalog (MySQL DB + Admin localStorage + Local data)
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/products?limit=100`);
        if (res.ok) {
          const data = await res.json();
          const apiProducts = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);

          let adminProducts: any[] = [];
          if (typeof window !== "undefined") {
            const cachedCatalog = localStorage.getItem("admin_products_catalog");
            if (cachedCatalog) {
              try {
                adminProducts = JSON.parse(cachedCatalog);
              } catch (e) {}
            }
          }

          const combinedPool = [...apiProducts, ...adminProducts];
          const uniqueMap = new Map();
          const seenNames = new Set();

          combinedPool.forEach((p) => {
            const nameKey = (p.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "");
            const slugKey = (p.slug || String(p.id)).toLowerCase().trim();

            if (nameKey && !seenNames.has(nameKey) && !uniqueMap.has(slugKey)) {
              seenNames.add(nameKey);
              uniqueMap.set(slugKey, p);
            }
          });

          const activeOnly = Array.from(uniqueMap.values()).filter((p: any) => p.isActive !== false);
          setAllProducts(activeOnly);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // Fallback ONLY if backend API is completely offline
      setAllProducts(localProducts.filter((p: any) => p.isActive !== false));
      setLoading(false);
    }

    loadCatalog();
  }, []);

  // Find parent category and subcategory info
  const parentCatObj = Object.values(categories).find(c => c.slug === categorySlug);
  const subCatObj = parentCatObj?.subcategories?.find(s => s.slug === subcategorySlug);

  const categoryName = parentCatObj?.name || categorySlug.replace(/-/g, ' ');
  const subcategoryName = subCatObj?.name || subcategorySlug.replace(/-/g, ' ');

  // Filter products by category & subcategory
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(
      (p) =>
        p.subcategory === subcategorySlug ||
        p.categorySlug === subcategorySlug ||
        p.category === subcategorySlug ||
        p.category === categorySlug ||
        p.categorySlug === categorySlug
    );

    // Weight filter
    if (selectedWeight !== 'all') {
      result = result.filter((p) =>
        (p.variants || []).some((v: any) => (v.weight || v.weightLabel) === selectedWeight)
      );
    }

    // Sort products
    if (sortBy === 'price_low') {
      result.sort(
        (a, b) =>
          Math.min(...(a.variants || [{ price: 100 }]).map((v: any) => v.discountedPrice || v.price)) -
          Math.min(...(b.variants || [{ price: 100 }]).map((v: any) => v.discountedPrice || v.price))
      );
    } else if (sortBy === 'price_high') {
      result.sort(
        (a, b) =>
          Math.max(...(b.variants || [{ price: 100 }]).map((v: any) => v.price)) -
          Math.max(...(a.variants || [{ price: 100 }]).map((v: any) => v.price))
      );
    } else if (sortBy === 'rating') {
      result.sort((a, b) => Number(b.ratingAvg || b.rating || 4.8) - Number(a.ratingAvg || a.rating || 4.8));
    }

    return result;
  }, [allProducts, categorySlug, subcategorySlug, selectedWeight, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gold/20 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 max-w-7xl mx-auto">
          <Link href="/" className="hover:text-gold-dark transition font-medium">Home</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link href={`/categories/${categorySlug}`} className="hover:text-gold-dark transition capitalize font-medium">
            {categoryName}
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-bold text-[#0B1B3D] capitalize">{subcategoryName}</span>
        </div>
      </div>

      {/* Main Content Layout */}
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
              {parentCatObj.subcategories.map((sub) => {
                const isActive = sub.slug === subcategorySlug;
                return (
                  <Link
                    key={sub.slug}
                    href={`/categories/${categorySlug}/${sub.slug}`}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-gold text-[#0B1B3D] shadow border border-gold'
                        : 'bg-white/10 text-gray-200 hover:bg-gold/20 hover:text-gold border border-white/10'
                    }`}
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          
          {/* Left Sidebar Category Menu & Filters */}
          <aside className="hidden md:block md:col-span-1 space-y-6 md:sticky md:top-24">
            
            {/* Category Banner Card */}
            <div className="bg-[#0B1B3D] border-2 border-gold/40 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-[10px] font-bold uppercase tracking-wider mb-3">
                  <Layers size={12} />
                  <span>{categoryName} Menu</span>
                </div>

                <h1 className="text-2xl font-extrabold text-white capitalize tracking-tight">
                  {subcategoryName}
                </h1>
                
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  Handcrafted with premium ingredients, authentic recipes, and guaranteed fresh delivery.
                </p>

                {/* Subcategories List Menu */}
                {parentCatObj?.subcategories && parentCatObj.subcategories.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-gold/30">
                    <span className="text-[11px] font-bold uppercase text-gold tracking-wider block mb-2">
                      Explore Categories
                    </span>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {parentCatObj.subcategories.map((sub) => {
                        const isActive = sub.slug === subcategorySlug;
                        return (
                          <Link
                            key={sub.slug}
                            href={`/categories/${categorySlug}/${sub.slug}`}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                              isActive
                                ? 'bg-gold text-[#0B1B3D] shadow font-bold'
                                : 'text-gray-200 hover:bg-gold/15 hover:text-gold'
                            }`}
                          >
                            <span>{sub.name}</span>
                            <ChevronRight size={14} className={isActive ? 'text-[#0B1B3D]' : 'opacity-60'} />
                          </Link>
                        );
                      })}
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
                  Filter Options
                </h3>
                <button
                  onClick={() => { setSelectedWeight('all'); setSortBy('popularity'); }}
                  className="text-xs text-gold-dark hover:underline font-semibold"
                >
                  Reset
                </button>
              </div>

              {/* Weight Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Select Pack Size:</label>
                <select
                  value={selectedWeight}
                  onChange={(e) => setSelectedWeight(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-gold"
                >
                  <option value="all">All Pack Sizes</option>
                  <option value="250g">250g</option>
                  <option value="500g">500g</option>
                  <option value="1kg">1kg</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Sort Products By:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-gold"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

          </aside>

          {/* Right Main Product Area */}
          <div className="md:col-span-2 lg:col-span-3">
            {/* Top Info Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gold/20 mb-6 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs sm:text-sm font-semibold text-[#0B1B3D]">
                Showing <strong className="text-gold-dark font-extrabold">{filteredProducts.length}</strong> products in <span className="capitalize">{subcategoryName}</span>
              </span>

              {/* Mobile Filter Control */}
              <div className="flex items-center gap-3">
                <div className="md:hidden flex items-center gap-2">
                  <select
                    value={selectedWeight}
                    onChange={(e) => setSelectedWeight(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-800 bg-white"
                  >
                    <option value="all">All Sizes</option>
                    <option value="250g">250g</option>
                    <option value="500g">500g</option>
                    <option value="1kg">1kg</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-800 bg-white"
                  >
                    <option value="popularity">Popular</option>
                    <option value="price_low">Price ↑</option>
                    <option value="price_high">Price ↓</option>
                  </select>
                </div>

                {selectedWeight !== 'all' && (
                  <span className="hidden sm:inline bg-gold/20 text-[#0B1B3D] text-xs font-bold px-2.5 py-1 rounded-md border border-gold/40">
                    Size: {selectedWeight}
                  </span>
                )}
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gold/20 shadow-sm text-xs font-bold text-gray-500 flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-gold-dark" />
                <span>Loading products...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gold/20 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#0B1B3D] text-gold flex items-center justify-center mx-auto mb-4 border border-gold/40">
                  <ShoppingBag size={30} />
                </div>
                <h3 className="text-lg font-bold text-[#0B1B3D]">No products found</h3>
                <p className="text-gray-500 text-xs mt-1">
                  There are currently no products available matching your selection.
                </p>
                <button
                  onClick={() => { setSelectedWeight('all'); setSortBy('popularity'); }}
                  className="mt-6 bg-[#0B1B3D] text-gold px-6 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#162C5B] transition shadow border border-gold/30"
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
