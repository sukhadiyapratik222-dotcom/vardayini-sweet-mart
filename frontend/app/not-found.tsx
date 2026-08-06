"use client";

import Link from "next/link";
import { Home, ShoppingBag, Store, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#07122A] text-[#FAF7F0] flex flex-col justify-between p-4 sm:p-8">
      {/* Header Logo */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] flex items-center justify-center font-black text-[#0B1B3D] text-lg shadow-lg border border-[#FFD700]">
            V
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-[#FFD700] block">Vardayini</span>
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] block font-bold">Sweet Mart Since 1976</span>
          </div>
        </Link>
      </div>

      {/* Main 404 Content Card */}
      <main className="max-w-2xl mx-auto w-full text-center py-12 px-6 bg-[#0B1B3D] border-2 border-[#D4AF37] rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37]/15 border-2 border-[#D4AF37] rounded-full text-[#FFD700] text-3xl font-black mb-6 shadow-inner">
          404
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-[#FFD700] tracking-tight">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-md mx-auto">
          The requested page or product link does not exist, or may have been moved.
        </p>

        {/* Port Guidance Note */}
        <div className="my-8 p-4 bg-[#07122A]/80 border border-[#D4AF37]/40 rounded-2xl text-left text-xs text-amber-200/90 leading-relaxed">
          <p className="font-bold text-[#FFD700] mb-1 flex items-center gap-1.5">
            <ShieldCheck size={16} /> Quick Link Guide:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Customer Website UI runs on <strong>Port 3000</strong>: <code className="text-[#FFD700]">http://localhost:3000</code></li>
            <li>Admin Control Room runs on Backend Server <strong>Port 4000</strong>: <code className="text-[#FFD700]">http://localhost:4000/admin</code></li>
            <li>Backend REST API runs on <strong>Port 4000</strong>: <code className="text-[#FFD700]">http://localhost:4000</code></li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#0B1B3D] shadow-lg hover:brightness-110 transition"
          >
            <Home size={16} /> Return to Home Page
          </Link>
          <Link
            href="/categories"
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-extrabold text-xs bg-white/10 text-[#FFD700] border border-[#D4AF37] hover:bg-white/20 transition"
          >
            <ShoppingBag size={16} /> Browse Sweets & Snacks
          </Link>
          <Link
            href="/stores"
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-extrabold text-xs bg-white/10 text-[#FFD700] border border-[#D4AF37] hover:bg-white/20 transition"
          >
            <Store size={16} /> Store Outlets
          </Link>
          <a
            href="http://localhost:4000/admin"
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-extrabold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 transition"
          >
            <ShieldCheck size={16} /> Backend Admin Room
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500">
        Vardayini Sweet Mart Since 1976 • All Rights Reserved
      </footer>
    </div>
  );
}
