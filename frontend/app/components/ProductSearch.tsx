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
};

type SearchItem = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  image: string;
  price: number;
};

export default function ProductSearch({ compact = false }: ProductSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
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
          .filter((p) => p.name.toLowerCase().includes(trimmed) || p.description.toLowerCase().includes(trimmed) || p.category.toLowerCase().includes(trimmed))
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
  }, [query]);

  const results = useMemo(() => items.slice(0, compact ? 5 : 7), [compact, items]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/categories?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search Kaju Katli, Namkeen, Baklava, Gifts..."
          className={`w-full rounded-2xl border-2 border-gold/40 bg-white px-4 ${
            compact ? 'py-2 text-xs sm:text-sm' : 'py-3 text-sm'
          } pr-11 outline-none transition-all focus:border-gold focus:ring-4 focus:ring-gold/20 shadow-sm`}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-[#0B1B3D] hover:text-gold-dark transition"
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
                No matching sweets or namkeen found for &quot;{query}&quot;.
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
                      src={item.image}
                      alt={item.name}
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