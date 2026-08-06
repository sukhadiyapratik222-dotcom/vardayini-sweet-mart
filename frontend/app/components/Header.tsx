'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories } from '../data';
import { ChevronDown, ShoppingCart, User, Heart, Menu, X, Globe, LogOut } from 'lucide-react';
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

    window.addEventListener("admin_data_updated", loadCustomCats);
    window.addEventListener("storage", loadCustomCats);

    return () => {
      window.removeEventListener("admin_data_updated", loadCustomCats);
      window.removeEventListener("storage", loadCustomCats);
    };
  }, []);

  const toggleMenu = (categoryKey: string) => {
    setActiveMenu(activeMenu === categoryKey ? null : categoryKey);
  };

  const categoryKeys = Object.keys(categories);

  return (
    <header className="sticky top-0 z-50 bg-[#0B1B3D]/95 backdrop-blur-md shadow-xl border-b border-gold/40 text-white">
      {/* ROW 1: Logo | Search Bar (with Category Select) | Wishlist & Cart Actions */}
      <div className="px-4 py-3 sm:px-6 lg:px-8 border-b border-gold/20">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 overflow-hidden rounded-full border-2 border-gold shadow-lg bg-[#0B2580] ring-2 ring-gold/40 group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Vardayini Sweet Mart Since 1976" fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-black text-gold-light tracking-tight group-hover:text-gold-bright transition-colors drop-shadow">
                {t.brandName}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gold font-extrabold hidden sm:block">
                {t.brandTagline}
              </span>
            </div>
          </Link>

          {/* Integrated Search Bar with Category Selector */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2">
            <ProductSearch compact showCategorySelect />
          </div>

          {/* Action Boxes: Wishlist & Cart & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Account Card */}
            <Link
              href={user ? "/account/profile" : "/login"}
              className="hidden lg:flex items-center gap-2 bg-gold/10 hover:bg-gold/20 text-gold-light px-3 py-2 rounded-xl border border-gold/30 transition shadow-sm"
              title={user ? user.name : t.signIn}
            >
              <User size={18} className="text-gold-bright" />
              <span className="text-xs font-bold truncate max-w-[100px]">
                {user ? user.name : t.signIn}
              </span>
            </Link>

            {/* Wishlist Card */}
            <Link
              href="/account/profile"
              className="flex items-center gap-2 bg-gold/10 hover:bg-gold/20 text-gold-light px-3 py-2 rounded-xl border border-gold/30 transition shadow-sm group"
              title="Wishlist"
            >
              <div className="relative">
                <Heart size={18} className="text-gold-bright group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-gold text-[#0B1B3D] font-black text-[9px] rounded-full w-4 h-4 flex items-center justify-center shadow">
                  0
                </span>
              </div>
              <span className="text-xs font-bold hidden sm:inline text-gray-100 group-hover:text-gold-bright">
                Wishlist
              </span>
            </Link>

            {/* Cart Card */}
            <Link
              href="/cart"
              className="flex items-center gap-2 bg-gradient-to-r from-gold/20 to-gold/10 hover:from-gold/30 hover:to-gold/20 text-gold px-3.5 py-2 rounded-xl border border-gold/50 transition shadow-md group"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart size={18} className="text-gold-bright group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-gold text-[#0B1B3D] font-black text-[9px] rounded-full w-4 h-4 flex items-center justify-center shadow">
                  {cart?.itemCount || 0}
                </span>
              </div>
              <span className="text-xs font-extrabold hidden sm:inline text-gold-bright tracking-tight">
                Cart {cart?.total ? `(₹${cart.total.toLocaleString('en-IN')})` : ''}
              </span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gold-light hover:text-gold-bright transition p-2 rounded-xl bg-gold/10 border border-gold/30"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <ProductSearch compact showCategorySelect={false} />
        </div>
      </div>

      {/* ROW 2: Navigation Links (Left) | Language & Register (Right) */}
      <div className="px-4 py-2 sm:px-6 lg:px-8 bg-[#07122A]/90 border-t border-gold/10">
        <div className="flex items-center justify-between">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 font-semibold text-xs sm:text-sm text-gray-200">
            <Link href="/" className="hover:text-gold-bright transition py-1 font-bold">
              Home
            </Link>

            <Link href="/categories" className="hover:text-gold-bright transition py-1 font-bold">
              Products
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative group py-1"
              onMouseEnter={() => setActiveMenu('categories')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href="/categories"
                className="hover:text-gold-bright transition flex items-center gap-1 font-bold"
              >
                <span>Categories</span>
                <ChevronDown size={14} className="text-gray-400 group-hover:text-gold-bright transition-transform group-hover:rotate-180" />
              </Link>

              {/* Categories Mega Dropdown */}
              <div className="absolute left-0 mt-1 w-56 bg-[#0B1B3D] border-2 border-gold/50 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {Object.keys(categories).map((key) => {
                  const cat = categories[key as keyof typeof categories];
                  if (!cat) return null;
                  return (
                    <Link
                      key={key}
                      href={`/categories/${cat.slug}`}
                      className="block px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-gold/20 hover:text-gold-bright transition border-b border-white/5 last:border-none"
                    >
                      {cat.name}
                    </Link>
                  );
                })}
                {customCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/categories/${c.slug}`}
                    className="block px-4 py-2 text-xs font-semibold text-gold-bright hover:bg-gold/20 hover:text-white transition border-b border-white/5 last:border-none"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/stores" className="hover:text-gold-bright transition py-1">
              About us
            </Link>

            <Link href="/contact" className="hover:text-gold-bright transition py-1">
              Contact Us
            </Link>

            <Link href="/account/profile" className="hover:text-gold-bright transition py-1">
              Track Order
            </Link>
          </nav>

          {/* Right Section: Language Selector & Auth */}
          <div className="flex items-center gap-4 ml-auto text-xs sm:text-sm">
            {/* Language Dropdown Selector */}
            <div className="flex items-center gap-1.5 bg-gold/15 px-2.5 py-1 rounded-full border border-gold/40 shadow-sm">
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

            {/* Auth Link / Account Status */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/account/profile" className="text-gold-light font-semibold hover:text-gold-bright transition hidden lg:inline">
                  {user.name}
                </Link>
                <button onClick={logout} className="hover:text-gold-bright transition flex items-center gap-1 font-bold text-gold">
                  <LogOut size={13} /> {t.logout}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-bold">
                <Link href="/signup" className="hover:text-gold-bright transition text-gold-light">
                  Register
                </Link>
                <span className="text-gold-light/40">/</span>
                <Link href="/login" className="hover:text-gold-bright transition text-gold-light">
                  {t.signIn}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gold/30 bg-[#07122A] text-white">
          <nav className="px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <Link
              href="/"
              className="block px-2 py-1.5 text-sm font-bold text-gray-200 hover:text-gold-bright border-b border-gold/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/categories"
              className="block px-2 py-1.5 text-sm font-bold text-gray-200 hover:text-gold-bright border-b border-gold/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>

            {/* Categories section in mobile */}
            <div className="border-b border-gold/10 pb-2">
              <button
                onClick={() => toggleMenu('mobile-categories')}
                className="flex items-center justify-between w-full px-2 py-1.5 text-sm font-bold text-gold-bright"
              >
                <span>Categories</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${activeMenu === 'mobile-categories' ? 'rotate-180' : ''}`}
                />
              </button>

              {activeMenu === 'mobile-categories' && (
                <div className="bg-[#0B1B3D] rounded-xl p-2 mt-1 space-y-1 border border-gold/20">
                  {categoryKeys.map((key) => {
                    const cat = categories[key as keyof typeof categories];
                    if (!cat) return null;
                    return (
                      <Link
                        key={key}
                        href={`/categories/${cat.slug}`}
                        className="block px-3 py-1.5 text-xs text-gray-200 font-semibold hover:text-gold-bright transition"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/stores"
              className="block px-2 py-1.5 text-sm font-bold text-gray-200 hover:text-gold-bright border-b border-gold/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About us
            </Link>

            <Link
              href="/stores"
              className="block px-2 py-1.5 text-sm font-bold text-gray-200 hover:text-gold-bright border-b border-gold/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>

            <Link
              href="/account/profile"
              className="block px-2 py-1.5 text-sm font-bold text-gray-200 hover:text-gold-bright border-b border-gold/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Track Order
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}


