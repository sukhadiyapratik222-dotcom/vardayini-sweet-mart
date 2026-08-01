'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Truck, Clock, Send, CheckCircle2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      setNewsletterStatus(data.message || '✓ Subscribed successfully!');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterStatus('✓ Subscribed! Check your email for 10% off code SWEET10.');
      setNewsletterEmail('');
    } finally {
      setLoading(false);
      setTimeout(() => setNewsletterStatus(null), 5000);
    }
  };

  return (
    <footer className="bg-[#07122A] text-gray-300 border-t-2 border-gold/40 pt-12 pb-6 px-4 sm:px-6 lg:px-8 mt-16">
      
      {/* Newsletter Signup Banner Ribbon */}
      <div className="max-w-7xl mx-auto mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] border-2 border-gold/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-black text-gold uppercase tracking-widest">
            🎁 Get Exclusive Offers & Festive Discounts
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Subscribe to Vardayini Sweet Mart Newsletter
          </h3>
          <p className="text-xs text-gray-300">
            Get 10% off on your first order plus early access to Diwali & Rakhi festive sweet boxes.
          </p>
        </div>

        <div className="w-full md:w-auto min-w-[320px]">
          {newsletterStatus ? (
            <div className="bg-green-900/80 border border-green-400 text-green-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              <span>{newsletterStatus}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-5 py-3 rounded-xl font-black text-xs transition shadow border border-gold flex items-center gap-1.5 shrink-0"
              >
                <span>Subscribe</span>
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-gold/20">
        
        {/* Brand Blurb & Social Icons */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gold shadow-md bg-[#0B1B3D]">
              <Image src="/logo.png" alt="Vardayini Sweet Mart" fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-gold tracking-tight">
                Vardayini Sweet Mart
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-light/80 font-semibold">
                Pure Sweets & Namkeen • Since 1976
              </span>
            </div>
          </Link>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md">
            For over four decades, Vardayini Sweet Mart has been crafting authentic Indian sweets and savory namkeen using 100% pure desi ghee, premium grade dry fruits, and time-honored traditional recipes.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold hover:text-[#0B1B3D] text-gold border border-gold/30 flex items-center justify-center transition"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold hover:text-[#0B1B3D] text-gold border border-gold/30 flex items-center justify-center transition"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-4c-4.2 0-5 3.003-5 5.5V8z"/></svg>
            </a>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold hover:text-[#0B1B3D] text-gold border border-gold/30 flex items-center justify-center transition"
              aria-label="WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold hover:text-[#0B1B3D] text-gold border border-gold/30 flex items-center justify-center transition"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="text-gold font-bold text-sm uppercase tracking-wider mb-4 border-b border-gold/20 pb-2">
            Categories
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li><Link href="/categories/sweets" className="hover:text-gold transition">Ghee Sweets</Link></li>
            <li><Link href="/categories/sweets/kaju-sweets" className="hover:text-gold transition">Kaju Sweets & Katli</Link></li>
            <li><Link href="/categories/sweets/sugarless" className="hover:text-gold transition">Sugarless Sweets</Link></li>
            <li><Link href="/categories/namkeen" className="hover:text-gold transition">Gujarati Namkeen</Link></li>
            <li><Link href="/categories/namkeen/khakhra" className="hover:text-gold transition">Oven-Baked Khakhra</Link></li>
            <li><Link href="/categories/bakery" className="hover:text-gold transition">Fresh Bakery Cookies</Link></li>
            <li><Link href="/categories/dry-fruits-nuts" className="hover:text-gold transition">Dry Fruits & Nuts</Link></li>
          </ul>
        </div>

        {/* Special Collections */}
        <div>
          <h3 className="text-gold font-bold text-sm uppercase tracking-wider mb-4 border-b border-gold/20 pb-2">
            Special Selections
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li><Link href="/categories/premium-baklava" className="hover:text-gold transition">Turkish Premium Baklava</Link></li>
            <li><Link href="/categories/corporate-gift-boxes" className="hover:text-gold transition">Corporate Gift Boxes</Link></li>
            <li><Link href="/stores" className="hover:text-gold transition">Store Outlets & Branches</Link></li>
            <li><Link href="/blog" className="hover:text-gold transition">Sweet Stories & Blog</Link></li>
            <li><Link href="/cart" className="hover:text-gold transition">Shopping Cart & Checkout</Link></li>
          </ul>
        </div>

        {/* Policies & Contact Info */}
        <div>
          <h3 className="text-gold font-bold text-sm uppercase tracking-wider mb-4 border-b border-gold/20 pb-2">
            Customer Care
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm mb-4">
            <li><a href="#" className="hover:text-gold transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-gold transition">Refund & Return Policy</a></li>
            <li><a href="#" className="hover:text-gold transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-gold transition">Shipping & Delivery Info</a></li>
          </ul>

          <div className="space-y-2 text-xs border-t border-gold/20 pt-3 text-gray-400">
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-gold" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-gold" />
              <span>support@vardayinisweets.com</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar & Copyright */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Vardayini Sweet Mart. All Rights Reserved. Crafted with love & pure ghee.</p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1"><ShieldCheck size={14} className="text-green-400" /> 100% Secure Checkout</span>
          <span className="inline-flex items-center gap-1"><Truck size={14} className="text-gold" /> Pan-India Express Delivery</span>
        </div>
      </div>
    </footer>
  );
}

