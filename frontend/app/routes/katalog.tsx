import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, SlidersHorizontal, ChevronDown, Star, X } from "lucide-react";
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta("Katalog Produk", "Jelajahi teknologi masa depan di Nexia.");

// 📦 DATA DUMMY (Cakupannya harus luas untuk tes filter)
const DUMMY_PRODUCTS = [
  {
    id: 901,
    name: "Sony WH-1000XM5 Noise Cancelling",
    category: "Audio",
    price: 5500000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400",
    dateAdded: "2026-03-10",
  },
  {
    id: 902,
    name: "iPhone 15 Pro Max Titanium",
    category: "Smartphone",
    price: 25000000,
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=400",
    dateAdded: "2026-01-15",
  },
  {
    id: 903,
    name: "Laptop Gaming AI NextGen",
    category: "Laptop",
    price: 35000000,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=400",
    dateAdded: "2026-02-20",
  },
  {
    id: 904,
    name: "DJI Mini 4 Pro Drone",
    category: "Camera",
    price: 12500000,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=400",
    dateAdded: "2025-11-05",
  },
  {
    id: 905,
    name: "Oculus Quest 3 VR Headset",
    category: "Gaming",
    price: 8500000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=400",
    dateAdded: "2026-03-01",
  },
  {
    id: 906,
    name: "Samsung Galaxy S24 Ultra",
    category: "Smartphone",
    price: 21999000,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1610945265064-32010b1e15fa?q=80&w=400",
    dateAdded: "2026-02-10",
  },
  {
    id: 907,
    name: "Keychron Q1 Pro Mechanical",
    category: "Accessories",
    price: 2850000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400",
    dateAdded: "2025-12-15",
  },
  {
    id: 908,
    name: "Apple AirPods Pro Gen 2",
    category: "Audio",
    price: 3999000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1606220588913-b3eea414115f?q=80&w=400",
    dateAdded: "2026-01-20",
  },
];

const CATEGORIES = [
  "Semua Produk",
  "Smartphone",
  "Laptop",
  "Audio",
  "Accessories",
  "Camera",
  "Wearables",
  "Gaming",
];

