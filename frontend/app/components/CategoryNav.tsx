'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CATEGORY_NAV = [
  { name: 'Sweets (Mithai)', slug: 'sweets', emoji: '🍮', desc: 'Kaju, Mawa, Ghee Sweets' },
  { name: 'Namkeen', slug: 'namkeen', emoji: '🥨', desc: 'Sev, Khakhra, Mixture' },
  { name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts', emoji: '🫘', desc: 'Cashews, Almonds, Pistachios' },
  { name: 'Festive Gift Boxes', slug: 'corporate-gift-boxes', emoji: '🎁', desc: 'Combos & Gift Hampers' },
  { name: 'Bakery', slug: 'bakery', emoji: '🥐', desc: 'Biscuits, Khari, Toast' },
];

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0">
          {CATEGORY_NAV.map((cat) => {
            const href = `/categories/${cat.slug}`;
            const isActive =
              pathname === href ||
              pathname.startsWith(`/categories/${cat.slug}/`);

            return (
              <Link
                key={cat.slug}
                href={href}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-semibold
                  border-b-2 transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'border-[#D4AF37] text-[#0B1B3D] bg-amber-50/60'
                    : 'border-transparent text-gray-600 hover:text-[#0B1B3D] hover:border-amber-300 hover:bg-amber-50/40'
                  }
                `}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
