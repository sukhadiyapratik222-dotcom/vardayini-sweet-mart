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
  FolderPlus
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

    // 2. Try localStorage if API returns empty
    if (!list || list.length === 0) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("admin_products_catalog");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              list = parsed;
            }
          } catch (e) {}
        }
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

    try {
      const token = localStorage.getItem("admin_token") || "demo_admin_token";

      if (editingProduct) {
        // PUT Edit
        await fetch(`${API_BASE}/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const updatedItem = {
          ...editingProduct,
          ...formData,
          category: { name: formData.categorySlug.replace(/-/g, " "), slug: formData.categorySlug }
        };

        updatedList = products.map((p) => (p.id === editingProduct.id ? updatedItem : p));
        setMessage({ text: `Product "${updatedItem.name}" updated successfully!`, type: "success" });
      } else {
        // POST Create
        await fetch(`${API_BASE}/admin/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const newItem = {
          id: `prod-${Date.now()}`,
          ...formData,
          category: { name: formData.categorySlug.replace(/-/g, " "), slug: formData.categorySlug }
        };

        updatedList = [newItem, ...products];
        setMessage({ text: `Product "${newItem.name}" created successfully!`, type: "success" });
      }
    } catch (err) {
      const newItem = {
        id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
        ...formData,
        category: { name: formData.categorySlug.replace(/-/g, " "), slug: formData.categorySlug }
      };

      if (editingProduct) {
        updatedList = products.map((p) => (p.id === editingProduct.id ? newItem : p));
        setMessage({ text: `Product "${newItem.name}" updated successfully!`, type: "success" });
      } else {
        updatedList = [newItem, ...products];
        setMessage({ text: `Product "${newItem.name}" created successfully!`, type: "success" });
      }
    }

    saveCatalogToStorage(updatedList);
    setEditingProduct(null);
    setActiveTab("catalog");
    setTimeout(() => setMessage(null), 4000);
  }

  // Toggle Active/Inactive Status
  function handleToggleActive(id: string) {
    const updated = products.map((p) => {
      if (p.id === id) {
        const nextState = !p.isActive;
        setMessage({ text: `Product "${p.name}" status changed to ${nextState ? "Active" : "Inactive"}.`, type: "success" });
        return { ...p, isActive: nextState };
      }
      return p;
    });

    saveCatalogToStorage(updated);
    setTimeout(() => setMessage(null), 3000);
  }

  // Quick Inline Stock Edit
  function handleStockChange(productId: string, variantIndex: number, newStock: number) {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const updatedVariants = [...p.variants];
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
  }

  // Soft or Hard Delete execution
  async function confirmDelete(mode: "soft" | "hard") {
    if (!deleteTarget) return;

    let updated: Product[];
    if (mode === "soft") {
      updated = products.map((p) => (p.id === deleteTarget.id ? { ...p, isActive: false } : p));
      setMessage({ text: `Product "${deleteTarget.name}" soft-deleted (Set to Inactive).`, type: "success" });
    } else {
      updated = products.filter((p) => p.id !== deleteTarget.id);
      setMessage({ text: `Product "${deleteTarget.name}" permanently deleted.`, type: "success" });

      try {
        const token = localStorage.getItem("admin_token") || "demo_admin_token";
        await fetch(`${API_BASE}/admin/products/${deleteTarget.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
    }

    saveCatalogToStorage(updated);
    setDeleteTarget(null);
    setTimeout(() => setMessage(null), 3000);
  }

  // Add New Category Modal handler
  function handleAddNewCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setCategoriesList([...categoriesList, { name: newCatName.trim(), slug: catSlug }]);
    setNewCatName("");
    setIsAddCatModalOpen(false);
    setMessage({ text: `New Category "${newCatName.trim()}" added!`, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  }

  // Filtered and Paginated Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      const matchesCat = selectedCatFilter ? (p.categorySlug === selectedCatFilter || p.category?.slug === selectedCatFilter) : true;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCatFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  function startEdit(product: Product) {
    setEditingProduct(product);
    setActiveTab("form");
  }

  function startCreateNew() {
    setEditingProduct(null);
    setActiveTab("form");
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0B1B3D]">Product Management Control Room</h1>
            <p className="text-xs sm:text-sm text-gray-500">Add, edit, manage stock levels, and set product variants & galleries.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                activeTab === "catalog" ? "bg-[#0B1B3D] text-gold shadow-md" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Layers size={16} />
              <span>Product List ({products.length})</span>
            </button>

            <button
              onClick={startCreateNew}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                activeTab === "form" ? "bg-gold text-[#0B1B3D] shadow-md border border-gold" : "bg-gold/20 text-gold-dark hover:bg-gold/30 border border-gold/40"
              }`}
            >
              <Plus size={16} />
              <span>{editingProduct ? "Edit Product" : "Add New Product"}</span>
            </button>
          </div>
        </div>

        {/* Global Toast Message */}
        {message && (
          <div className={`p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm border ${
            message.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"
          }`}>
            <CheckCircle2 size={18} />
            <span>{message.text}</span>
          </div>
        )}

        {/* TAB 1: PRODUCT LIST TABLE VIEW */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            {/* Search Bar & Category Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border-2 border-gold/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by product name or slug..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-gold outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Filter size={15} className="text-gold-dark" />
                  <span>Category:</span>
                </div>
                <select
                  value={selectedCatFilter}
                  onChange={(e) => { setSelectedCatFilter(e.target.value); setCurrentPage(1); }}
                  className="border border-gray-300 px-3 py-2 rounded-xl text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product List Table View */}
            <div className="bg-white rounded-2xl border-2 border-gold/30 shadow-md overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-500 font-bold">Loading product catalog...</div>
              ) : paginatedProducts.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Package size={36} className="mx-auto text-gray-400" />
                  <h3 className="font-extrabold text-[#0B1B3D]">No products found matching filters</h3>
                  <p className="text-xs text-gray-500">Try adjusting search term or category filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0B1B3D] text-gold font-extrabold border-b border-gold/30">
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Price Range</th>
                        <th className="p-3.5">Stock & Variants (Quick Edit)</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedProducts.map((p) => {
                        const totalStock = (p.variants || []).reduce((sum: number, v: any) => sum + (v.stockQty ?? v.stock ?? 0), 0);
                        const isLowStock = (p.variants || []).some((v: any) => (v.stockQty ?? v.stock ?? 0) < 10);
                        const minPrice = Math.min(...(p.variants || [{ price: 200 }]).map((v: any) => v.discountedPrice || v.price));
                        const maxPrice = Math.max(...(p.variants || [{ price: 200 }]).map((v: any) => v.price));
                        const thumbnail = p.primaryImage || p.imageUrls?.[0] || "/images/sweet-1.jpg";

                        return (
                          <tr key={p.id} className={`hover:bg-amber-50/40 transition ${!p.isActive ? 'bg-gray-50 opacity-70' : ''}`}>
                            {/* Product Info */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img src={thumbnail} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-300 shrink-0" />
                                <div>
                                  <h4 className="font-extrabold text-[#0B1B3D] text-sm flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    {p.tag && p.tag !== 'none' && (
                                      <span className="bg-[#0B1B3D] text-gold px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                                        {p.tag}
                                      </span>
                                    )}
                                  </h4>
                                  <span className="font-mono text-[11px] text-gray-500">slug: {p.slug}</span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-3.5 font-bold text-gold-dark">
                              {p.category?.name || p.categorySlug || "Sweets"}
                            </td>

                            {/* Price Range */}
                            <td className="p-3.5 font-black text-[#0B1B3D]">
                              {minPrice === maxPrice ? (
                                <span>₹{minPrice}</span>
                              ) : (
                                <span>₹{minPrice} - ₹{maxPrice}</span>
                              )}
                            </td>

                            {/* Stock & Variants Inline Quick Edit */}
                            <td className="p-3.5">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-700">Total: {totalStock}</span>
                                  {isLowStock && (
                                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1">
                                      <AlertTriangle size={11} />
                                      <span>Low Stock</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                  {(p.variants || []).map((v: any, vIdx: number) => (
                                    <div key={vIdx} className="bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1">
                                      <span className="font-bold text-[10px] text-gray-800">{v.weightLabel || v.weight}:</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={v.stockQty ?? v.stock ?? 0}
                                        onChange={(e) => handleStockChange(p.id, vIdx, Number(e.target.value))}
                                        className="w-12 border border-gray-300 rounded px-1 text-[11px] font-bold text-center bg-white"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>

                            {/* Active Toggle */}
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handleToggleActive(p.id)}
                                className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 mx-auto transition ${
                                  p.isActive ? "bg-green-100 text-green-800 border border-green-300" : "bg-gray-200 text-gray-600 border border-gray-300"
                                }`}
                              >
                                {p.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                                <span>{p.isActive ? "Active" : "Inactive"}</span>
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => startEdit(p)}
                                  className="p-2 text-gold-dark hover:bg-gold/20 rounded-lg transition"
                                  title="Edit Product"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(p)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete Product"
                                >
                                  <Trash2 size={16} />
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

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">
                    Page {currentPage} of {totalPages} ({filteredProducts.length} items)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="p-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-40 hover:bg-gold/20"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="p-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-40 hover:bg-gold/20"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD / EDIT PRODUCT FORM */}
        {activeTab === "form" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-gold/30 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-black text-[#0B1B3D] flex items-center gap-2">
                <Package size={22} className="text-gold-dark" />
                <span>{editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product Item"}</span>
              </h2>
              <button
                onClick={() => setActiveTab("catalog")}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
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
    { weightLabel: "250g", price: "450", discountedPrice: "399", stockQty: "50", sku: "SKU-250G" },
    { weightLabel: "500g", price: "850", discountedPrice: "799", stockQty: "40", sku: "SKU-500G" }
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
      description,
      categorySlug,
      tag,
      isActive,
      primaryImage: parsedImageUrls[0],
      imageUrls: parsedImageUrls,
      variants: formattedVariants
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5 text-xs sm:text-sm">
      {/* Product Name & Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
            }}
            className={`w-full border px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-gold outline-none text-xs font-semibold ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g. Special Kaju Katli"
          />
          {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">URL Slug <span className="text-red-500">*</span></label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`w-full border px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-gold outline-none text-xs font-mono ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g. special-kaju-katli"
          />
          {errors.slug && <p className="text-red-500 text-[10px] mt-0.5">{errors.slug}</p>}
        </div>
      </div>

      {/* Category & Tag & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700">Category <span className="text-red-500">*</span></label>
            <button
              type="button"
              onClick={onOpenAddCategoryModal}
              className="text-[11px] font-extrabold text-gold-dark hover:underline flex items-center gap-0.5"
            >
              <FolderPlus size={12} />
              <span>+ Add Category</span>
            </button>
          </div>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl bg-white focus:ring-2 focus:ring-gold outline-none font-semibold text-gray-800 text-xs"
          >
            {categoriesList.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Tag / Badge</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl bg-white focus:ring-2 focus:ring-gold outline-none font-semibold text-gray-800 text-xs"
          >
            <option value="none">None</option>
            <option value="best_seller">Best Seller 🔥</option>
            <option value="new_arrival">New Arrival ✨</option>
            <option value="premium">Premium 👑</option>
            <option value="combo">Combo Deal 🎁</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Publish Status</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-full py-2.5 rounded-xl font-black text-xs border flex items-center justify-center gap-2 transition ${
              isActive ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-200 text-gray-600 border-gray-300"
            }`}
          >
            {isActive ? <Eye size={15} /> : <EyeOff size={15} />}
            <span>{isActive ? "Active (Visible on Storefront)" : "Inactive (Hidden)"}</span>
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-gold outline-none text-xs font-medium"
          rows={3}
          placeholder="Describe ingredients, taste, purity, and shelf-life..."
        />
      </div>

      {/* Photos Gallery */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Product Photos (Upload Multi-Images)</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gold transition text-center">
            <ImageIcon size={20} className="text-gray-400 mb-1" />
            <span className="font-bold text-xs text-gray-700">Add Image Files</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void filesToPhotoPreviews(e.target.files)} />
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gold transition text-center">
            <ImageIcon size={20} className="text-gray-400 mb-1" />
            <span className="font-bold text-xs text-gray-700">Add Image Folder</span>
            <input type="file" accept="image/*" multiple className="hidden" {...({ webkitdirectory: "" } as any)} onChange={(e) => void filesToPhotoPreviews(e.target.files)} />
          </label>
        </div>

        {selectedPhotos.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {selectedPhotos.map((photo, index) => (
              <div key={index} className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 group ${index === 0 ? 'border-gold shadow-md ring-2 ring-gold/40' : 'border-gray-300'}`}>
                <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
                {index === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-gold text-[#0B1B3D] text-[9px] font-black text-center py-0.5">
                    MAIN
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 text-[9px] font-bold rounded-full shadow"
                >
                  ✕
                </button>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setMainPhoto(index)}
                    className="absolute bottom-1 left-1 bg-[#0B1B3D] text-gold p-0.5 text-[8px] font-extrabold rounded"
                  >
                    Set Main
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Repeatable Weight & Quantity Variants Section */}
      <div className="border-2 border-gold/40 rounded-2xl p-4 sm:p-5 bg-amber-50/40 space-y-4">
        <div className="flex items-center justify-between border-b border-gold/30 pb-2">
          <div>
            <h3 className="font-black text-[#0B1B3D] text-sm">Quantity & Weight Variants</h3>
            <p className="text-[11px] text-gray-600">Add pack sizes (e.g. 250g, 500g, 1kg) with individual prices, offer prices, stock levels & SKUs.</p>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm border border-gold/30"
          >
            <Plus size={14} />
            <span>Add Variant</span>
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-gold/30 shadow-sm space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[#0B1B3D]">Variant #{idx + 1}</span>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-0.5"
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Weight/Size</label>
                  <select
                    value={
                      ["100g", "200g", "250g", "400g", "500g", "750g", "1kg", "2kg", "5kg", "1 Pack", "Combo Pack"].includes(v.weightLabel)
                        ? v.weightLabel
                        : "custom"
                    }
                    onChange={(e) => {
                      if (e.target.value !== "custom") {
                        handleVariantChange(idx, "weightLabel", e.target.value);
                      }
                    }}
                    className="w-full border border-gray-300 px-2 py-1.5 rounded-lg text-xs font-bold bg-white focus:ring-2 focus:ring-gold outline-none"
                  >
                    <option value="100g">100g</option>
                    <option value="200g">200g</option>
                    <option value="250g">250g</option>
                    <option value="400g">400g</option>
                    <option value="500g">500g</option>
                    <option value="750g">750g</option>
                    <option value="1kg">1kg</option>
                    <option value="2kg">2kg</option>
                    <option value="5kg">5kg</option>
                    <option value="1 Pack">1 Pack</option>
                    <option value="Combo Pack">Combo Pack</option>
                    <option value="custom">✏️ Custom Size...</option>
                  </select>

                  {!["100g", "200g", "250g", "400g", "500g", "750g", "1kg", "2kg", "5kg", "1 Pack", "Combo Pack"].includes(v.weightLabel) && (
                    <input
                      type="text"
                      value={v.weightLabel}
                      onChange={(e) => handleVariantChange(idx, "weightLabel", e.target.value)}
                      className="w-full mt-1 border border-gold/50 px-2 py-1 rounded-lg text-xs font-semibold"
                      placeholder="Custom size..."
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Regular Price (₹)</label>
                  <input
                    type="number"
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1.5 rounded-lg text-xs font-semibold"
                    placeholder="450"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={v.discountedPrice}
                    onChange={(e) => handleVariantChange(idx, "discountedPrice", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1.5 rounded-lg text-xs font-semibold"
                    placeholder="399"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Stock Qty</label>
                  <input
                    type="number"
                    value={v.stockQty}
                    onChange={(e) => handleVariantChange(idx, "stockQty", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1.5 rounded-lg text-xs font-semibold"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">SKU Code</label>
                  <input
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1.5 rounded-lg text-xs font-mono"
                    placeholder="SKU-250G"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        className="w-full bg-[#0B1B3D] text-gold hover:bg-[#162C5B] py-3.5 rounded-xl font-black text-sm shadow-md transition border border-gold/40 flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        <span>{initialData ? "Update Product Item" : "Save & Publish Product"}</span>
      </button>
    </form>
  );
}
