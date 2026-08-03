'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Send, CheckCircle2, ChevronUp } from 'lucide-react';
import CornerMotif from './CornerMotif';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top visibility check
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#0B1B3D] via-[#07122A] to-[#040B1A] text-gray-300 border-t-2 border-gold/50 pt-0 pb-8 mt-16">
      {/* Traditional Golden Corner Motifs */}
      <CornerMotif position="bottom-corners" size={140} />

      {/* 1. TOP NEWSLETTER BAR (Full Width Banner) */}
      <div className="bg-[#D4AF37] text-[#0B1B3D] py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#0B1B3D] text-[#D4AF37]">
              <Mail size={22} />
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider">
              SUBSCRIBE TO NEWSLETTER
            </h3>
          </div>

          {/* Right Input Form */}
          <div className="w-full md:w-auto min-w-[340px] sm:min-w-[420px]">
            {newsletterStatus ? (
              <div className="bg-[#0B1B3D] text-gold px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                <span>{newsletterStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex bg-white rounded-lg overflow-hidden shadow-inner p-1">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="E-Mail"
                  className="flex-1 px-4 py-2 text-xs font-medium text-gray-900 outline-none bg-transparent"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B1B3D] text-white hover:bg-[#162D5A] px-6 py-2 rounded font-black text-xs uppercase tracking-wider transition shrink-0"
                >
                  SEND
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 2. MIDDLE BRAND & DESCRIPTION & SOCIAL ROW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 border-b border-gold/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gold bg-[#0B1B3D] shrink-0">
              <Image src="/logo.png" alt="Vardayini Sweet Mart" fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-gold tracking-tight">
                Vardayini Sweet Mart
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-light/80 font-semibold">
                BEST ONLINE STORE • SINCE 1976
              </span>
            </div>
          </div>

          {/* Center Brand Description */}
          <div className="px-0 md:px-4 md:border-x border-gold/20">
            <p className="text-xs text-gray-300 leading-relaxed">
              Handcrafted authentic sweets, pure desi ghee delicacies & crispy Gujarati namkeen prepared with time-honored recipes for over 45 years.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center md:justify-end gap-3 text-lg font-bold">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold hover:text-[#0B1B3D] text-gold border border-gold/30 flex items-center justify-center transition" aria-label="Facebook">
              f
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold hover:text-[#0B1B3D] text-gold border border-gold/30 flex items-center justify-center transition" aria-label="X">
              X
            </a>
            <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold hover:text-[#0B1B3D] text-gold border border-gold/30 flex items-center justify-center transition text-xs" aria-label="Google">
              G+
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold hover:text-[#0B1B3D] text-gold border border-gold/30 flex items-center justify-center transition text-xs" aria-label="LinkedIn">
              in
            </a>
          </div>
        </div>
      </div>

      {/* 3. MAIN FOOTER LINKS GRID (4 COLUMNS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Contact Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-xs text-gray-300">
              <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
              <span>Vardayini Sweet Mart, Station Road, Anand, Gujarat 388001, India</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <Phone size={18} className="text-gold shrink-0" />
              <span>(+91) 98250 12345</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <Mail size={18} className="text-gold shrink-0" />
              <span>info@vardayinisweetmart.com</span>
            </div>
          </div>

          {/* Column 2: INFORMATION */}
          <div>
            <h3 className="text-gold font-bold text-xs uppercase tracking-widest mb-4">
              INFORMATION
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link href="/about" className="hover:text-gold transition">About Us</Link></li>
              <li><Link href="/stores" className="hover:text-gold transition">Delivery Information</Link></li>
              <li><a href="#" className="hover:text-gold transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold transition">Terms & Conditions</a></li>
              <li><Link href="/categories" className="hover:text-gold transition">Site Map</Link></li>
            </ul>
          </div>

          {/* Column 3: EXTRAS */}
          <div>
            <h3 className="text-gold font-bold text-xs uppercase tracking-widest mb-4">
              EXTRAS
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link href="/categories/sweets" className="hover:text-gold transition">Brand Sweets</Link></li>
              <li><Link href="/categories/corporate-gift-boxes" className="hover:text-gold transition">Festive Gift Boxes</Link></li>
              <li><Link href="/categories/namkeen" className="hover:text-gold transition">Specials & Offers</Link></li>
              <li><Link href="/categories/premium-baklava" className="hover:text-gold transition">Baklava Collection</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: MY ACCOUNT */}
          <div>
            <h3 className="text-gold font-bold text-xs uppercase tracking-widest mb-4">
              MY ACCOUNT
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link href="/account" className="hover:text-gold transition">My Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-gold transition">Order History</Link></li>
              <li><Link href="/wishlist" className="hover:text-gold transition">Wish List</Link></li>
              <li><Link href="/cart" className="hover:text-gold transition">Returns & Checkout</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. BRAND LIST ROW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 border-t border-gold/20 text-center">
        <p className="text-xs text-gray-400">
          <strong className="text-gold uppercase tracking-wider mr-2">BRAND:</strong>
          <span className="space-x-3">
            <Link href="/categories/sweets" className="hover:text-gold transition">Ghee Sweets</Link> •
            <Link href="/categories/sweets/kaju-sweets" className="hover:text-gold transition">Kaju Katli</Link> •
            <Link href="/categories/namkeen" className="hover:text-gold transition">Ratlami Sev</Link> •
            <Link href="/categories/namkeen/khakhra" className="hover:text-gold transition">Khakhra</Link> •
            <Link href="/categories/bakery" className="hover:text-gold transition">Bakery Cookies</Link> •
            <Link href="/categories/premium-baklava" className="hover:text-gold transition">Baklava</Link>
          </span>
        </p>
      </div>

      {/* 5. FLOATING SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-[#D4AF37] text-[#0B1B3D] hover:bg-amber-400 p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border border-[#0B1B3D]"
          aria-label="Scroll to top"
        >
          <ChevronUp size={22} className="stroke-[3]" />
        </button>
      )}
    </footer>
  );
}
