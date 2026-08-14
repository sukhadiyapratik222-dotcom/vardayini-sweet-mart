'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import { productService } from '../lib/api';
import { products as localProducts, Product as LocalProduct } from '../data';

type ProductSearchProps = {
  compact?: boolean;
  showCategorySelect?: boolean;
};

type SearchItem = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  image: string;
  price: number;
};

export default function ProductSearch({ compact = false, showCategorySelect = true }: ProductSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();

    if (trimmed.length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      let found: SearchItem[] = [];

      try {
        const response = await productService.searchSuggestions(trimmed);
        if (response.suggestions && response.suggestions.length > 0) {
          found = response.suggestions.map((p) => {
            const minPrice = Math.min(...p.variants.map((v) => Number(v.discountedPrice ?? v.price)));
            return {
              id: String(p.id),
              name: p.name,
              slug: p.slug,
              categoryName: p.category?.name || 'Product',
              image: p.primaryImage || p.images?.[0]?.imageUrl || '/images/sweet-1.jpg',
              price: minPrice
            };
          });
        }
      } catch (e) {
        // Fallback to local dataset
      }

      if (found.length === 0) {
        found = localProducts
          .filter((p) => {
            const matchQuery = p.name.toLowerCase().includes(trimmed) || p.description.toLowerCase().includes(trimmed) || p.category.toLowerCase().includes(trimmed);
            const matchCat = selectedCategory ? p.category === selectedCategory : true;
            return matchQuery && matchCat;
          })
          .map((p) => {
            const minPrice = p.variants[0]?.discountedPrice || p.variants[0]?.price || 0;
            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              categoryName: p.category.toUpperCase().replace(/-/g, ' '),
              image: p.image,
              price: minPrice
            };
          });
      }

      setItems(found);
      setOpen(true);
      setLoading(false);
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [query, selectedCategory]);

  const results = useMemo(() => items.slice(0, compact ? 5 : 7), [compact, items]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    setOpen(false);
    if (selectedCategory && trimmed) {
      router.push(`/categories/${selectedCategory}?search=${encodeURIComponent(trimmed)}`);
    } else if (selectedCategory) {
      router.push(`/categories/${selectedCategory}`);
    } else if (trimmed) {
      router.push(`/categories?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/categories');
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-center w-full rounded-xl sm:rounded-2xl border-2 border-gold/40 bg-white shadow-sm overflow-hidden focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30 transition-all">
        {/* Search Input */}
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for Products..."
          className={`w-full bg-transparent px-3.5 ${
            compact ? 'py-2 text-xs sm:text-sm' : 'py-2.5 text-sm'
          } text-gray-800 outline-none placeholder-gray-400 font-medium`}
        />

        {/* Category Dropdown */}
        {showCategorySelect && (
          <div className="hidden sm:flex items-center border-l border-gray-200 px-2 shrink-0 bg-gray-50/50 hover:bg-gray-100/50 transition">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-gray-700 font-semibold outline-none cursor-pointer pr-1 py-2"
              aria-label="Filter by Category"
            >
              <option value="">All Categories</option>
              <option value="sweets">Sweets</option>
              <option value="namkeen">Namkeen</option>
              <option value="bakery">Bakery</option>
              <option value="mukhwas">Mukhwas</option>
              <option value="dry-fruits-nuts">Dried Fruits & Nuts</option>
              <option value="premium-baklava">Baklava</option>
              <option value="corporate-gift-boxes">Corporate Gifts</option>
            </select>
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="bg-[#0B1B3D] hover:bg-[#162C5B] text-gold-bright p-2.5 sm:px-4 shrink-0 transition flex items-center justify-center font-bold"
          aria-label="Submit Search"
        >
          <Search size={18} />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border-2 border-gold/40 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gold/20 bg-[#0B1B3D] px-4 py-2.5 text-xs text-gold font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>{loading ? 'Searching Sweets...' : 'Quick Suggestions'}</span>
            </span>
            <Link
              href={`/categories?search=${encodeURIComponent(query.trim())}`}
              className="text-xs text-gold-light hover:underline font-bold"
              onClick={() => setOpen(false)}
            >
              View all results →
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {results.length === 0 && !loading ? (
              <div className="px-4 py-6 text-center text-xs text-gray-500 font-medium">
                No matching products found for &quot;{query}&quot;.
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/products/${item.slug}`);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-gold/15 group"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gold/30">
                    <img
                      src={(item as any).productImages?.[0]?.imageUrl || (item as any).imageUrls?.[0] || (item as any).primaryImage || (item as any).image || '/images/sweet-1.jpg'}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/sweet-1.jpg';
                      }}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs sm:text-sm font-extrabold text-[#0B1B3D] group-hover:text-gold-dark">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                      {item.categoryName}
                    </p>
                  </div>
                  <span className="text-xs font-black text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200 shrink-0">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}