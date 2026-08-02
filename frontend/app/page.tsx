'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "./components/Header";
import PromoTicker from "./components/PromoTicker";
import HeroCarousel from "./components/HeroCarousel";
import ProductSlider from "./components/ProductSlider";
import Footer from "./components/Footer";
import { products as localProducts } from "./data";
import { useLanguage } from "./context/LanguageContext";
import { Store, MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import CornerMotif from "./components/CornerMotif";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";




export default function HomePage() {
  const { t } = useLanguage();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>(localProducts);

  useEffect(() => {
    async function loadOutlets() {
      // 1. Try to load from backend API
      try {
        const res = await fetch(`${API_BASE}/stores`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setOutlets(data);
            return;
          }
        }
      } catch (e) {}

      // 2. Fallback: load from admin panel localStorage (stores added via admin)
      const cached = typeof window !== "undefined" ? localStorage.getItem("admin_stores_list") : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOutlets(parsed);
            return;
          }
        } catch (e) {}
      }

      // 3. No real outlets found — show nothing (don't show fake demo outlets)
      setOutlets([]);
    }

    async function loadCatalogProducts() {
      let adminProducts: any[] = [];
      if (typeof window !== "undefined") {
        const cachedCatalog = localStorage.getItem("admin_products_catalog");
        if (cachedCatalog) {
          try {
            adminProducts = JSON.parse(cachedCatalog);
          } catch (e) {}
        }
      }

      const combinedPool = [...adminProducts, ...localProducts];
      const uniqueMap = new Map();
      combinedPool.forEach((p) => {
        const key = p.slug || p.id;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, p);
        }
      });

      // Instantly filter out any product marked Inactive (isActive === false)
      const activeOnly = Array.from(uniqueMap.values()).filter((p: any) => p.isActive !== false);
      setAllProducts(activeOnly);
    }

    loadOutlets();
    loadCatalogProducts();
  }, []);

  // Auto-pull products by tag field (Best Sellers, New Arrivals, Premium, Combos)
  const bestSellers = allProducts.filter((p) => p.tag === "best_seller" || p.isBestSeller);
  const newArrivals = allProducts.filter((p) => p.tag === "new_arrival" || p.isNew);
  const premiumSweets = allProducts.filter((p) => p.tag === "premium" || p.isPremium || p.category === "sweets" || p.categorySlug === "kaju-sweets");
  const combos = allProducts.filter((p) => p.tag === "combo" || p.isCombo || p.category === "corporate-gift-boxes");
  const namkeenProducts = allProducts.filter((p) => p.category === "namkeen" || p.categorySlug === "gujarati" || p.categorySlug === "sev");

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Sticky Header with Logo, Search, Wishlist, Cart & Mega Menu */}
      <Header />

      {/* Scrolling Promo Ticker */}
      <PromoTicker />

      {/* Hero Banner Carousel */}
      <HeroCarousel />

      {/* Horizontal Product Sliders Driven by Product Tag Field */}
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* 1. Best Sellers Slider (Auto-pulled by tag: best_seller) */}
        <ProductSlider
          title={t.bestSellersTitle || "Best Sellers 🔥"}
          subtitle="Customer favorite sweets & savories ordered most this week"
          products={bestSellers.length > 0 ? bestSellers : allProducts.slice(0, 4)}
          categoryLink="/categories"
        />

        {/* 2. New Arrivals Slider (Auto-pulled by tag: new_arrival) */}
        <ProductSlider
          title={t.newArrivalsTitle || "New Arrivals ✨"}
          subtitle="Freshly prepared sweets and oven-roasted snacks just added"
          products={newArrivals.length > 0 ? newArrivals : allProducts.slice(1, 5)}
          categoryLink="/categories"
        />

        {/* 3. Premium Sweets Slider (Auto-pulled by tag: premium) */}
        <ProductSlider
          title={t.premiumSweetsTitle || "Premium Sweets 👑"}
          subtitle="Handcrafted Kaju Katli, Mawa Penda & Pure Desi Ghee delicacies"
          products={premiumSweets.length > 0 ? premiumSweets : allProducts.slice(0, 4)}
          categoryLink="/categories/sweets"
        />

        {/* 4. Combos & Gift Packs Slider (Auto-pulled by tag: combo) */}
        <ProductSlider
          title="Festive Combos & Special Gift Boxes 🎁"
          subtitle="Handpicked combinations of sweets, dry fruits & savories for all occasions"
          products={combos.length > 0 ? combos : allProducts.slice(2, 6)}
          categoryLink="/categories/corporate-gift-boxes"
        />

        {/* 5. Namkeen & Savories Spotlight */}
        <ProductSlider
          title={t.namkeenTitle || "Namkeen & Savories"}
          subtitle="Authentic Gujarati Ratlami Sev, Khakhra, and crunchy mixtures"
          products={namkeenProducts.length > 0 ? namkeenProducts : allProducts.slice(0, 4)}
          categoryLink="/categories/namkeen"
        />
      </div>

      {/* Promo Special Offer Banner */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#0D226B] via-[#0B2580] to-[#07122A] border-2 border-gold/50 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <CornerMotif position="all" size={110} />
          <div className="relative z-10 max-w-xl">
            <span className="text-gold-light font-black text-xs uppercase tracking-widest block mb-2">{t.comboOfferTag}</span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3 text-gold-light">{t.comboOfferTitle}</h2>
            <p className="text-gray-200 mb-6 text-sm sm:text-base leading-relaxed">
              {t.comboOfferSubtitle}
            </p>
            <Link href="/categories/corporate-gift-boxes" className="inline-block bg-gradient-to-r from-[#F5E5A3] via-[#D4AF37] to-[#AA7C11] text-[#0B1B3D] px-7 py-3.5 rounded-xl font-extrabold hover:brightness-110 transition shadow-lg border border-gold">
              {t.exploreCombos}
            </Link>
          </div>

          <div className="relative z-10 w-full md:w-80 h-44 rounded-2xl overflow-hidden border-2 border-gold/50 shadow-2xl bg-black/40 flex-shrink-0">
            <CornerMotif position="bottom-corners" size={60} />
            <img
              src="https://uploads-ssl.webflow.com/5ffcd643561bc26ed27a87a1/6005c64f2dff8a196637b467_ezgif.com-gif-maker.gif"
              alt="Customer Special Offer Animation"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Physical Outlets & Store Branches Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-gold-dark uppercase tracking-widest bg-gold/15 px-3 py-1 rounded-full border border-gold/30 mb-2">
                <Store size={14} />
                <span>Visit Us In Store</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0B1B3D]">Our Store Outlets &amp; Branches</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Experience fresh, authentic sweets, namkeen, and gift boxes at any of our physical outlets.
              </p>
            </div>

            <Link
              href="/stores"
              className="inline-flex items-center gap-2 bg-[#0B1B3D] text-gold hover:bg-[#162C5B] font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition border border-gold/30 shadow-md shrink-0"
            >
              <span>View All Outlets & Map</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {outlets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Store size={48} className="mx-auto mb-4 text-gold/40" />
              <p className="text-base font-semibold">No outlets added yet.</p>
              <p className="text-sm mt-1">Please add store outlets from the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {outlets.map((outlet: any) => (
                <div
                  key={outlet.id}
                  className="bg-white rounded-2xl p-5 border-2 border-gold/30 shadow-md hover:shadow-xl transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="bg-[#0B1B3D] text-gold text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        {outlet.city}
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold">PIN {outlet.pincode}</span>
                    </div>

                    <h3 className="font-extrabold text-[#0B1B3D] text-base leading-snug">{outlet.name}</h3>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin size={14} className="text-gold-dark flex-shrink-0 mt-0.5" />
                        <span>{outlet.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-gold-dark flex-shrink-0" />
                        <span className="font-bold text-[#0B1B3D]">{outlet.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gold-dark flex-shrink-0" />
                        <span>{outlet.hours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-green-600">✓ Open Today</span>
                    <Link
                      href="/stores"
                      className="text-xs font-extrabold text-gold-dark hover:text-gold flex items-center gap-1 transition"
                    >
                      <span>Store Info</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
