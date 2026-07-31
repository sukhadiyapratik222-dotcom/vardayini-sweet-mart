'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories } from '../data';
import { ChevronDown, ShoppingCart, User, Menu, X, Globe, LogOut, Sparkles, Tag } from 'lucide-react';
import ProductSearch from './ProductSearch';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../lib/translations';

const announcements = [
  { badge: "SPECIAL OFFER", text: "🚚 Free Express Delivery across India on orders above ₹599!" },
  { badge: "PROMO CODE", text: "🎁 Get 10% OFF Premium Baklava & Gift Boxes! Code: FESTIVE10" },
  { badge: "EST. 1976", text: "🌟 Authentic Sweets & Namkeen Handcrafted with Pure Ghee" },
  { badge: "STORE PICKUP", text: "🏪 Fresh Pickup Available at Surat, Ahmedabad & Vadodara Outlets!" },
];

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleMenu = (categoryKey: string) => {
    setActiveMenu(activeMenu === categoryKey ? null : categoryKey);
  };

  const categoryKeys = Object.keys(categories);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gold/30">
      {/* Top bar */}
      <div className="bg-[#0B1B3D] px-4 py-2 sm:px-6 lg:px-8 border-b border-gold/30">
        <div className="flex items-center justify-end text-xs sm:text-sm text-gold-light">
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-gold/15 px-2.5 py-1 rounded-md border border-gold/30">
              <Globe size={14} className="text-gold" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-gold font-semibold text-xs border-none outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                <option value="en" className="bg-[#0B1B3D] text-white">English</option>
                <option value="hi" className="bg-[#0B1B3D] text-white">हिन्दी (Hindi)</option>
                <option value="gu" className="bg-[#0B1B3D] text-white">ગુજરાતી (Gujarati)</option>
              </select>
            </div>

            {user ? (
              <>
                <span className="text-gold font-medium">{t.hello}, {user.name}</span>
                {user.isAdmin ? (
                  <Link href="/admin/products" className="hover:text-gold transition font-semibold text-amber-300">{t.adminPortal}</Link>
                ) : (
                  <Link href="/dashboard" className="hover:text-gold transition">{t.dashboard}</Link>
                )}
                <button onClick={logout} className="hover:text-gold transition flex items-center gap-1">
                  <LogOut size={14} /> {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-gold transition">{t.signIn}</Link>
                <Link href="/signup" className="hover:text-gold transition">{t.signUp}</Link>
                <Link href="/admin/login" className="hover:text-gold transition text-amber-300 font-semibold">{t.admin}</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gold shadow-md bg-[#0B1B3D] group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Vardayini Sweet Mart Since 1976" fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold text-[#0B1B3D] tracking-tight group-hover:text-gold-dark transition-colors">
                {t.brandName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-dark font-semibold">
                {t.brandTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            {categoryKeys.map((key) => {
              const cat = categories[key as keyof typeof categories];
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

              return (
                <div
                  key={key}
                  className="relative group"
                  onMouseEnter={() => setActiveMenu(key)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button className="px-2.5 py-2 text-sm font-semibold text-[#0B1B3D] hover:text-gold-dark transition flex items-center gap-1 whitespace-nowrap">
                    {cat.slug === 'our-special' ? t.ourSpecials : cat.name}
                    {hasSubcategories && <ChevronDown size={15} />}
                  </button>

                  {/* Mega Menu Dropdown */}
                  {hasSubcategories && (
                    <div className="absolute left-0 mt-0 w-52 bg-[#0B1B3D] border border-gold/30 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${cat.slug}/${sub.slug}`}
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gold/20 hover:text-gold transition font-medium"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <ProductSearch compact />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Link href={user ? (user.isAdmin ? "/admin/products" : "/dashboard") : "/login"} className="text-[#0B1B3D] hover:text-gold-dark transition hidden sm:block" title={user ? user.name : t.signIn}>
              <User size={22} />
            </Link>
            <Link href="/cart" className="text-[#0B1B3D] hover:text-gold-dark transition relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-gold text-[#0B1B3D] font-extrabold text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-[#0B1B3D]/20">0</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden text-[#0B1B3D] hover:text-gold-dark transition"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <ProductSearch compact />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-4 space-y-2">
            {categoryKeys.map((key) => {
              const cat = categories[key as keyof typeof categories];
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
              const isOpen = activeMenu === key;

              return (
                <div key={key}>
                  <button
                    onClick={() => toggleMenu(key)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gold/10 rounded transition"
                  >
                    <span>{cat.name}</span>
                    {hasSubcategories && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {/* Mobile Submenu */}
                  {hasSubcategories && isOpen && (
                    <div className="bg-gray-50 rounded">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${cat.slug}/${sub.slug}`}
                          className="block px-6 py-2 text-sm text-gray-600 hover:text-maroon transition"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

