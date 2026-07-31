"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { Store, MapPin, Phone, Search, Navigation, Compass, CheckCircle, ChevronRight, RefreshCw, Clock } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface PhysicalOutlet {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  latitude?: number | null;
  longitude?: number | null;
  hours?: string;
}

const defaultOutlets: PhysicalOutlet[] = [
  {
    id: "store-surat-1",
    name: "Vardayini Sweet Mart - Main Outlet",
    address: "123 Ring Road, Near Textile Market",
    city: "Surat",
    pincode: "395002",
    phone: "+91 98765 43210",
    latitude: 21.1702,
    longitude: 72.8311,
    hours: "8:00 AM - 10:00 PM",
  },
  {
    id: "store-surat-2",
    name: "Vardayini Sweet Mart - Station Road",
    address: "45 Station Road, Opposite Railway Station",
    city: "Surat",
    pincode: "395003",
    phone: "+91 98765 43211",
    latitude: 21.2049,
    longitude: 72.8406,
    hours: "7:30 AM - 10:30 PM",
  },
  {
    id: "store-ahmedabad-1",
    name: "Vardayini Sweet Mart - Navrangpura",
    address: "78 CG Road, Navrangpura",
    city: "Ahmedabad",
    pincode: "380009",
    phone: "+91 98765 43212",
    latitude: 23.0366,
    longitude: 72.5612,
    hours: "9:00 AM - 9:30 PM",
  },
  {
    id: "store-vadodara-1",
    name: "Vardayini Sweet Mart - Alkapuri",
    address: "12 Alkapuri Main Road",
    city: "Vadodara",
    pincode: "390007",
    phone: "+91 98765 43213",
    latitude: 22.3107,
    longitude: 73.1685,
    hours: "8:30 AM - 10:00 PM",
  },
  {
    id: "store-delhi-1",
    name: "Vardayini Sweet Mart - Old Delhi Branch",
    address: "123 Chawri Bazar Rd, Old Delhi",
    city: "Delhi",
    pincode: "110006",
    phone: "+91 98765 43214",
    latitude: 28.6500,
    longitude: 77.2300,
    hours: "8:00 AM - 9:00 PM",
  },
];

