"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, X, Sparkles, Gift, ArrowRight } from "lucide-react";

interface Ad {
  id: string;
  badge: string;
  title: string;
  description: string;
  code?: string;
  link: string;
  btnText: string;
}

const adList: Ad[] = [
  {
    id: "ad-1",
    badge: "FESTIVE DISCOUNT",
    title: "10% OFF Gift Boxes! 🎁",
    description: "Use coupon code FESTIVE10 at checkout on all Corporate & Dry Fruit boxes.",
    code: "FESTIVE10",
    link: "/categories/corporate-gift-boxes",
    btnText: "Claim Offer",
  },
  {
    id: "ad-2",
    badge: "FREE EXPRESS DELIVERY",
    title: "Free Ghee Sweets Shipping! 🚚",
    description: "Enjoy Free Doorstep Delivery across India on all orders above ₹599.",
    link: "/products",
    btnText: "Shop Sweets",
  },
  {
    id: "ad-3",
    badge: "NEW ARRIVAL",
    title: "Fresh Pure Ghee Kaju Katli ✨",
    description: "Traditional 1976 recipe handcrafted daily. Order fresh for family & celebrations.",
    link: "/categories/sweets",
    btnText: "Order Now",
  },
];

export default function AdvertisementPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    // Show popup after 1.8 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1800);

    // Rotate ads every 8 seconds
    const rotateTimer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adList.length);
    }, 8000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(rotateTimer);
    };
  }, []);

  if (!isVisible) return null;

  const currentAd = adList[currentAdIndex];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full transition-all duration-500">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-5 text-white shadow-2xl border-2 border-gold/40 backdrop-blur-md">
        
        {/* Decorative Glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold/20 rounded-full blur-xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 text-gold/70 hover:text-gold bg-black/30 hover:bg-black/50 p-1.5 rounded-full transition"
          aria-label="Close Advertisement"
        >
          <X size={16} />
        </button>

        {/* Ad Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gold text-[#0B1B3D] text-[9px] font-black px-2 py-0.5 rounded-full border border-gold uppercase tracking-wider flex items-center gap-1 shadow">
            <Sparkles size={10} />
            {currentAd.badge}
          </span>
          <span className="text-[10px] text-gold/80 font-semibold">Special Offer</span>
        </div>

        {/* Ad Body */}
        <div className="space-y-1.5 pr-4">
          <h4 className="text-base font-extrabold text-white tracking-tight leading-tight flex items-center gap-1.5">
            {currentAd.title}
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            {currentAd.description}
          </p>

          {currentAd.code && (
            <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-gold/30 my-1">
              <Tag size={12} className="text-gold" />
              <span className="text-xs font-mono font-bold text-gold tracking-widest">{currentAd.code}</span>
            </div>
          )}
        </div>

        {/* Ad Footer Action */}
        <div className="mt-4 pt-3 border-t border-gold/20 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-medium">Vardayini Sweet Mart • Est. 1976</span>
          <Link
            href={currentAd.link}
            onClick={() => setIsVisible(false)}
            className="bg-gold hover:bg-gold-dark text-[#0B1B3D] font-extrabold px-4 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
          >
            <span>{currentAd.btnText}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
