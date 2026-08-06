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
      let storeData: any[] = [];
      try {
        const res = await fetch(`${API_BASE}/stores`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            storeData = data;
          }
        }
      } catch (e) {}

      if (storeData.length === 0 && typeof window !== "undefined") {
        const cached = localStorage.getItem("admin_stores_list");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) storeData = parsed;
          } catch (e) {}
        }
      }

      setOutlets(storeData);
    }

    async function loadCatalogProducts() {
      let apiProducts: any[] = [];
      try {
        const res = await fetch(`${API_BASE}/products?limit=100`);
        if (res.ok) {
          const data = await res.json();
          apiProducts = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
        }
      } catch (e) {}

      let adminProducts: any[] = [];
      if (typeof window !== "undefined") {
        const cachedCatalog = localStorage.getItem("admin_products_catalog");
        if (cachedCatalog) {
          try {
            adminProducts = JSON.parse(cachedCatalog);
          } catch (e) {}
        }
      }

      const combinedPool = apiProducts.length > 0 ? [...apiProducts, ...adminProducts, ...localProducts] : [...adminProducts, ...localProducts];
      const uniqueMap = new Map();
      const seenNames = new Set();

      combinedPool.forEach((p) => {
        const nameKey = (p.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "");
        const slugKey = (p.slug || String(p.id)).toLowerCase().trim();

        if (nameKey && !seenNames.has(nameKey) && !uniqueMap.has(slugKey)) {
          seenNames.add(nameKey);
          uniqueMap.set(slugKey, p);
        }
      });

      const activeOnly = Array.from(uniqueMap.values()).filter((p: any) => p.isActive !== false);
      setAllProducts(activeOnly);
    }

    const loadAll = () => {
      loadOutlets();
      loadCatalogProducts();
    };

    loadAll();

    window.addEventListener("admin_data_updated", loadAll);
    window.addEventListener("storage", loadAll);

    return () => {
      window.removeEventListener("admin_data_updated", loadAll);
      window.removeEventListener("storage", loadAll);
    };
  }, []);

  // Auto-pull products strictly by their category & subcategory classification
  const bestSellers = allProducts.filter((p) => p.tag === "best_seller" || p.isBestSeller);
  const newArrivals = allProducts.filter((p) => p.tag === "new_arrival" || p.isNew);

  const sweetsSlugs = ["sweets", "kaju-sweets", "mawa-sweets", "penda", "sugarless", "indian-ghee", "premium-packed"];
  const namkeenSlugs = ["namkeen", "sev", "khakhra", "mixture", "gujarati", "farali", "millet", "chips-puris", "roasted"];
  const comboSlugs = ["corporate-gift-boxes", "corporate-gifts", "combo"];

  const premiumSweets = allProducts.filter((p) => {
    const cat = (p.categorySlug || p.category?.slug || (typeof p.category === 'string' ? p.category : '') || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    return sweetsSlugs.includes(cat) || sweetsSlugs.includes(sub);
  });

  const combos = allProducts.filter((p) => {
    const cat = (p.categorySlug || p.category?.slug || (typeof p.category === 'string' ? p.category : '') || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    return comboSlugs.includes(cat) || comboSlugs.includes(sub) || p.tag === "combo";
  });

  const namkeenProducts = allProducts.filter((p) => {
    const cat = (p.categorySlug || p.category?.slug || (typeof p.category === 'string' ? p.category : '') || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    return namkeenSlugs.includes(cat) || namkeenSlugs.includes(sub);
  });

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Sticky Header with Logo, Search, Wishlist, Cart & Mega Menu */}
      <Header />

      {/* Scrolling Promo Ticker */}
      <PromoTicker />

      {/* Hero Banner */}
      <div className="w-full px-3 py-1">
        <HeroCarousel />
      </div>

      {/* Horizontal Product Sliders Driven by Product Tag Field */}
      <div className="space-y-4">
        {/* 1. Best Sellers Slider (Auto-pulled by tag: best_seller) */}
        <ProductSlider
          title="Best Sellers"
          subtitle="Customer favorite sweets & savories ordered most this week"
          products={bestSellers.length > 0 ? bestSellers : allProducts.slice(0, 4)}
          categoryLink="/categories"
        />

        {/* 2. New Arrivals Slider (Auto-pulled by tag: new_arrival) */}
        <ProductSlider
          title="New Arrivals"
          subtitle="Freshly prepared sweets and oven-roasted snacks just added"
          products={newArrivals.length > 0 ? newArrivals : allProducts.slice(1, 5)}
          categoryLink="/categories"
        />

        {/* 3. Premium Sweets Slider (Auto-pulled by tag: premium) */}
        <ProductSlider
          title="Premium Sweets"
          subtitle="Handcrafted Kaju Katli, Mawa Penda & Pure Desi Ghee delicacies"
          products={premiumSweets.length > 0 ? premiumSweets : allProducts.slice(0, 4)}
          categoryLink="/categories/sweets"
        />

        {/* 4. Combos & Gift Packs Slider (Auto-pulled by tag: combo) */}
        <ProductSlider
          title="Festive Gift Boxes"
          subtitle="Handpicked combinations of sweets, dry fruits & savories for all occasions"
          products={combos.length > 0 ? combos : allProducts.slice(2, 6)}
          categoryLink="/categories/corporate-gift-boxes"
        />

        {/* 5. Namkeen & Savories Spotlight */}
        <ProductSlider
          title="Namkeen Savories"
          subtitle="Authentic Gujarati Ratlami Sev, Khakhra, and crunchy mixtures"
          products={namkeenProducts.length > 0 ? namkeenProducts : allProducts.slice(0, 4)}
          categoryLink="/categories/namkeen"
        />
      </div>

      {/* Side-by-Side Promo Banners matching reference layout */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1 */}
          <div className="bg-[#F4F4F4] rounded-xl p-6 sm:p-8 flex items-center justify-between gap-4 overflow-hidden relative group">
            <div className="space-y-2 max-w-[60%]">
              <span className="text-xs sm:text-sm font-medium text-gray-500 block">Up To 20% Off</span>
              <h3 className="text-xl sm:text-3xl font-black text-gray-900 leading-tight">Festive Sweet Boxes</h3>
              <Link
                href="/categories/sweets"
                className="inline-block pt-2 text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-900 hover:text-amber-600 hover:border-amber-600 transition"
              >
                SHOP NOW
              </Link>
            </div>
            <div className="w-32 sm:w-44 h-32 sm:h-40 flex-shrink-0 relative overflow-hidden rounded-lg">
              <img
                src="/images/sweet-10.jpg"
                alt="Festive Sweet Boxes"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Banner 2 */}
          <div className="bg-[#F4F4F4] rounded-xl p-6 sm:p-8 flex items-center justify-between gap-4 overflow-hidden relative group">
            <div className="space-y-2 max-w-[60%]">
              <span className="text-xs sm:text-sm font-medium text-gray-500 block">Special Offer</span>
              <h3 className="text-xl sm:text-3xl font-black text-gray-900 leading-tight">Authentic Namkeen</h3>
              <Link
                href="/categories/namkeen"
                className="inline-block pt-2 text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-900 hover:text-amber-600 hover:border-amber-600 transition"
              >
                SHOP NOW
              </Link>
            </div>
            <div className="w-32 sm:w-44 h-32 sm:h-40 flex-shrink-0 relative overflow-hidden rounded-lg">
              <img
                src="/images/sweet-3.jpg"
                alt="Authentic Namkeen"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
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
