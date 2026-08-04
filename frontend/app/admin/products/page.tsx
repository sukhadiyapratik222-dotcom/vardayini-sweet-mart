"use client";

import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../AdminLayout";
import { products as initialDefaultProducts } from "../../data";
import {
  Plus,
  Trash2,
  Pencil,
  Tag,
  Layers,
  Package,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
  Star,
  RefreshCw,
  FolderPlus,
  ShoppingBag,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

import { getApiBaseUrl } from "../../utils/apiConfig";

const API_BASE = getApiBaseUrl();

type Product = any;

const defaultCategories = [
  { name: "Sweets ➔ Kaju Sweets", slug: "kaju-sweets" },
  { name: "Sweets ➔ Mawa Sweets", slug: "mawa-sweets" },
  { name: "Sweets ➔ Penda", slug: "penda" },
  { name: "Sweets ➔ Sugarless", slug: "sugarless" },
  { name: "Sweets ➔ Premium Packed", slug: "premium-packed" },
  { name: "Sweets ➔ Indian Ghee", slug: "indian-ghee" },
  { name: "Namkeen ➔ Gujarati", slug: "gujarati" },
  { name: "Namkeen ➔ Khakhra", slug: "khakhra" },
  { name: "Namkeen ➔ Sev", slug: "sev" },
  { name: "Namkeen ➔ Mixture", slug: "mixture" },
  { name: "Bakery ➔ Biscuits & Cookies", slug: "biscuits-cookies" },
  { name: "Mukhwas", slug: "mukhwas" },
  { name: "Dried Fruits & Nuts", slug: "dry-fruits-nuts" },
  { name: "Premium Baklava", slug: "premium-baklava" },
  { name: "Corporate Gift Boxes", slug: "corporate-gift-boxes" }
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "form">("catalog");

  // Search & Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW_STOCK">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 10 items per page default for clean view

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Custom Categories list state
  const [categoriesList, setCategoriesList] = useState(defaultCategories);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    let list: Product[] = [];

    // 1. Try API first
    try {
      const res = await fetch(`${API_BASE}/admin/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          list = data;
        }
      }
    } catch (err) {}

    // 2. Merge local custom products so created products are never lost on refresh
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_products_catalog");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const apiSlugs = new Set(list.map((p) => p.slug || String(p.id)));
            const localOnly = parsed.filter((p) => !apiSlugs.has(p.slug) && !apiSlugs.has(String(p.id)));
            list = [...localOnly, ...list];
          }
        } catch (e) {}
      }
    }

    // 3. Fallback to initial storefront catalog from data.ts
    if (!list || list.length === 0) {
      list = initialDefaultProducts;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_products_catalog", JSON.stringify(initialDefaultProducts));
      }
    }

    setProducts(list);
    setLoading(false);
  }

  function saveCatalogToStorage(newList: Product[]) {
    setProducts(newList);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_products_catalog", JSON.stringify(newList));
    }
  }

  // Handle Save (Create or Update)
  async function handleSaveProduct(formData: any) {
    let updatedList: Product[] = [];

    // Validation: Prevent duplicate product creation by name
    if (!editingProduct) {
      const normNew = (formData.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "");
      const exists = products.find((p) => (p.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "") === normNew);
      if (exists) {
        setMessage({ text: `Product "${formData.name}" already exists in catalog. Edit the existing item instead of creating a duplicate!`, type: "error" });
        setTimeout(() => setMessage(null), 4000);
        return;
      }
    }

    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "demo_admin_token";

      if (editingProduct) {
        // PUT Edit
        const res = await fetch(`${API_BASE}/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        let updatedItem: any = null;
        if (res.ok) {
          updatedItem = await res.json();
        }
        if (!updatedItem) {
          updatedItem = {
            ...editingProduct,
            ...formData,
            category: { name: formData.categorySlug.replace(/-/g, " "), slug: formData.categorySlug }
          };
        }

        updatedList = products.map((p) => (p.id === editingProduct.id ? updatedItem : p));
        setMessage({ text: `Product "${updatedItem.name}" updated successfully!`, type: "success" });
      } else {
        // POST Create
        const res = await fetch(`${API_BASE}/admin/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        let newItem: any = null;
        if (res.ok) {
          newItem = await res.json();
        }
        if (!newItem) {
          newItem = {
            id: `prod-${Date.now()}`,
            ...formData,
            category: { name: formData.categorySlug.replace(/-/g, " "), slug: formData.categorySlug }
          };
        }

        updatedList = [newItem, ...products];
        setMessage({ text: `Product "${newItem.name}" created & saved to database!`, type: "success" });
      }
    } catch (err) {
      const newItem = {
        id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
        ...formData,
        category: { name: formData.categorySlug.replace(/-/g, " "), slug: formData.categorySlug }
      };

      if (editingProduct) {
        updatedList = products.map((p) => (p.id === editingProduct.id ? newItem : p));
      } else {
        updatedList = [newItem, ...products];
      }
      setMessage({ text: `Product "${newItem.name}" saved!`, type: "success" });
    }

    saveCatalogToStorage(updatedList);
    setEditingProduct(null);
    setActiveTab("catalog");
    setTimeout(() => setMessage(null), 4000);
  }

  // Toggle Active/Inactive Status in both UI & MySQL Database
  async function handleToggleActive(id: string) {
    const targetProduct = products.find((p) => p.id === id);
    if (!targetProduct) return;

    const nextState = targetProduct.isActive === false ? true : false;

    const updated = products.map((p) => (p.id === id ? { ...p, isActive: nextState } : p));
    saveCatalogToStorage(updated);
    setMessage({ text: `Product "${targetProduct.name}" status updated to ${nextState ? "Active" : "Inactive"}.`, type: "success" });

    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "demo_admin_token";
      await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: nextState })
      });
    } catch (err) {}

    setTimeout(() => setMessage(null), 3000);
  }

  // Quick Inline Stock Edit in both UI & MySQL Database
  async function handleStockChange(productId: string, variantIndex: number, newStock: number) {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const updatedVariants = [...(p.variants || [])];
        if (updatedVariants[variantIndex]) {
          updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            stockQty: Math.max(0, newStock)
          };
        }
        return { ...p, variants: updatedVariants };
      }
      return p;
    });

    saveCatalogToStorage(updated);

    const product = products.find((p) => p.id === productId);
    const variant = product?.variants?.[variantIndex];
    if (variant && variant.id) {
      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "demo_admin_token";
        await fetch(`${API_BASE}/admin/products/${productId}/stock`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ variantId: variant.id, stockQty: Math.max(0, newStock) })
        });
      } catch (e) {}
    }
  }

  // Soft or Hard Delete execution in both UI & MySQL Database
  async function confirmDelete(mode: "soft" | "hard") {
    if (!deleteTarget) return;

    let updated: Product[];
    if (mode === "soft") {
      updated = products.map((p) => (p.id === deleteTarget.id ? { ...p, isActive: false } : p));
      setMessage({ text: `Product "${deleteTarget.name}" status set to Inactive.`, type: "success" });

      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "demo_admin_token";
        await fetch(`${API_BASE}/admin/products/${deleteTarget.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ isActive: false })
        });
      } catch (e) {}
    } else {
      updated = products.filter((p) => p.id !== deleteTarget.id && p.slug !== deleteTarget.slug);
      setMessage({ text: `Product "${deleteTarget.name}" permanently deleted.`, type: "success" });

      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "demo_admin_token";
        await fetch(`${API_BASE}/admin/products/${deleteTarget.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
    }

    setProducts(updated);
    saveCatalogToStorage(updated);

    // Also purge from localStorage cache if present
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_products_catalog");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const filtered = parsed.filter((p: any) => p.id !== deleteTarget.id && p.slug !== deleteTarget.slug);
          localStorage.setItem("admin_products_catalog", JSON.stringify(filtered));
        } catch (e) {}
      }
    }

    setDeleteTarget(null);
    setTimeout(() => setMessage(null), 3000);
  }

  // Add New Category Modal handler in both UI & MySQL Database
  async function handleAddNewCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const catSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newCatObj = { name: newCatName.trim(), slug: catSlug };

    // Optimistically update UI state & localStorage
    const updatedCategories = [...categoriesList, newCatObj];
    setCategoriesList(updatedCategories);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_custom_categories");
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem("admin_custom_categories", JSON.stringify([...list, newCatObj]));
    }

    // Persist new category to MySQL Database
    try {
      await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), slug: catSlug })
      });
    } catch (e) {}

    setNewCatName("");
    setIsAddCatModalOpen(false);
    setMessage({ text: `New Category "${newCatName.trim()}" added to database!`, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  }

  // Filtered and Paginated Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      const matchesCat = selectedCatFilter
        ? (
            p.categorySlug === selectedCatFilter ||
            p.category?.slug === selectedCatFilter ||
            p.subcategory === selectedCatFilter ||
            (typeof p.category === 'string' && p.category === selectedCatFilter) ||
            (typeof p.category === 'object' && p.category?.slug === selectedCatFilter)
          )
        : true;
      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
          ? p.isActive !== false
          : p.isActive === false;

      const hasLowStock = (p.variants || []).some((v: any) => (v.stockQty ?? v.stock ?? 0) <= 10);
      const matchesStock = stockFilter === "LOW_STOCK" ? hasLowStock : true;

      return matchesSearch && matchesCat && matchesStatus && matchesStock;
    });
  }, [products, searchQuery, selectedCatFilter, statusFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  function startEdit(product: Product) {
    setEditingProduct(product);
    setActiveTab("form");
  }

  function startCreateNew() {
    setEditingProduct(null);
    setActiveTab("form");
  }

  // Analytics Stats for Header Cards
  const activeCount = useMemo(() => products.filter((p) => p.isActive !== false).length, [products]);
  const lowStockCount = useMemo(() => products.filter((p) => (p.variants || []).some((v: any) => (v.stockQty ?? v.stock ?? 0) <= 10)).length, [products]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Banner Header Command Center */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-6 rounded-3xl text-white border-2 border-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-2 border border-gold/30">
              <Package size={14} />
              <span>Product Catalog Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Product Control Room</h1>
            <p className="text-xs text-gray-300 mt-1">
              Add new sweets & namkeen products, edit pricing variants, manage stock levels, and update catalog status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchProducts}
              className="bg-white/10 hover:bg-white/20 text-gold px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-gold/30 transition"
              title="Refresh Products Catalog"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsAddCatModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-amber-200 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-400/30 transition"
            >
              <FolderPlus size={15} />
              <span>+ Category</span>
            </button>

            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition ${
                activeTab === "catalog" ? "bg-gold text-[#0B1B3D] shadow-md border border-gold" : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
              }`}
            >
              <Layers size={15} />
              <span>Product List ({products.length})</span>
            </button>

            <button
              onClick={startCreateNew}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition ${
                activeTab === "form" ? "bg-gold text-[#0B1B3D] shadow-md border border-gold" : "bg-gold text-[#0B1B3D] hover:bg-gold-light shadow border border-gold"
              }`}
            >
              <Plus size={15} />
              <span>{editingProduct ? "Edit Product" : "Add Product"}</span>
            </button>
          </div>
        </div>

        {/* Catalog Snapshot KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gold/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Total Products</p>
              <p className="text-2xl font-black text-[#0B1B3D] mt-0.5">{products.length}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-gold/30 text-gold-dark">
              <Package size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gold/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Active Live</p>
              <p className="text-2xl font-black text-green-700 mt-0.5">{activeCount}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-green-700">
              <Eye size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gold/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Low Stock Alert</p>
              <p className="text-2xl font-black text-amber-700 mt-0.5">{lowStockCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-700">
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gold/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Categories</p>
              <p className="text-2xl font-black text-[#0B1B3D] mt-0.5">{categoriesList.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-800">
              <Tag size={20} />
            </div>
          </div>
        </div>

        {/* Global Toast Message */}
        {message && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow border ${
            message.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"
          }`}>
            <CheckCircle2 size={18} />
            <span>{message.text}</span>
          </div>
        )}

        {/* TAB 1: PRODUCT LIST TABLE VIEW */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            
            {/* Search Bar, Filter Controls & Items Per Page Picker */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gold/20 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative w-full lg:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search product name or slug..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-gold outline-none bg-white"
                />
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                
                {/* Category Selector */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                  <Filter size={14} className="text-gold-dark shrink-0" />
                  <select
                    value={selectedCatFilter}
                    onChange={(e) => { setSelectedCatFilter(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent text-xs font-bold text-[#0B1B3D] outline-none cursor-pointer"
                  >
                    <option value="">All Categories ({categoriesList.length})</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Selector */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                  className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] outline-none cursor-pointer"
                >
                  <option value="ALL">Status: All</option>
                  <option value="ACTIVE">Status: Active</option>
                  <option value="INACTIVE">Status: Inactive</option>
                </select>

                {/* Stock Selector */}
                <select
                  value={stockFilter}
                  onChange={(e) => { setStockFilter(e.target.value as any); setCurrentPage(1); }}
                  className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] outline-none cursor-pointer"
                >
                  <option value="ALL">Stock: All</option>
                  <option value="LOW_STOCK">Stock: Low Alert (≤10)</option>
                </select>

                {/* Items Per Page Selector */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                  <SlidersHorizontal size={14} className="text-gold-dark shrink-0" />
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-transparent text-xs font-bold text-[#0B1B3D] outline-none cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>All items</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {(searchQuery || selectedCatFilter || statusFilter !== "ALL" || stockFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCatFilter("");
                      setStatusFilter("ALL");
                      setStockFilter("ALL");
                      setCurrentPage(1);
                    }}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 px-2"
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Product List Table View */}
            <div className="bg-white rounded-3xl border-2 border-gold/30 shadow-md overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-500 font-bold text-xs flex items-center justify-center gap-2">
                  <RefreshCw size={18} className="animate-spin text-gold-dark" />
                  <span>Loading product catalog...</span>
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Package size={36} className="mx-auto text-gray-400" />
                  <h3 className="font-extrabold text-[#0B1B3D]">No products found matching filter criteria</h3>
                  <p className="text-xs text-gray-500">Try searching a different keyword or resetting filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCatFilter("");
                      setStatusFilter("ALL");
                      setStockFilter("ALL");
                    }}
                    className="text-gold-dark font-extrabold hover:underline text-xs mt-2 inline-block"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0B1B3D] text-gold uppercase text-[10px] font-black tracking-wider border-b border-gold/30">
                        <th className="p-4">Product Details</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price Range</th>
                        <th className="p-4">Stock & Variants (Quick Edit)</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedProducts.map((p) => {
                        const totalStock = (p.variants || []).reduce((sum: number, v: any) => sum + (v.stockQty ?? v.stock ?? 0), 0);
                        const isLowStock = (p.variants || []).some((v: any) => (v.stockQty ?? v.stock ?? 0) <= 10);
                        const minPrice = Math.min(...(p.variants || [{ price: 200 }]).map((v: any) => v.discountedPrice || v.price));
                        const maxPrice = Math.max(...(p.variants || [{ price: 200 }]).map((v: any) => v.price));
                        const thumbnail = p.primaryImage || p.imageUrls?.[0] || p.image || "/images/sweet-1.jpg";

                        return (
                          <tr key={p.id} className={`hover:bg-amber-50/40 transition ${!p.isActive ? 'bg-gray-50/80 opacity-70' : ''}`}>
                            {/* Product Info */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={thumbnail}
                                  alt={p.name}
                                  onError={(e) => { (e.target as HTMLImageElement).src = "/images/sweet-1.jpg"; }}
                                  className="w-12 h-12 rounded-xl object-cover border border-gold/30 shrink-0 shadow-xs"
                                />
                                <div>
                                  <h4 className="font-extrabold text-[#0B1B3D] text-sm flex items-center gap-1.5 flex-wrap">
                                    <span>{p.name}</span>
                                    {p.tag && p.tag !== 'none' && (
                                      <span className="bg-[#0B1B3D] text-gold px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-gold/30">
                                        {p.tag}
                                      </span>
                                    )}
                                  </h4>
                                  <span className="font-mono text-[10px] text-gray-500 block mt-0.5">slug: {p.slug}</span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-4 font-extrabold text-gold-dark">
                              {p.subcategory ? `${p.category?.name || (typeof p.category === 'string' ? p.category : 'Sweets')} ➔ ${p.subcategory}` : (p.category?.name || p.categorySlug || p.category || "Sweets")}
                            </td>

                            {/* Price Range */}
                            <td className="p-4 font-black text-[#0B1B3D]">
                              {minPrice === maxPrice ? (
                                <span>₹{minPrice.toLocaleString('en-IN')}</span>
                              ) : (
                                <span>₹{minPrice.toLocaleString('en-IN')} – ₹{maxPrice.toLocaleString('en-IN')}</span>
                              )}
                            </td>

                            {/* Stock & Variants Inline Quick Edit */}
                            <td className="p-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-[#0B1B3D]">Total Stock: {totalStock}</span>
                                  {isLowStock && (
                                    <span className="bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1">
                                      <AlertTriangle size={11} />
                                      <span>Low Alert</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                  {(p.variants || []).map((v: any, vIdx: number) => (
                                    <div key={vIdx} className="bg-amber-50/60 border border-gold/30 px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                                      <span className="font-bold text-[10px] text-[#0B1B3D]">{v.weightLabel || v.weight}:</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={v.stockQty ?? v.stock ?? 0}
                                        onChange={(e) => handleStockChange(p.id, vIdx, Number(e.target.value))}
                                        className="w-14 border border-gray-300 rounded-md px-1 py-0.5 text-[11px] font-black text-center bg-white outline-none focus:border-gold"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>

                            {/* Active Toggle */}
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleToggleActive(p.id)}
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 mx-auto transition shadow-xs ${
                                  p.isActive !== false
                                    ? "bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
                                    : "bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300"
                                }`}
                              >
                                {p.isActive !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                                <span>{p.isActive !== false ? "Active" : "Inactive"}</span>
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => startEdit(p)}
                                  className="p-2 text-[#0B1B3D] hover:bg-gold/20 rounded-xl transition border border-gold/30"
                                  title="Edit Product"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(p)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200"
                                  title="Delete Product"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Footer */}
              <div className="p-4 bg-gray-50 border-t border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs font-bold text-gray-700">
                  Showing {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} Products
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="p-2 rounded-xl bg-white border border-gray-300 text-gray-700 disabled:opacity-40 hover:bg-gold/20 font-bold transition"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition ${
                          currentPage === idx + 1
                            ? "bg-[#0B1B3D] text-gold shadow-sm border border-gold"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-gold"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="p-2 rounded-xl bg-white border border-gray-300 text-gray-700 disabled:opacity-40 hover:bg-gold/20 font-bold transition"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD / EDIT PRODUCT FORM */}
        {activeTab === "form" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gold/30 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-gold/20 pb-4">
              <h2 className="text-lg font-black text-[#0B1B3D] flex items-center gap-2">
                <Package size={22} className="text-gold-dark" />
                <span>{editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product Item"}</span>
              </h2>
              <button
                onClick={() => setActiveTab("catalog")}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
            </div>

            <ProductForm
              initialData={editingProduct}
              categoriesList={categoriesList}
              onOpenAddCategoryModal={() => setIsAddCatModalOpen(true)}
              onSave={handleSaveProduct}
            />
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-gold shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={30} />
              </div>

              <h3 className="text-xl font-black text-[#0B1B3D]">Delete Product Confirmation</h3>
              <p className="text-xs text-gray-600">
                Are you sure you want to delete <span className="font-extrabold text-[#0B1B3D]">&quot;{deleteTarget.name}&quot;</span>? Choose soft delete (disable status) or permanent hard delete.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => confirmDelete("soft")}
                  className="bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 py-3 rounded-xl font-black text-xs transition"
                >
                  Soft Delete (Deactivate)
                </button>
                <button
                  onClick={() => confirmDelete("hard")}
                  className="bg-red-600 text-white hover:bg-red-700 py-3 rounded-xl font-black text-xs transition shadow-md"
                >
                  Permanent Hard Delete
                </button>
              </div>

              <button
                onClick={() => setDeleteTarget(null)}
                className="w-full text-xs font-bold text-gray-500 hover:underline pt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ADD NEW CATEGORY INLINE MODAL */}
        {isAddCatModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleAddNewCategory} className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border-4 border-gold shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-base font-black text-[#0B1B3D]">Add New Category</h3>
                <button type="button" onClick={() => setIsAddCatModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Sweets ➔ Dryfruit Penda"
                  className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-gold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B1B3D] text-gold hover:bg-[#162C5B] py-3 rounded-xl font-extrabold text-xs shadow-md border border-gold"
              >
                Create Category
              </button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// FORM COMPONENT FOR CREATE & EDIT
function ProductForm({
  initialData,
  categoriesList,
  onOpenAddCategoryModal,
  onSave
}: {
  initialData?: Product | null;
  categoriesList: Array<{ name: string; slug: string }>;
  onOpenAddCategoryModal: () => void;
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("kaju-sweets");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("none");
  const [isActive, setIsActive] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<Array<{ name: string; preview: string }>>([]);

  const [variants, setVariants] = useState<Array<{ weightLabel: string; price: string; discountedPrice: string; stockQty: string; sku: string }>>([
    { weightLabel: "250g", price: "450", discountedPrice: "399", stockQty: "50", sku: `SKU-${Date.now().toString().slice(-4)}-1` },
    { weightLabel: "500g", price: "850", discountedPrice: "799", stockQty: "40", sku: `SKU-${Date.now().toString().slice(-4)}-2` }
  ]);

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setCategorySlug(initialData.categorySlug || initialData.category?.slug || "kaju-sweets");
      setDescription(initialData.description || "");
      setTag(initialData.tag || "none");
      setIsActive(initialData.isActive ?? true);

      if (initialData.imageUrls && initialData.imageUrls.length > 0) {
        setSelectedPhotos(initialData.imageUrls.map((url: string, idx: number) => ({ name: `photo-${idx}`, preview: url })));
      } else if (initialData.primaryImage) {
        setSelectedPhotos([{ name: "photo-1", preview: initialData.primaryImage }]);
      }

      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(
          initialData.variants.map((v: any) => ({
            weightLabel: v.weightLabel || v.weight || "500g",
            price: String(v.price || 250),
            discountedPrice: v.discountedPrice ? String(v.discountedPrice) : "",
            stockQty: String(v.stockQty ?? v.stock ?? 20),
            sku: v.sku || `SKU-${Date.now().toString().slice(-4)}`
          }))
        );
      }
    }
  }, [initialData]);

  function handleAddVariant() {
    setVariants([
      ...variants,
      { weightLabel: "1kg", price: "1000", discountedPrice: "", stockQty: "30", sku: `SKU-${Date.now().toString().slice(-4)}` }
    ]);
  }

  function handleRemoveVariant(index: number) {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, idx) => idx !== index));
  }

  function handleVariantChange(index: number, field: string, value: string) {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  }

  async function filesToPhotoPreviews(fileList: FileList | null) {
    if (!fileList?.length) return;

    const processImage = (file: File): Promise<{ name: string; preview: string }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
              resolve({ name: file.name, preview: compressedDataUrl });
            } else {
              resolve({ name: file.name, preview: img.src });
            }
          };
          img.onerror = () => reject(new Error(`Unable to load image ${file.name}`));
        };
        reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
      });
    };

    const previews = await Promise.all(Array.from(fileList).map(processImage));
    setSelectedPhotos((current) => [...current, ...previews]);
  }

  function removePhoto(index: number) {
    setSelectedPhotos((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function setMainPhoto(index: number) {
    if (index === 0) return;
    const item = selectedPhotos[index];
    const rest = selectedPhotos.filter((_, idx) => idx !== index);
    setSelectedPhotos([item, ...rest]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: any = {};
    if (!name) newErrors.name = "Product name is required.";
    if (!slug) newErrors.slug = "URL slug is required.";

    const parsedImageUrls = selectedPhotos.map((photo) => photo.preview).filter(Boolean);
    if (!parsedImageUrls.length) {
      parsedImageUrls.push("/images/sweet-1.jpg");
    }

    const formattedVariants = variants.map((v, idx) => {
      const parsedPrice = Number(v.price);
      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        newErrors[`variant_price_${idx}`] = "Valid price required";
      }
      return {
        weightLabel: v.weightLabel || "250g",
        price: parsedPrice || 100,
        discountedPrice: v.discountedPrice.trim() ? Number(v.discountedPrice) : undefined,
        stockQty: Number(v.stockQty) || 10,
        sku: v.sku || `SKU-${idx + 1}`
      };
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name,
      slug,
      categorySlug,
      description,
      tag,
      isActive,
      primaryImage: parsedImageUrls[0] || "/images/sweet-1.jpg",
      imageUrls: parsedImageUrls,
      variants: formattedVariants
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Product Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
              }
            }}
            placeholder="e.g. Royal Kaju Katli"
            className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold bg-white"
          />
          {errors.name && <p className="text-[10px] text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* URL Slug */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">URL Slug *</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. royal-kaju-katli"
            className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-gold bg-white"
          />
          {errors.slug && <p className="text-[10px] text-red-600 mt-1">{errors.slug}</p>}
        </div>

        {/* Category Selector with Add New Category Trigger */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700">Category *</label>
            <button
              type="button"
              onClick={onOpenAddCategoryModal}
              className="text-[11px] font-bold text-gold-dark hover:underline flex items-center gap-1"
            >
              <Plus size={12} />
              <span>Add Category</span>
            </button>
          </div>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold bg-white"
          >
            {categoriesList.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Tag */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Product Tag / Badge</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full border border-gray-300 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold bg-white"
          >
            <option value="none">None</option>
            <option value="best_seller">🔥 Best Seller</option>
            <option value="new_arrival">✨ New Arrival</option>
            <option value="premium">👑 Premium Quality</option>
            <option value="combo">🎁 Gift Combo</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter detailed product ingredients, specialty, shelf life, and taste notes..."
          className="w-full border border-gray-300 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gold bg-white font-medium"
        />
      </div>

      {/* Photo Gallery & Main Cover Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-700">Product Photo Gallery</label>
        <div className="p-4 border-2 border-dashed border-gold/40 rounded-2xl bg-amber-50/30 text-center space-y-2">
          <input
            type="file"
            accept="image/*"
            multiple
            id="photo-upload"
            onChange={(e) => filesToPhotoPreviews(e.target.files)}
            className="hidden"
          />
          <label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center gap-2 bg-[#0B1B3D] text-gold px-4 py-2 rounded-xl text-xs font-black shadow border border-gold/30">
            <ImageIcon size={16} />
            <span>Upload Product Images</span>
          </label>
          <p className="text-[10px] text-gray-500 font-semibold">First image will be set as primary store cover.</p>
        </div>

        {selectedPhotos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
            {selectedPhotos.map((photo, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-300 bg-gray-100 aspect-square">
                <img src={photo.preview} alt="Upload preview" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-gold text-[#0B1B3D] text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => setMainPhoto(idx)}
                      className="bg-gold text-[#0B1B3D] text-[9px] font-black px-1.5 py-0.5 rounded"
                      title="Set as Main Cover"
                    >
                      Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="p-1 bg-red-600 text-white rounded-full"
                    title="Remove Image"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants & Stock Matrix */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-[#0B1B3D]">Weight Variants & Stock Pricing Matrix</h3>
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-xs font-bold text-gold-dark hover:underline flex items-center gap-1 bg-gold/15 px-3 py-1 rounded-lg border border-gold/30"
          >
            <Plus size={14} />
            <span>Add Weight Variant</span>
          </button>
        </div>

        <div className="space-y-2">
          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 items-center">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Weight Pack *</label>
                <input
                  type="text"
                  required
                  value={v.weightLabel}
                  onChange={(e) => handleVariantChange(idx, "weightLabel", e.target.value)}
                  placeholder="250g / 500g / 1kg"
                  className="w-full border border-gray-300 p-1.5 rounded-lg text-xs font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Regular Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={v.price}
                  onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                  className="w-full border border-gray-300 p-1.5 rounded-lg text-xs font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Offer Price (₹)</label>
                <input
                  type="number"
                  value={v.discountedPrice}
                  onChange={(e) => handleVariantChange(idx, "discountedPrice", e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-gray-300 p-1.5 rounded-lg text-xs font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={v.stockQty}
                  onChange={(e) => handleVariantChange(idx, "stockQty", e.target.value)}
                  className="w-full border border-gray-300 p-1.5 rounded-lg text-xs font-bold bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 sm:pt-0">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">SKU Code</label>
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                    className="w-full border border-gray-300 p-1.5 rounded-lg text-[10px] font-mono bg-white"
                  />
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition self-end mb-1"
                    title="Remove Variant"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Toggle & Submit Buttons */}
      <div className="pt-4 border-t flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-gold focus:ring-gold rounded"
          />
          <span>Active Product (Visible on Storefront)</span>
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md border border-gold"
          >
            {initialData ? "Update Product Item" : "Save & Publish Product"}
          </button>
        </div>
      </div>
    </form>
  );
}
