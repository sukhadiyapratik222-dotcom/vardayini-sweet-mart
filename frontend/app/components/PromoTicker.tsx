'use client';

import { useLanguage } from '../context/LanguageContext';

export default function PromoTicker() {
  const { t } = useLanguage();

  return (
    <div className="bg-[#0B1B3D] text-gold-light border-y border-gold/30 px-4 py-2.5 shadow-inner">
      <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-medium tracking-wide">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[#0B1B3D] font-bold text-xs shadow-md">★</span>
        <p className="text-center font-medium">
          {t.tickerText}
        </p>
      </div>
    </div>
  );
}


