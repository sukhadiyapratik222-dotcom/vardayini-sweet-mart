'use client';

import Header from "./components/Header";
import ProductSlider from "./components/ProductSlider";
import { products } from "./data";
import { useLanguage } from "./context/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  // Filter products by category for sliders
  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);
  const premiumSweets = products.filter((p) => p.isPremium || p.category === "sweets");
  const namkeenProducts = products.filter((p) => p.category === "namkeen");

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 mt-6">
        <div className="relative overflow-hidden rounded-2xl bg-[#0B1B3D] border-2 border-gold/40 p-8 sm:p-12 shadow-2xl">
          {/* Subtle Golden Glow Overlay */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 border border-gold/40 mb-4">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">{t.heroTag}</span>
              </div>
              <h1 className="text-3xl font-extrabold sm:text-5xl tracking-tight text-gold leading-tight">
                {t.heroTitle}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-300 leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="rounded-xl bg-gold text-[#0B1B3D] px-8 py-3.5 text-base font-extrabold shadow-lg hover:bg-gold-light transition-all transform hover:-translate-y-0.5 border border-gold">
                {t.shopBestSellers}
              </button>
              <button className="rounded-xl bg-transparent text-gold px-8 py-3.5 text-base font-bold transition hover:bg-gold/10 border border-gold/50">
                {t.festiveCombos}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Slider */}
      <ProductSlider
        title={t.bestSellersTitle}
        subtitle={t.bestSellersSubtitle}
        products={bestSellers.slice(0, 8)}
        categoryLink="/categories"
      />

      {/* New Arrivals Slider */}
      <ProductSlider
        title={t.newArrivalsTitle}
        subtitle={t.newArrivalsSubtitle}
        products={newArrivals.slice(0, 8)}
        categoryLink="/categories?new=true"
      />

      {/* Premium Sweets Slider */}
      <ProductSlider
        title={t.premiumSweetsTitle}
        subtitle={t.premiumSweetsSubtitle}
        products={premiumSweets.slice(0, 8)}
        categoryLink="/categories/sweets"
      />

      {/* Namkeen & Savories Slider */}
      <ProductSlider
        title={t.namkeenTitle}
        subtitle={t.namkeenSubtitle}
        products={namkeenProducts.slice(0, 8)}
        categoryLink="/categories/namkeen"
      />

      {/* Combo Deals Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#07122A] border border-gold/40 rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-gold font-bold text-xs uppercase tracking-widest block mb-2">{t.comboOfferTag}</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 text-white">{t.comboOfferTitle}</h2>
            <p className="text-gray-300 mb-6 max-w-2xl text-base">
              {t.comboOfferSubtitle}
            </p>
            <button className="bg-gold text-[#0B1B3D] px-7 py-3 rounded-xl font-extrabold hover:bg-gold-light transition shadow-md border border-gold">
              {t.exploreCombos}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}


