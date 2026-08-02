"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Gift, X, Sparkles, CheckCircle2, Phone, Copy, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const SEGMENTS = [
  { label: "10% OFF", color: "#0B1B3D" },
  { label: "Free Shipping", color: "#D4AF37" },
  { label: "15% OFF", color: "#800020" },
  { label: "₹150 OFF", color: "#0B1B3D" },
  { label: "5% OFF", color: "#D4AF37" },
  { label: "Free Sweets", color: "#800020" },
];

export default function SpinWheelPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winResult, setWinResult] = useState<{ prize: string; couponCode: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { applyCoupon, setIsOpen: openCartDrawer } = useCart();

  useEffect(() => {
    // Automatically trigger popup after 5 seconds if on storefront and not closed/spun before
    if (pathname?.startsWith("/admin")) return;

    const hasSpunToday = localStorage.getItem("spin_wheel_spun_today");
    if (!hasSpunToday) {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Hide completely on Admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  async function handleSpin(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setError(null);
    setSpinning(true);

    let resultPrize = "10% OFF";
    let resultCode = "SWEET10";
    let targetIndex = 0;

    try {
      const res = await fetch(`${API_BASE}/spinwheel/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "You have already spun today!");
        setSpinning(false);
        return;
      }

      if (data.couponCode) {
        resultCode = data.couponCode;
        resultPrize = data.prize || "10% OFF";
        targetIndex = data.segmentIndex ?? 0;
      }
    } catch (err) {
      // Fallback offline spin simulation
      targetIndex = Math.floor(Math.random() * SEGMENTS.length);
      resultPrize = SEGMENTS[targetIndex].label;
      resultCode = `SPIN-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Calculate rotation angle
    const degreesPerSegment = 360 / SEGMENTS.length;
    const extraRounds = 5 * 360; // 5 full rotations
    const finalDegree = extraRounds + (SEGMENTS.length - targetIndex) * degreesPerSegment - degreesPerSegment / 2;

    setRotation(finalDegree);

    setTimeout(() => {
      setSpinning(false);
      setWinResult({ prize: resultPrize, couponCode: resultCode });
      localStorage.setItem("spin_wheel_spun_today", "true");
    }, 4000);
  }

  function handleApplyToCart() {
    if (winResult?.couponCode) {
      applyCoupon(winResult.couponCode);
      setIsOpen(false);
      if (openCartDrawer) openCartDrawer(true);
    }
  }

  function handleCopyCode() {
    if (winResult?.couponCode) {
      navigator.clipboard.writeText(winResult.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-[#0B1B3D] hover:from-amber-300 hover:to-amber-400 font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-full shadow-[0_10px_25px_rgba(212,175,55,0.6)] border-2 border-[#0B1B3D] flex items-center gap-2.5 transition transform hover:scale-110 active:scale-95 animate-bounce"
        >
          <div className="w-7 h-7 rounded-full bg-[#0B1B3D] text-amber-300 flex items-center justify-center shadow-inner">
            <Gift size={16} />
          </div>
          <span className="tracking-wide font-black drop-shadow">Spin &amp; Win Discount! 🎁</span>
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-gold shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative overflow-hidden text-center">
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 transition"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold-dark text-xs font-bold uppercase tracking-wider mb-2 border border-gold/40">
                <Sparkles size={14} />
                <span>Daily Festive Lucky Wheel</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1B3D]">
                Spin & Win Instant Discount!
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Enter your mobile number to unlock exclusive discounts & free sweet offers.
              </p>
            </div>

            {/* Wheel Canvas Graphic */}
            <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
              {/* Pointer Arrow */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-600 drop-shadow-md" />

              {/* Wheel Disc */}
              <div
                className="w-full h-full rounded-full border-4 border-gold shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {SEGMENTS.map((seg, idx) => {
                  const angle = (360 / SEGMENTS.length) * idx;
                  return (
                    <div
                      key={idx}
                      className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left flex items-center justify-center"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        backgroundColor: seg.color,
                      }}
                    >
                      <span className="text-[10px] font-black text-white transform -rotate-45 tracking-tighter">
                        {seg.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Center Cap */}
              <div className="absolute z-10 w-12 h-12 rounded-full bg-[#0B1B3D] border-2 border-gold text-gold font-black text-xs flex items-center justify-center shadow-lg">
                VSM
              </div>
            </div>

            {/* Winning Result Screen */}
            {winResult ? (
              <div className="bg-amber-50 p-5 rounded-2xl border-2 border-gold space-y-3">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-lg font-black text-[#0B1B3D]">
                  🎉 You Won {winResult.prize}!
                </h3>
                <div className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-xl border border-gold/40 text-sm font-mono font-black text-[#0B1B3D]">
                  <span>{winResult.couponCode}</span>
                  <button onClick={handleCopyCode} className="text-gold-dark hover:underline text-xs flex items-center gap-1">
                    <Copy size={13} />
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <button
                  onClick={handleApplyToCart}
                  className="w-full bg-[#0B1B3D] text-gold hover:bg-[#162C5B] py-3 rounded-xl font-black text-xs shadow transition flex items-center justify-center gap-2 border border-gold"
                >
                  <span>Apply Code To Cart & Shop</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              /* Spin Form */
              <form onSubmit={handleSpin} className="space-y-3">
                {error && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                    {error}
                  </p>
                )}

                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-Digit Phone Number..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:border-gold outline-none text-xs font-bold bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={spinning}
                  className="w-full bg-gold text-[#0B1B3D] hover:bg-gold-light py-3.5 rounded-xl font-black text-xs shadow-lg transition flex items-center justify-center gap-2 border border-gold disabled:opacity-50"
                >
                  {spinning ? "Spinning Lucky Wheel..." : "Spin The Wheel Now 🎁"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
