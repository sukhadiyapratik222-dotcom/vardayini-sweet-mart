'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories } from '../data';
import { ChevronDown, ShoppingCart, User, Heart, Menu, X, Globe, LogOut, Store } from 'lucide-react';
import ProductSearch from './ProductSearch';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Language } from '../lib/translations';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { cart } = useCart();
  const [customCategories, setCustomCategories] = useState<Array<{ name: string; slug: string }>>([]);

  useEffect(() => {
    async function loadCustomCats() {
      let dbCats: any[] = [];
      try {
        const res = await fetch(`${API_BASE}/categories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            dbCats = data;
          }
        }
      } catch (e) {}

      let localCats: any[] = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("admin_custom_categories");
        if (stored) {
          try {
            localCats = JSON.parse(stored);
          } catch (e) {}
        }
      }

      const defaultSlugs = new Set([
        "sweets", "namkeen", "bakery", "mukhwas", "dry-fruits-nuts",
        "premium-baklava", "corporate-gift-boxes", "corporate-gifts",
        "kaju-sweets", "mawa-sweets", "penda", "sugarless", "indian-ghee",
        "sev", "khakhra", "mixture", "roasted", "gujarati", "farali", "millet"
      ]);

      const extraCats: Array<{ name: string; slug: string }> = [];
      const seen = new Set();

      [...dbCats, ...localCats].forEach((c) => {
        const name = c.name || "";
        const slug = c.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        if (name && slug && !defaultSlugs.has(slug) && !seen.has(slug)) {
          seen.add(slug);
          extraCats.push({ name, slug });
        }
      });

      setCustomCategories(extraCats);
    }

    loadCustomCats();
  }, []);

  const toggleMenu = (categoryKey: string) => {
    setActiveMenu(activeMenu === categoryKey ? null : categoryKey);
  };

  const categoryKeys = Object.keys(categories);

  return (
    <header className="sticky top-0 z-50 bg-[#0B1B3D]/95 backdrop-blur-md shadow-xl border-b border-gold/40 text-white">
      {/* Top bar */}
      <div className="bg-[#07122A] px-4 py-1.5 sm:px-6 lg:px-8 border-b border-gold/30">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gold-light">
          <div className="text-[11px] sm:text-xs font-medium tracking-wide hidden md:block">
            🌟 <span className="text-gold-bright font-bold">Vardayini Sweet Mart</span> — Pure Desi Ghee Sweets Since 1976
          </div>

          <div className="flex items-center gap-3 text-xs ml-auto">
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-gold/20 px-2.5 py-0.5 rounded-full border border-gold/40 shadow-sm">
              <Globe size={13} className="text-gold-bright" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-gold-light font-bold text-xs border-none outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                <option value="en" className="bg-[#0B1B3D] text-white">English</option>
                <option value="hi" className="bg-[#0B1B3D] text-white">हिन्दी (Hindi)</option>
                <option value="gu" className="bg-[#0B1B3D] text-white">ગુજરાતી (Gujarati)</option>
              </select>
            </div>

            {user ? (
              <>
                <span className="text-gold-light font-medium truncate max-w-[120px]">{t.hello}, {user.name}</span>
                <Link href="/account/profile" className="hover:text-gold-bright transition font-semibold px-1">{t.dashboard}</Link>
                <button onClick={logout} className="hover:text-gold-bright transition flex items-center gap-1">
                  <LogOut size={13} /> {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-gold-bright transition font-semibold px-1">{t.signIn}</Link>
                <span className="text-gold-light/40">|</span>
                <Link href="/signup" className="hover:text-gold-bright transition font-semibold px-1">{t.signUp}</Link>
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
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gold shadow-lg bg-[#0B2580] ring-2 ring-gold/40 group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Vardayini Sweet Mart Since 1976" fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-gold-light tracking-tight group-hover:text-gold-bright transition-colors drop-shadow">
                {t.brandName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold font-extrabold">
                {t.brandTagline}
              </span>
            </div>
          </Link>

          {/* Top mega-menu navigation */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {/* Primary Main Categories: Sweets, Namkeen, Bakery */}
            {["sweets", "namkeen", "bakery"].map((key) => {
              const cat = categories[key as keyof typeof categories];
              if (!cat) return null;
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

              return (
                <div
                  key={key}
                  className="relative group"
                  onMouseEnter={() => setActiveMenu(key)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="px-2 py-1.5 text-xs font-bold text-gray-100 hover:text-gold-bright transition flex items-center gap-0.5 whitespace-nowrap"
                  >
                    <span>{cat.name}</span>
                    {hasSubcategories && <ChevronDown size={12} className="text-gray-400 group-hover:text-gold-bright" />}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {hasSubcategories && (
                    <div className="absolute left-0 mt-0 w-52 bg-[#0B1B3D] border-2 border-gold/50 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${cat.slug}/${sub.slug}`}
                          className="block px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-gold/20 hover:text-gold-bright transition border-b border-white/5 last:border-none"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link href="/categories/mukhwas" className="px-2 py-1.5 text-xs font-bold text-gray-100 hover:text-gold-bright transition whitespace-nowrap">
              Mukhwas
            </Link>
            <Link href="/categories/dry-fruits-nuts" className="px-2 py-1.5 text-xs font-bold text-gray-100 hover:text-gold-bright transition whitespace-nowrap">
              Dried Fruits & Nuts
            </Link>
            <Link href="/categories/premium-baklava" className="px-2 py-1.5 text-xs font-bold text-gray-100 hover:text-gold-bright transition whitespace-nowrap">
              Premium Baklava
            </Link>
            <Link href="/categories/corporate-gift-boxes" className="px-2 py-1.5 text-xs font-bold text-gray-100 hover:text-gold-bright transition whitespace-nowrap">
              Corporate Gifts
            </Link>
            {customCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="px-2 py-1.5 text-xs font-bold text-gold-bright hover:text-white transition whitespace-nowrap"
              >
                {c.name}
              </Link>
            ))}
            <Link href="/stores" className="px-2 py-1.5 text-xs font-extrabold text-gold-bright hover:text-white transition whitespace-nowrap">
              ⚡ Instant Delivery
            </Link>
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <ProductSearch compact />
          </div>

          {/* Right Icons: Account, Wishlist, Cart (Live count + ₹ total) */}
          <div className="flex items-center gap-3">
            {/* Account Icon */}
            <Link
              href={user ? "/account/profile" : "/login"}
              className="text-gold-light hover:text-gold-bright p-2 rounded-lg hover:bg-gold/20 transition hidden sm:flex items-center justify-center"
              title={user ? user.name : t.signIn}
            >
              <User size={22} />
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/account/profile"
              className="text-gold-light hover:text-gold-bright p-2 rounded-lg hover:bg-gold/20 transition hidden sm:flex items-center justify-center relative"
              title="Wishlist"
            >
              <Heart size={22} />
            </Link>

            {/* Cart Icon (Live count + ₹ total) */}
            <Link
              href="/cart"
              className="flex items-center gap-2.5 bg-gradient-to-r from-[#0B1B3D] to-[#162C5B] text-gold px-3.5 py-2 rounded-xl hover:brightness-110 transition shadow-md border border-gold/50 group"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart size={20} className="text-gold-bright group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2.5 -right-2.5 bg-gold text-[#0B1B3D] font-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow">
                  {cart?.itemCount || 0}
                </span>
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-gold-bright tracking-tight whitespace-nowrap">
                ₹{(cart?.total || 0).toLocaleString('en-IN')}
              </span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden text-gold-light hover:text-gold-bright transition p-1.5 rounded-lg bg-gold/10 border border-gold/30"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <ProductSearch compact />
        </div>
      </div>

      {/* Mobile Mega Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-4 space-y-2 max-h-[75vh] overflow-y-auto">
            {categoryKeys.map((key) => {
              const cat = categories[key as keyof typeof categories];
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
              const isOpen = activeMenu === key;

              return (
                <div key={key} className="border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="px-2 py-1 text-sm font-bold text-[#0B1B3D]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                    {hasSubcategories && (
                      <button
                        onClick={() => toggleMenu(key)}
                        className="p-2 text-gray-600 hover:text-[#0B1B3D]"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Mobile Submenu */}
                  {hasSubcategories && isOpen && (
                    <div className="bg-amber-50/60 rounded-lg p-2 mt-1 space-y-1">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${cat.slug}/${sub.slug}`}
                          className="block px-3 py-1.5 text-xs text-gray-700 font-medium hover:text-[#0B1B3D] hover:font-bold transition"
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


