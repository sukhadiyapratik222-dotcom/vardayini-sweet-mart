"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";

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
        setMessage(b.error || "Create failed");
        return;
      }

      setMessage("Product created");
      fetchProducts();
    } catch (err) {
      setMessage(String(err));
    }
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id || p.slug} className="bg-white p-4 rounded shadow">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-600">{p.slug}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Create product</h2>
          <ProductForm onCreate={handleCreate} />
          {message && <div className="mt-3 text-sm text-green-700">{message}</div>}
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
  const [selectedPhotos, setSelectedPhotos] = useState<Array<{ name: string; preview: string }>>([]);
  const [weightLabel, setWeightLabel] = useState("250g");
  const [price, setPrice] = useState("100");
  const [discountedPrice, setDiscountedPrice] = useState("90");
  const [quantity, setQuantity] = useState("10");
  const [sku, setSku] = useState("SKU-1");
  const [errors, setErrors] = useState<any>({});

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
    if (!categorySlug) newErrors.categorySlug = "Category slug is required.";
    
    const parsedImageUrls = selectedPhotos.map((photo) => photo.preview).filter(Boolean);
    if (!parsedImageUrls.length) {
      newErrors.photos = "Choose at least one product photo.";
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice)) {
      newErrors.price = "Price must be a valid number.";
    }
    
    const parsedQuantity = Number(quantity);
    if (Number.isNaN(parsedQuantity)) {
      newErrors.quantity = "Quantity must be a valid number.";
    }
    
    const parsedDiscountedPrice = discountedPrice.trim() ? Number(discountedPrice) : undefined;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreate({
      name,
      slug,
      description,
      categorySlug,
      imageUrls: parsedImageUrls,
      variants: [
        {
          weightLabel,
          price: parsedPrice,
          discountedPrice: parsedDiscountedPrice,
          stockQty: parsedQuantity,
          sku,
        },
      ],
    });
    
    // Clear form
    setName("");
    setSlug("");
    setDescription("");
    setSelectedPhotos([]);
    setWeightLabel("250g");
    setPrice("100");
    setDiscountedPrice("90");
    setQuantity("10");
    setSku("SKU-1");
    setErrors({});
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
      <div>
        <label className="block text-sm">Name <span className="text-red-500">*</span></label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full border px-2 py-1 rounded ${errors.name ? 'border-red-500' : ''}`} placeholder="e.g. Gulab Jamun" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm">Slug <span className="text-red-500">*</span></label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={`w-full border px-2 py-1 rounded ${errors.slug ? 'border-red-500' : ''}`} placeholder="e.g. gulab-jamun" />
        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className={`w-full border px-2.5 py-1.5 rounded-lg text-sm bg-white ${errors.categorySlug ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="sweets">Sweets (sweets)</option>
          <option value="kaju">Kaju Sweets (kaju)</option>
          <option value="mawa">Mawa Sweets (mawa)</option>
          <option value="penda">Penda (penda)</option>
          <option value="premium-packed">Premium Packed (premium-packed)</option>
          <option value="sugarless">Sugarless Sweets (sugarless)</option>
          <option value="ghee-sweets">Ghee Sweets (ghee-sweets)</option>
          <option value="festival-sweets">Festival Sweets (festival-sweets)</option>
          <option value="namkeen">Namkeen (namkeen)</option>
          <option value="gujarati">Gujarati Namkeen (gujarati)</option>
          <option value="khakhra">Khakhra (khakhra)</option>
          <option value="bakery">Bakery (bakery)</option>
          <option value="mukhwas">Mukhwas (mukhwas)</option>
          <option value="dry-fruits-nuts">Dry Fruits & Nuts (dry-fruits-nuts)</option>
          <option value="premium-baklava">Baklava (premium-baklava)</option>
          <option value="corporate-gift-boxes">Gift Boxes (corporate-gift-boxes)</option>
        </select>
        {errors.categorySlug && <p className="text-red-500 text-xs mt-1">{errors.categorySlug}</p>}
      </div>
      <div>
        <label className="block text-sm">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-2 py-1 rounded" rows={3} />
      </div>
      <div>
        <label className="block text-sm">Product Photos <span className="text-red-500">*</span></label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className={`flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed bg-gray-50 p-3 text-sm text-gray-700 hover:border-maroon ${errors.photos ? 'border-red-500' : 'border-gray-300'}`}>
            <span className="font-medium text-gray-900">Choose files</span>
            <span className="text-xs text-gray-500">Select one or more image files from your device.</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void filesToPhotoPreviews(e.target.files)} />
          </label>

          <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 hover:border-maroon">
            <span className="font-medium text-gray-900">Choose folder</span>
            <span className="text-xs text-gray-500">Pick a folder to add every image inside it.</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              webkitdirectory="true"
              onChange={(e) => void filesToPhotoPreviews(e.target.files)}
            />
          </label>
        </div>
        {errors.photos && <p className="text-red-500 text-xs mt-1">{errors.photos}</p>}

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {selectedPhotos.map((photo, index) => (
            <div key={`${photo.name}-${index}`} className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{photo.name}</p>
                  <p className="text-xs text-gray-500">Selected photo</p>
                </div>
                <button type="button" onClick={() => removePhoto(index)} className="text-xs font-semibold text-maroon hover:underline">
                  Remove
                </button>
              </div>
              <img src={photo.preview} alt={photo.name} className="mt-3 h-28 w-full rounded-lg object-cover" />
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-gray-500">You can add photos with files or a whole folder. The selected images are sent with the product as upload-ready data URLs.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Weight</label>
          <input value={weightLabel} onChange={(e) => setWeightLabel(e.target.value)} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm">SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full border px-2 py-1 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Price <span className="text-red-500">*</span></label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={`w-full border px-2 py-1 rounded ${errors.price ? 'border-red-500' : ''}`} />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm">Quantity <span className="text-red-500">*</span></label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={`w-full border px-2 py-1 rounded ${errors.quantity ? 'border-red-500' : ''}`} />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm">Discounted Price</label>
        <input type="number" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <button className="bg-maroon text-cream px-3 py-2 rounded">Create</button>
      </div>
    </form>
  );
}