export default function KatalogPage() {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || ""; // Tangkap query dari TopNavbar

  // 🧠 THE STATE ENGINE
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState("Semua Produk");
  const [maxPrice, setMaxPrice] = useState<number>(50000000);
  const [sortBy, setSortBy] = useState("relevan");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sinkronisasi local search state jika URL parameter berubah
  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  // 🧠 LOGIKA FILTER & SORTING (Dijalankan setiap ada perubahan state)
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...DUMMY_PRODUCTS];

    // 1. FILTER PENCARIAN KEYWORD (Bug Fix 1)
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.category.toLowerCase().includes(lowerQuery),
      );
    }

    // 2. FILTER KATEGORI (Bug Fix 2)
    if (selectedCategory !== "Semua Produk") {
      result = result.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // 3. FILTER RENTANG HARGA (Bug Fix 3)
    result = result.filter((product) => product.price <= maxPrice);

    // 4. LOGIKA SORTING (Bug Fix 4)
    switch (sortBy) {
      case "harga_rendah":
        result.sort((a, b) => a.price - b.price);
        break;
      case "harga_tinggi":
        result.sort((a, b) => b.price - a.price);
        break;
      case "terbaru":
        result.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        );
        break;
      case "relevan":
      default:
        // Biarkan default berdasarkan urutan data
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, maxPrice, sortBy]);

  // Handler untuk mereset filter
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Semua Produk");
    setMaxPrice(50000000);
    setSortBy("relevan");
  };

  return (
    <main className="min-h-screen pb-32 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {/* HEADER KATALOG */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
            Katalog{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Premium
            </span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Temukan produk teknologi masa depan incaran Anda.
          </p>
        </div>

        {/* TOMBOL FILTER MOBILE */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 py-3.5 text-sm font-bold text-white lg:hidden"
        >
          <SlidersHorizontal size={18} className="text-cyan-400" /> Filter &
          Urutkan
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 🎛️ SIDEBAR FILTER (Desktop & Drawer Mobile) */}
          <aside
            className={`fixed inset-y-0 left-0 z-[70] w-[280px] transform bg-zinc-950 p-6 transition-transform duration-300 overflow-y-auto lg:static lg:z-auto lg:w-1/4 lg:translate-x-0 lg:bg-transparent lg:p-0 ${isMobileFilterOpen ? "translate-x-0 border-r border-white/10" : "-translate-x-full"}`}
          >
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="text-lg font-bold text-white">Filter</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-zinc-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-8 rounded-3xl border-0 lg:border lg:border-white/10 lg:bg-zinc-900/30 lg:p-6 backdrop-blur-xl">
              {/* Filter: Search Spesifik */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Pencarian Spesifik
                </span>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari di katalog..."
                    className="w-full rounded-xl border border-white/5 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Filter: Kategori */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  Kategori
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all text-left ${selectedCategory === cat ? "bg-white/10 text-white font-bold border border-white/10" : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
                  >
                    {cat}
                    {selectedCategory === cat && (
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Filter: Rentang Harga (BUG FIXED: Nampak Angka Dinamis!) */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Rentang Harga
                </span>

                {/* Visualisasi Angka Dinamis */}
                <div className="flex flex-col gap-1 text-center bg-black/40 rounded-xl py-3 border border-white/5">
                  <span className="text-xs text-zinc-500">Maksimal Harga:</span>
                  <span className="text-base font-black text-cyan-400 transition-all">
                    Rp {maxPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="50000000"
                  step="500000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer outline-none 
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.8)]
                      [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                />
                <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span>Rp 0</span>
                  <span>Rp 50 Jt+</span>
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20"
              >
                Reset Filter
              </button>
            </div>
          </aside>

          {/* Overlay Background untuk Mobile Filter */}
          {isMobileFilterOpen && (
            <div
              className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            ></div>
          )}

          {/* 🛒 AREA KANAN: GRID PRODUK */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Top Bar: Info & Sorting (BUG FIXED: Multiple Sort Options!) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/30 px-6 py-4 backdrop-blur-xl">
              <span className="text-sm font-medium text-zinc-400">
                Menampilkan{" "}
                <strong className="text-white">
                  {filteredAndSortedProducts.length}
                </strong>{" "}
                produk{" "}
                {searchQuery
                  ? `untuk "${searchQuery}"`
                  : selectedCategory !== "Semua Produk"
                    ? `untuk "${selectedCategory}"`
                    : ""}
              </span>

              <div className="flex items-center gap-3 relative group">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Urutkan
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white font-bold outline-none focus:border-cyan-500 pr-10 cursor-pointer"
                >
                  <option value="relevan">Paling Relevan</option>
                  <option value="terbaru">Terbaru Diunggah</option>
                  <option value="harga_rendah">Harga Terendah</option>
                  <option value="harga_tinggi">Harga Tertinggi</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Product Grid */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-white/5 bg-zinc-900/20">
                <Search size={48} className="text-zinc-700 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Produk tidak ditemukan
                </h3>
                <p className="text-zinc-500 text-sm text-center max-w-sm">
                  Coba gunakan kata kunci lain, atau sesuaikan filter rentang
                  harga dan kategori Anda.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {filteredAndSortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group flex flex-col rounded-3xl border border-white/5 bg-zinc-900/30 p-4 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/5 hover:shadow-2xl"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-800 mb-4">
                      <div className="absolute top-3 left-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                        {product.category}
                      </div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col flex-1 px-2">
                      <h3 className="text-base font-bold text-white line-clamp-2 mb-2 group-hover:text-cyan-400 transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
                          <Star
                            size={12}
                            className="fill-yellow-500 text-yellow-500"
                          />{" "}
                          {product.rating}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {filteredAndSortedProducts.length > 0 && (
              <div className="mt-10 flex justify-center">
                <button className="rounded-full border border-cyan-500/30 bg-cyan-900/20 px-8 py-3 text-sm font-bold text-cyan-400 transition-colors hover:bg-cyan-500 hover:text-white">
                  Muat Lebih Banyak Produk
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
