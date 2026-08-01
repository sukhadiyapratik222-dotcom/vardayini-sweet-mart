'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { categories } from '../data';
import { ChevronDown, ShoppingCart, User, Heart, Menu, X, Globe, LogOut, Store } from 'lucide-react';
import ProductSearch from './ProductSearch';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Language } from '../lib/translations';

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { cart } = useCart();

  const toggleMenu = (categoryKey: string) => {
    setActiveMenu(activeMenu === categoryKey ? null : categoryKey);
  };

  const categoryKeys = Object.keys(categories);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gold/30">
      {/* Top bar */}
      <div className="bg-[#0B1B3D] px-4 py-1.5 sm:px-6 lg:px-8 border-b border-gold/30">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gold-light">
          <div className="text-[11px] sm:text-xs font-medium tracking-wide hidden md:block">
            🌟 <span className="text-gold font-bold">Vardayini Sweet Mart</span> — Pure Desi Ghee Sweets Since 1976
          </div>

          <div className="flex items-center gap-4 text-xs ml-auto">
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-gold/15 px-2 py-0.5 rounded border border-gold/30">
              <Globe size={13} className="text-gold" />
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
                  <Link href="/account/profile" className="hover:text-gold transition">{t.dashboard}</Link>
                )}
                <button onClick={logout} className="hover:text-gold transition flex items-center gap-1">
                  <LogOut size={13} /> {t.logout}
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
              <span className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight group-hover:text-gold-dark transition-colors">
                {t.brandName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-dark font-bold">
                {t.brandTagline}
              </span>
            </div>
          </Link>

          {/* Top mega-menu navigation */}
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
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="px-2.5 py-2 text-sm font-bold text-[#0B1B3D] hover:text-gold-dark transition flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>{cat.name}</span>
                    {hasSubcategories && <ChevronDown size={14} className="text-gray-500 group-hover:text-gold-dark" />}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {hasSubcategories && (
                    <div className="absolute left-0 mt-0 w-56 bg-[#0B1B3D] border-2 border-gold/40 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${cat.slug}/${sub.slug}`}
                          className="block px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-gold/20 hover:text-gold transition border-b border-white/5 last:border-none"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Outlets Link */}
            <Link
              href="/stores"
              className="ml-1 px-3 py-1.5 text-xs font-black text-[#0B1B3D] bg-gold/20 hover:bg-gold text-[#0B1B3D] rounded-lg transition flex items-center gap-1.5 whitespace-nowrap border border-gold/40 shadow-sm"
            >
              <Store size={14} className="text-[#0B1B3D]" />
              <span>Outlets</span>
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
              href={user ? (user.isAdmin ? "/admin/products" : "/account/profile") : "/login"}
              className="text-[#0B1B3D] hover:text-gold-dark p-2 rounded-lg hover:bg-gold/10 transition hidden sm:flex items-center justify-center"
              title={user ? user.name : t.signIn}
            >
              <User size={22} />
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/account/profile"
              className="text-[#0B1B3D] hover:text-gold-dark p-2 rounded-lg hover:bg-gold/10 transition hidden sm:flex items-center justify-center relative"
              title="Wishlist"
            >
              <Heart size={22} />
            </Link>

            {/* Cart Icon (Live count + ₹ total) */}
            <Link
              href="/cart"
              className="flex items-center gap-2.5 bg-[#0B1B3D] text-gold px-3 py-2 rounded-xl hover:bg-[#162C5B] transition shadow-md border border-gold/40 group"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2.5 -right-2.5 bg-gold text-[#0B1B3D] font-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow">
                  {cart?.itemCount || 0}
                </span>
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-gold tracking-tight whitespace-nowrap">
                ₹{(cart?.total || 0).toLocaleString('en-IN')}
              </span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden text-[#0B1B3D] hover:text-gold-dark transition p-1"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
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


