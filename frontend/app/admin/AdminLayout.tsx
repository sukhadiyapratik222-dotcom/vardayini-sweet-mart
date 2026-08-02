"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BellRing,
  BookOpen,
  Home,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Users,
  X,
  ShieldCheck,
  LogOut,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      if (pathname !== "/admin/login" && pathname !== "/admin/signup") {
        router.push("/admin/login");
      }
    }
  }, [user, isLoading, pathname, router]);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/stores", label: "Stores", icon: Store },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/coupons", label: "Coupons", icon: Tags },
    { href: "/admin/blog", label: "Blog", icon: BookOpen },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-gray-900 flex flex-col">
      {/* Top Mobile Bar (visible below lg) */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#0B1B3D] border-b border-gold/30 px-4 py-3 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gold shadow bg-[#0B1B3D]">
            <Image src="/logo.png" alt="Vardayini Sweet Mart" fill sizes="36px" className="object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white leading-tight">Vardayini Sweet Mart</h1>
            <span className="text-[10px] text-gold font-bold uppercase tracking-wider block">Admin Control Room</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-white/10 text-gold hover:bg-gold/20 transition"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-72 bg-[#0B1B3D] border-r border-gold/30 z-40 p-6 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-white shadow-2xl">
        {/* Brand Header */}
        <div className="pb-6 border-b border-gold/25">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gold shadow-md bg-[#0B1B3D]">
              <Image src="/logo.png" alt="Vardayini Sweet Mart" fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold font-bold">
                <ShieldCheck size={12} />
                Control Room
              </div>
              <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight mt-0.5">
                Vardayini Sweet Mart
              </h1>
            </div>
          </div>
          <p className="mt-2.5 text-xs text-gray-300 leading-relaxed">
            Admin dashboard for catalog, inventory, stores, and orders.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="my-6 space-y-1.5 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-gold text-[#0B1B3D] shadow-lg font-extrabold border border-gold"
                    : "text-gray-200 hover:bg-gold/15 hover:text-gold border border-transparent"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#0B1B3D]" : "text-gold/80"} />
                <span>{label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-gold/20 mt-4">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gold hover:bg-gold/15 transition border border-gold/30"
            >
              <Home size={16} />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </nav>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-gold/25 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold text-xs">
              A
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Administrator"}</p>
              <p className="text-[10px] text-gold/80 truncate">{user?.email || "admin@local"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-white/10 rounded-lg transition"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (visible when toggle is clicked) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex">
          <div className="w-72 bg-[#0B1B3D] border-r border-gold/30 h-full p-6 text-white flex flex-col overflow-y-auto">
            <div className="pb-4 border-b border-gold/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gold bg-[#0B1B3D]">
                  <Image src="/logo.png" alt="Vardayini Sweet Mart" fill sizes="40px" className="object-cover" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-white leading-tight">Vardayini Sweet Mart</h1>
                  <span className="text-[10px] text-gold font-bold uppercase">Control Room</span>
                </div>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1 text-gray-300 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <nav className="my-6 space-y-1.5 flex-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? "bg-gold text-[#0B1B3D] shadow-lg font-extrabold border border-gold"
                        : "text-gray-200 hover:bg-gold/15 hover:text-gold"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-gold/20 mt-4">
                <Link
                  href="/"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gold hover:bg-gold/15 transition border border-gold/30"
                >
                  <Home size={16} />
                  <span>Return to Storefront</span>
                </Link>
              </div>
            </nav>
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* Main Content Area (Offset by lg:pl-80 for desktop fixed sidebar) */}
      <main className="flex-1 lg:pl-80 p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
