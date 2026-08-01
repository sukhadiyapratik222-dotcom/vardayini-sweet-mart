"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
import { Plus, Trash2, Tag, Layers, Package, Image as ImageIcon } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Product = any;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products?limit=50`);
      const data = await res.json();
      setProducts(data.products || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(formData: any) {
    setMessage(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const b = await res.json();
        setMessage(`Error: ${b.error || "Create failed"}`);
        return;
      }

      setMessage("Product created successfully with quantity variants!");
      fetchProducts();
    } catch (err) {
      setMessage(String(err));
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#0B1B3D]">Product Inventory Management</h1>
            <p className="text-sm text-gray-500">Create products with multiple weight/quantity variants & prices.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border-2 border-gold/30 shadow-md">
            <h2 className="text-lg font-black text-[#0B1B3D] mb-4 flex items-center gap-2 border-b pb-3">
              <Package size={20} className="text-gold-dark" />
              <span>Create Product Item with Quantity Variants</span>
            </h2>
            <ProductForm onCreate={handleCreate} />
            {message && (
              <div className={`mt-4 p-3 rounded-xl text-xs font-bold ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                {message}
              </div>
            )}
          </div>

          {/* Catalog View Column */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-lg font-black text-[#0B1B3D] flex items-center gap-2">
              <Layers size={20} className="text-gold-dark" />
              <span>Existing Products ({products.length})</span>
            </h2>

            {loading ? (
              <div className="p-8 text-center text-gray-500 font-semibold">Loading catalog…</div>
            ) : (
              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id || p.slug} className="bg-white p-4 rounded-xl border border-gold/20 shadow-sm space-y-2 hover:border-gold transition">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-[#0B1B3D] text-base">{p.name}</h3>
                        <p className="text-xs text-gray-500">Slug: <span className="font-mono text-gray-700">{p.slug}</span> | Category: <span className="font-semibold text-gold-dark">{p.category?.name || p.categorySlug || p.category}</span></p>
                      </div>
                      {p.tag && p.tag !== 'none' && (
                        <span className="bg-[#0B1B3D] text-gold px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                          {p.tag}
                        </span>
                      )}
                    </div>

                    {/* Variants list */}
                    {p.variants && p.variants.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-[11px] font-bold text-gray-500 block mb-1">Quantity Variants & Stock Pricing:</span>
                        <div className="flex flex-wrap gap-2">
                          {p.variants.map((v: any, idx: number) => (
                            <div key={idx} className="bg-amber-50 border border-gold/30 px-2.5 py-1 rounded-lg text-xs space-x-1">
                              <span className="font-black text-[#0B1B3D]">{v.weightLabel || v.weight}:</span>
                              <span className="font-bold text-green-700">₹{v.discountedPrice || v.price}</span>
                              {v.discountedPrice && <span className="line-through text-gray-400 text-[10px]">₹{v.price}</span>}
                              <span className="text-[10px] text-gray-500 font-semibold">(Stock: {v.stockQty ?? v.stock})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function ProductForm({ onCreate }: { onCreate: (data: any) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("sweets");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("none");
  const [selectedPhotos, setSelectedPhotos] = useState<Array<{ name: string; preview: string }>>([]);
  
  // Multi-variant state (Weight Label, Price, Discounted Price, Stock Quantity, SKU)
  const [variants, setVariants] = useState<Array<{ weightLabel: string; price: string; discountedPrice: string; stockQty: string; sku: string }>>([
    { weightLabel: "250g", price: "450", discountedPrice: "399", stockQty: "50", sku: "SKU-250G" },
    { weightLabel: "500g", price: "850", discountedPrice: "799", stockQty: "40", sku: "SKU-500G" },
    { weightLabel: "1kg", price: "1600", discountedPrice: "1450", stockQty: "25", sku: "SKU-1KG" }
  ]);

  const [errors, setErrors] = useState<any>({});

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

    const previews = await Promise.all(
      Array.from(fileList).map(
        (file) =>
          new Promise<{ name: string; preview: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, preview: String(reader.result) });
            reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
            reader.readAsDataURL(file);
          })
      )
    );

    setSelectedPhotos((current) => [...current, ...previews]);
  }

  function removePhoto(index: number) {
    setSelectedPhotos((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: any = {};
    if (!name) newErrors.name = "Name is required.";
    if (!slug) newErrors.slug = "Slug is required.";
    if (!categorySlug) newErrors.categorySlug = "Category is required.";

    const parsedImageUrls = selectedPhotos.map((photo) => photo.preview).filter(Boolean);
    if (!parsedImageUrls.length) {
      // Fallback default image if no photos selected
      parsedImageUrls.push("/images/sweet-1.jpg");
    }

    // Validate variants
    const formattedVariants = variants.map((v, idx) => {
      const parsedPrice = Number(v.price);
      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        newErrors[`variant_price_${idx}`] = "Valid price required";
      }
      const parsedStock = Number(v.stockQty);
      if (Number.isNaN(parsedStock)) {
        newErrors[`variant_stock_${idx}`] = "Valid stock required";
      }
      return {
        weightLabel: v.weightLabel || "250g",
        price: parsedPrice || 100,
        discountedPrice: v.discountedPrice.trim() ? Number(v.discountedPrice) : undefined,
        stockQty: parsedStock || 10,
        sku: v.sku || `SKU-${idx + 1}`
      };
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreate({
      name,
      slug,
      description,
      categorySlug,
      tag,
      imageUrls: parsedImageUrls,
      variants: formattedVariants
    });

    // Reset Form
    setName("");
    setSlug("");
    setDescription("");
    setTag("none");
    setSelectedPhotos([]);
    setVariants([
      { weightLabel: "250g", price: "450", discountedPrice: "399", stockQty: "50", sku: "SKU-250G" }
    ]);
    setErrors({});
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-xs sm:text-sm">
      {/* Name & Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
            }}
            className={`w-full border px-3 py-2 rounded-xl focus:ring-2 focus:ring-gold outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g. Special Kaju Katli"
          />
          {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">URL Slug <span className="text-red-500">*</span></label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`w-full border px-3 py-2 rounded-xl focus:ring-2 focus:ring-gold outline-none ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g. special-kaju-katli"
          />
          {errors.slug && <p className="text-red-500 text-[10px] mt-0.5">{errors.slug}</p>}
        </div>
      </div>

      {/* Category & Tag */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-xl bg-white focus:ring-2 focus:ring-gold outline-none font-semibold text-gray-800"
          >
            <option value="sweets">Sweets (All)</option>
            <option value="kaju-sweets">Sweets ➔ Kaju Sweets</option>
            <option value="mawa-sweets">Sweets ➔ Mawa Sweets</option>
            <option value="penda">Sweets ➔ Penda</option>
            <option value="sugarless">Sweets ➔ Sugarless</option>
            <option value="premium-packed">Sweets ➔ Premium Packed</option>
            <option value="indian-ghee">Sweets ➔ Indian Ghee</option>
            <option value="namkeen">Namkeen (All)</option>
            <option value="millet">Namkeen ➔ Millet</option>
            <option value="farali">Namkeen ➔ Farali</option>
            <option value="gujarati">Namkeen ➔ Gujarati</option>
            <option value="khakhra">Namkeen ➔ Khakhra</option>
            <option value="roasted">Namkeen ➔ Roasted</option>
            <option value="mixture">Namkeen ➔ Mixture</option>
            <option value="sev">Namkeen ➔ Sev</option>
            <option value="chips-puris">Namkeen ➔ Chips & Puris</option>
            <option value="bakery">Bakery (All)</option>
            <option value="biscuits-cookies">Bakery ➔ Biscuits & Cookies</option>
            <option value="toast-khari">Bakery ➔ Toast & Khari</option>
            <option value="mukhwas">Mukhwas</option>
            <option value="dry-fruits-nuts">Dried Fruits & Nuts</option>
            <option value="premium-baklava">Premium Baklava</option>
            <option value="corporate-gift-boxes">Corporate Gift Boxes</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Product Tag / Badge</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-xl bg-white focus:ring-2 focus:ring-gold outline-none font-semibold text-gray-800"
          >
            <option value="none">None</option>
            <option value="best_seller">Best Seller 🔥</option>
            <option value="new_arrival">New Arrival ✨</option>
            <option value="premium">Premium 👑</option>
            <option value="combo">Combo Deal 🎁</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-xl focus:ring-2 focus:ring-gold outline-none"
          rows={2}
          placeholder="Describe ingredients, taste, purity, and shelf-life..."
        />
      </div>

      {/* Product Photos */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Product Photos</label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex cursor-pointer flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gold transition text-center">
            <ImageIcon size={18} className="text-gray-400 mb-1" />
            <span className="font-bold text-xs text-gray-700">Add Image Files</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void filesToPhotoPreviews(e.target.files)} />
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gold transition text-center">
            <ImageIcon size={18} className="text-gray-400 mb-1" />
            <span className="font-bold text-xs text-gray-700">Add Image Folder</span>
            <input type="file" accept="image/*" multiple className="hidden" {...({ webkitdirectory: "" } as any)} onChange={(e) => void filesToPhotoPreviews(e.target.files)} />
          </label>
        </div>

        {selectedPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedPhotos.map((photo, index) => (
              <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-300 group">
                <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-0 right-0 bg-red-600 text-white p-0.5 text-[9px] font-bold rounded-bl"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Quantity / Weight Variants Section */}
      <div className="border-2 border-gold/40 rounded-2xl p-4 bg-amber-50/50 space-y-3">
        <div className="flex items-center justify-between border-b border-gold/30 pb-2">
          <div>
            <h3 className="font-black text-[#0B1B3D] text-sm">Quantity & Weight Variants</h3>
            <p className="text-[11px] text-gray-600">Add different pack sizes (e.g. 250g, 500g, 1kg) with individual prices & stock levels.</p>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="bg-[#0B1B3D] text-gold hover:bg-[#162C5B] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm border border-gold/30"
          >
            <Plus size={14} />
            <span>Add Variant</span>
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div key={idx} className="bg-white p-3 rounded-xl border border-gold/30 shadow-sm space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0B1B3D]">Variant #{idx + 1}</span>
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
                  <input
                    value={v.weightLabel}
                    onChange={(e) => handleVariantChange(idx, "weightLabel", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 rounded-lg text-xs font-semibold"
                    placeholder="e.g. 250g"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Regular Price (₹)</label>
                  <input
                    type="number"
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 rounded-lg text-xs font-semibold"
                    placeholder="450"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={v.discountedPrice}
                    onChange={(e) => handleVariantChange(idx, "discountedPrice", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 rounded-lg text-xs font-semibold"
                    placeholder="399"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Stock Qty</label>
                  <input
                    type="number"
                    value={v.stockQty}
                    onChange={(e) => handleVariantChange(idx, "stockQty", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 rounded-lg text-xs font-semibold"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">SKU Code</label>
                  <input
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 rounded-lg text-xs font-mono"
                    placeholder="SKU-250G"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-[#0B1B3D] text-gold hover:bg-[#162C5B] py-3 rounded-xl font-extrabold text-sm shadow-md transition border border-gold/40 flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        <span>Create Product Item with Variants</span>
      </button>
    </form>
  );
}