export default function StoresPage() {
  const [cityInput, setCityInput] = useState("");
  const [pincodeInput, setPincodeInput] = useState("");
  const [outlets, setOutlets] = useState<PhysicalOutlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<PhysicalOutlet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutlets("", "");
  }, []);

  async function fetchOutlets(cityParam: string, pincodeParam: string) {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (cityParam) query.set("city", cityParam);
      if (pincodeParam) query.set("pincode", pincodeParam);

      const res = await fetch(`${API_BASE}/stores?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOutlets(data);
          setSelectedOutlet(data[0]);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend stores API offline, using local store data.");
    }

    // Fallback search over local outlets
    let filtered = defaultOutlets;
    if (cityParam.trim()) {
      const q = cityParam.toLowerCase().trim();
      filtered = filtered.filter(
        (o) => o.city.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || o.address.toLowerCase().includes(q)
      );
    }
    if (pincodeParam.trim()) {
      filtered = filtered.filter((o) => o.pincode.includes(pincodeParam.trim()));
    }

    setOutlets(filtered);
    setSelectedOutlet(filtered[0] || null);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchOutlets(cityInput, pincodeInput);
  }

  function handleCityPillClick(city: string) {
    const targetCity = city === "All" ? "" : city;
    setCityInput(targetCity);
    setPincodeInput("");
    fetchOutlets(targetCity, "");
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Header />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gold/20 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 max-w-7xl mx-auto">
          <Link href="/" className="hover:text-gold-dark transition font-medium">Home</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-bold text-[#0B1B3D]">Store Locator</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-6 sm:p-8 text-white shadow-xl border-2 border-gold/30">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider border border-gold/40">
              <Compass size={14} />
              <span>Physical Outlets & Branch Locator</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Find Vardayini Sweet Mart Near You</h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Locate our authentic sweet shop branches for fresh in-store shopping, pickup, and festive gift boxes.
            </p>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl p-6 border border-gold/20 shadow-sm space-y-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search City */}
            <div className="sm:col-span-5 relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-dark" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Search by City (e.g. Surat, Ahmedabad)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-gold"
              />
            </div>

            {/* Search Pincode */}
            <div className="sm:col-span-4 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-dark" />
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Pincode (e.g. 395002)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-gold"
              />
            </div>

            {/* Search Button */}
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full bg-[#0B1B3D] text-gold hover:bg-[#162C5B] font-bold py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-gold/30 shadow"
              >
                <Search size={16} />
                Find Stores
              </button>
            </div>
          </form>

          {/* Quick City Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 scrollbar-none">
            <span className="text-xs font-bold text-gray-500 flex-shrink-0">Popular Cities:</span>
            {["All", "Surat", "Ahmedabad", "Vadodara", "Delhi"].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCityPillClick(city)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                  (city === "All" && !cityInput) || cityInput.toLowerCase() === city.toLowerCase()
                    ? "bg-gold text-[#0B1B3D] font-extrabold shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gold/20 hover:text-gold-dark"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid: Searchable Outlets List + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Outlets List (5 Columns) */}
          <div className="lg:col-span-5 space-y-4 max-h-[600px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-[#0B1B3D] uppercase tracking-wider">
                Outlets Found ({outlets.length})
              </span>
              {loading && <RefreshCw size={14} className="animate-spin text-gold-dark" />}
            </div>

            {outlets.length > 0 ? (
              outlets.map((outlet) => {
                const isSelected = selectedOutlet?.id === outlet.id;
                return (
                  <div
                    key={outlet.id}
                    onClick={() => setSelectedOutlet(outlet)}
                    className={`cursor-pointer rounded-2xl p-5 border transition space-y-3 ${
                      isSelected
                        ? "bg-white border-2 border-gold shadow-md"
                        : "bg-white/80 border-gray-200 hover:border-gold/50 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-gold flex items-center justify-center font-bold text-xs flex-shrink-0 border border-gold/30">
                          <Store size={16} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-[#0B1B3D] text-sm leading-tight">{outlet.name}</h3>
                          <span className="text-[10px] text-gold-dark font-bold">
                            {outlet.city} • PIN {outlet.pincode}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="bg-gold text-[#0B1B3D] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={10} /> Active Pin
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 pl-1">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gold-dark flex-shrink-0 mt-0.5" />
                        <span>{outlet.address}, {outlet.city} - {outlet.pincode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gold-dark flex-shrink-0" />
                        <span className="font-semibold text-gray-800">{outlet.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gold-dark flex-shrink-0" />
                        <span>Hours: {outlet.hours || "8:00 AM - 10:00 PM"}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-[11px]">
                      <span className="text-green-700 font-bold">✓ Fresh Sweets & In-Store Pickup</span>
                      <span className="text-gold-dark font-bold hover:underline flex items-center gap-1">
                        Map View →
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
                <Store size={32} className="mx-auto text-gray-400 mb-2" />
                <h3 className="text-sm font-bold text-[#0B1B3D]">No outlets found</h3>
                <p className="text-xs text-gray-500 mt-1">Try searching for "Surat", "Ahmedabad", or "Vadodara".</p>
              </div>
            )}
          </div>

          {/* Interactive Visual Map View (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border-2 border-gold/30 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider block">Interactive Location</span>
                <h3 className="text-lg font-extrabold text-[#0B1B3D]">
                  {selectedOutlet ? selectedOutlet.name : "Select an Outlet"}
                </h3>
              </div>

              {selectedOutlet?.latitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedOutlet.latitude},${selectedOutlet.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gold text-[#0B1B3D] hover:bg-gold-dark px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Navigation size={14} />
                  Get Directions
                </a>
              )}
            </div>

            {/* Visual Map Graphic Box */}
            <div className="relative w-full h-80 rounded-2xl bg-gradient-to-br from-[#0B1B3D] to-[#162C5B] overflow-hidden flex items-center justify-center text-white border border-gold/20 shadow-inner">
              {/* Decorative map grid lines */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>

              {selectedOutlet ? (
                <div className="relative z-10 text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold text-gold flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">{selectedOutlet.name}</h4>
                    <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">{selectedOutlet.address}, {selectedOutlet.city} - {selectedOutlet.pincode}</p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-gold text-xs font-bold border border-gold/30">
                    <Compass size={13} />
                    <span>Coordinates: {selectedOutlet.latitude || 21.1702}° N, {selectedOutlet.longitude || 72.8311}° E</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <MapPin size={36} className="mx-auto text-gold opacity-60" />
                  <p className="text-sm font-semibold text-gray-300">Select an outlet from the left list to view on map</p>
                </div>
              )}
            </div>

            {/* Selected Outlet Quick Specs */}
            {selectedOutlet && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Phone Support</span>
                  <span className="text-xs font-extrabold text-[#0B1B3D]">{selectedOutlet.phone}</span>
                </div>
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Store Hours</span>
                  <span className="text-xs font-extrabold text-[#0B1B3D]">{selectedOutlet.hours || "8:00 AM - 10:00 PM"}</span>
                </div>
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">City & Pincode</span>
                  <span className="text-xs font-extrabold text-[#0B1B3D]">{selectedOutlet.city} ({selectedOutlet.pincode})</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
