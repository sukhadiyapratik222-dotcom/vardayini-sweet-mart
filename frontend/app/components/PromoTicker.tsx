'use client';

import { Sparkles } from 'lucide-react';

const offers = [
  "⚡ SPECIAL OFFER: Get 10% OFF on Orders Above ₹999 | Use Code: SWEET10",
  "🚚 FREE EXPRESS SHIPPING across India on orders over ₹599!",
  "🌟 AUTHENTIC SWEETS & NAMKEEN: Handcrafted with 100% Pure Desi Ghee Since 1976",
  "🎁 FESTIVE GIFT BOXES: Corporate & Bulk Customization Available with Express Delivery",
  "🏪 FRESH STORE PICKUP: Available at Surat, Ahmedabad & Vadodara Outlets"
];

export default function PromoTicker() {
  return (
    <div className="bg-[#0B1B3D] text-gold py-2 overflow-hidden border-y border-gold/30 shadow-md relative z-40">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Double the list for seamless continuous infinite looping */}
        {[...offers, ...offers].map((offer, index) => (
          <div key={index} className="flex items-center gap-3 px-6 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span>{offer}</span>
            <span className="text-gold-light/40 ml-4 font-normal">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}



