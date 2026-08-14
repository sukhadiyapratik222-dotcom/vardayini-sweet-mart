'use client';

import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';

interface SubCategory {
  name: string;
  slug: string;
}

interface CategoryHeroBannerProps {
  categorySlug: string;
  categoryName: string;
  productCount: number;
  subcategories?: SubCategory[];
  parentSlug?: string;
}

const CATEGORY_META: Record<string, {
  tagline: string;
  description: string;
  badge: string;
  gradient: string;
  accentColor: string;
  image: string;
  whatsappMsg: string;
}> = {
  sweets: {
    tagline: 'Mithai — Made With Pure Ghee & Love',
    description:
      'Since 1976, Vardayini Sweet Mart crafts authentic Indian sweets using time-honoured family recipes — Kaju Katli, Mawa Penda, Mysore Pak & more.',
    badge: '🍮 Sweets (Mithai)',
    gradient: 'from-[#0B1B3D] via-[#162C5B] to-[#0B1B3D]',
    accentColor: '#D4AF37',
    image: '/images/sweet-1.jpg',
    whatsappMsg: 'Hello! I\'d like to enquire about your Sweets (Mithai) range.',
  },
  namkeen: {
    tagline: 'Gujarati Namkeen — Crispy, Spicy & Authentic',
    description:
      'Handmade Ratlami Sev, Khakhra, Millet Snacks, Farali Namkeen & crunchy Gujarati Mixture — perfect for every tea-time and celebration.',
    badge: '🥨 Namkeen & Savories',
    gradient: 'from-[#4A1C0F] via-[#7B2D1A] to-[#4A1C0F]',
    accentColor: '#F5A623',
    image: '/images/sweet-3.jpg',
    whatsappMsg: 'Hello! I\'d like to enquire about your Namkeen & Savories range.',
  },
  'dry-fruits-nuts': {
    tagline: 'Premium Dry Fruits & Nuts — Nature\'s Finest',
    description:
      'Handpicked California Almonds, Premium Cashews, Pistachios, Walnuts & Trail Mixes. Perfect for gifting or daily health routines.',
    badge: '🫘 Dry Fruits & Nuts',
    gradient: 'from-[#1A2E1A] via-[#2D4A2D] to-[#1A2E1A]',
    accentColor: '#6DBE45',
    image: '/images/sweet-4.jpg',
    whatsappMsg: 'Hello! I\'d like to enquire about your Dry Fruits & Nuts range.',
  },
  'corporate-gift-boxes': {
    tagline: 'Festive Gift Boxes — Celebrations Made Sweeter',
    description:
      'Curated festive hampers & corporate gift boxes packed with our finest sweets, namkeen, dry fruits & baklava for Diwali, Eid, Navratri & beyond.',
    badge: '🎁 Festive & Gift Boxes',
    gradient: 'from-[#3D1A0B] via-[#6B2D12] to-[#3D1A0B]',
    accentColor: '#E8942A',
    image: '/images/sweet-5.jpg',
    whatsappMsg: 'Hello! I\'d like to enquire about Festive Gift Boxes & Hampers.',
  },
  bakery: {
    tagline: 'Bakery — Oven-Fresh Every Morning',
    description:
      'Buttery Khari, whole-wheat Biscuits, Jeera Toast & traditional cookies — all baked fresh daily with no artificial preservatives.',
    badge: '🥐 Bakery & Baked Goods',
    gradient: 'from-[#3D2E0B] via-[#6B4F12] to-[#3D2E0B]',
    accentColor: '#F0C040',
    image: '/images/sweet-2.jpg',
    whatsappMsg: 'Hello! I\'d like to enquire about your Bakery products.',
  },
};

const FALLBACK_META = {
  tagline: 'Authentic Indian Delicacies Since 1976',
  description: 'Browse our curated collection of handmade sweets, savories, and gifts crafted with pure ingredients and traditional recipes.',
  badge: '⭐ Products',
  gradient: 'from-[#0B1B3D] via-[#162C5B] to-[#0B1B3D]',
  accentColor: '#D4AF37',
  image: '/images/sweet-1.jpg',
  whatsappMsg: 'Hello! I\'d like to know more about your products.',
};

const WHATSAPP_NUMBER = '919825012345'; // TODO: replace with real WhatsApp number

export default function CategoryHeroBanner({
  categorySlug,
  categoryName,
  productCount,
  subcategories = [],
  parentSlug,
}: CategoryHeroBannerProps) {
  const meta = CATEGORY_META[categorySlug] || FALLBACK_META;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(meta.whatsappMsg)}`;

  return (
    <div className={`relative bg-gradient-to-r ${meta.gradient} overflow-hidden`}>
      {/* Background decorative pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${meta.accentColor} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${meta.accentColor} 0%, transparent 40%)`,
        }}
      />
      {/* Gold accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 opacity-80"
        style={{ background: `linear-gradient(to bottom, transparent, ${meta.accentColor}, transparent)` }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left: Text content */}
          <div className="md:col-span-2 space-y-4">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
              style={{
                background: `${meta.accentColor}22`,
                borderColor: `${meta.accentColor}55`,
                color: meta.accentColor,
              }}
            >
              <Tag size={12} />
              {meta.badge}
            </div>

            {/* Main heading */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                {categoryName}
              </h1>
              <p className="text-sm sm:text-base font-medium mt-1" style={{ color: meta.accentColor }}>
                {meta.tagline}
              </p>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed max-w-xl">
              {meta.description}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id={`whatsapp-enquire-${categorySlug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-200 hover:scale-105 shadow-lg"
                style={{
                  background: '#25D366',
                  color: '#fff',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enquire on WhatsApp
              </a>

              {subcategories.length > 0 && (
                <Link
                  href={`/categories/${parentSlug || categorySlug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                >
                  Browse All
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {/* Product count badge */}
            <p className="text-xs text-gray-400 font-medium pt-1">
              {productCount > 0 ? (
                <>{productCount} products available</>
              ) : (
                <>Coming soon — enquire via WhatsApp for bulk orders</>
              )}
            </p>
          </div>

          {/* Right: Hero image */}
          <div className="hidden md:block relative">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square max-w-xs ml-auto"
              style={{
                border: `2px solid ${meta.accentColor}40`,
                boxShadow: `0 0 60px ${meta.accentColor}20`,
              }}
            >
              <img
                src={meta.image}
                alt={categoryName}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${meta.accentColor}20 0%, transparent 60%)` }}
              />
              {/* Corner badge */}
              <div
                className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-black"
                style={{ background: meta.accentColor, color: '#0B1B3D' }}
              >
                Since 1976
              </div>
            </div>
          </div>
        </div>

        {/* Subcategory pills row */}
        {subcategories.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Browse:</span>
              {subcategories.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/categories/${parentSlug || categorySlug}/${sub.slug}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 border hover:scale-105"
                  style={{
                    borderColor: `${meta.accentColor}40`,
                    background: `${meta.accentColor}15`,
                    color: meta.accentColor,
                  }}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
