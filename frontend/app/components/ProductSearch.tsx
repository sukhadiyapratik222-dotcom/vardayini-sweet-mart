'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { productService, ApiProduct } from '../lib/api';

type ProductSearchProps = {
  compact?: boolean;
};

function getSuggestionPrice(product: ApiProduct) {
  const prices = product.variants.map((variant) => Number(variant.discountedPrice ?? variant.price));
  return Math.min(...prices);
}

export default function ProductSearch({ compact = false }: ProductSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ApiProduct[]>([]);
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
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await productService.searchSuggestions(trimmed);
        setSuggestions(response.suggestions);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const results = useMemo(() => suggestions.slice(0, compact ? 5 : 6), [compact, suggestions]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search sweets, namkeen, gifts..."
          className={`w-full rounded-full border border-gray-300 bg-white px-4 ${compact ? 'py-2 text-sm' : 'py-3 text-sm'} pr-11 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20`}
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-xs uppercase tracking-[0.25em] text-gray-500">
            <span>{loading ? 'Searching' : 'Suggestions'}</span>
            <Link href={`/products?search=${encodeURIComponent(query.trim())}`} className="text-maroon">
              View all
            </Link>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 && !loading ? (
              <p className="px-4 py-6 text-sm text-gray-500">No products found.</p>
            ) : (
              results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/products/${product.slug}`);
                  }}
                  className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gold/10 last:border-b-0"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={product.primaryImage ?? product.images[0]?.imageUrl ?? '/images/sweet-1.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category?.name ?? 'Product'}</p>
                  </div>
                  <span className="text-sm font-semibold text-maroon">
                    ₹{getSuggestionPrice(product).toLocaleString('en-IN')}
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