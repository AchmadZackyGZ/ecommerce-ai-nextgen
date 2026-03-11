import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard, {
  type ProductProps,
} from "~/components/ecommerce/ProductCard";
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta(
    "Katalog Produk",
    "Jelajahi seluruh koleksi teknologi premium Nexia.",
  );

// Data Dummy Katalog Sempurna
const DUMMY_CATALOG: ProductProps[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max Titanium",
    price: 25000000,
    category: "Smartphone",
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800",
  },
  {
    id: 2,
    name: "Laptop Gaming AI NextGen",
    price: 35000000,
    category: "Laptop",
    imageUrl:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5 Noise Cancelling",
    price: 5500000,
    category: "Audio",
    imageUrl:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800",
  },
  {
    id: 4,
    name: "Mechanical Keyboard Keychron",
    price: 2100000,
    category: "Accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800",
  },
  {
    id: 5,
    name: "Samsung Galaxy S24 Ultra",
    price: 21999000,
    category: "Smartphone",
    imageUrl:
      "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=800",
  },
  {
    id: 6,
    name: "MacBook Pro M3 Max",
    price: 65000000,
    category: "Laptop",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800",
  },
  {
    id: 7,
    name: "DJI Mini 4 Pro",
    price: 12500000,
    category: "Camera",
    imageUrl:
      "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=800",
  },
  {
    id: 8,
    name: "Oculus Quest 3 VR",
    price: 8500000,
    category: "Gaming",
    imageUrl:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800",
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

export default function Katalog() {
  // State untuk simulasi interaktivitas UI
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Produk");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <main className="min-h-screen pb-32 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {/* Header Title Kosmik */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black text-white md:text-5xl tracking-tight">
              Katalog{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Premium
              </span>
            </h1>
            <p className="mt-2 text-zinc-400 font-medium">
              Temukan produk teknologi masa depan incaran Anda.
            </p>
          </div>

          {/* Tombol Buka Filter (Hanya muncul di HP) */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-bold text-white border border-white/10 lg:hidden hover:bg-zinc-800 transition-colors active:scale-95"
          >
            <SlidersHorizontal size={18} className="text-cyan-400" />
            Filter & Urutkan
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 🛡️ ZONA KIRI: THE COMMAND FILTER (Panel Sidebar) */}
          <div
            className={`lg:block ${isMobileFilterOpen ? "block" : "hidden"}`}
          >
            <div className="sticky top-28 flex flex-col gap-8 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-2xl shadow-2xl">
              {/* Search Bar Spesifik */}
              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Pencarian Spesifik
                </label>
                <div className="relative group">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-hover:text-cyan-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari di katalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              {/* List Kategori */}
              <div>
                <label className="mb-4 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Kategori
                </label>
                <div className="flex flex-col gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-300 border border-cyan-500/30 shadow-inner"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      {cat}
                      {selectedCategory === cat && (
                        <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Rentang Harga */}
              <div>
                <label className="mb-4 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Rentang Harga
                </label>
                <input
                  type="range"
                  className="w-full accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  min="0"
                  max="100"
                />
                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-zinc-500">
                  <span>Rp 0</span>
                  <span>Rp 100 Jt+</span>
                </div>
              </div>

              {/* Tombol Reset */}
              <button className="w-full rounded-2xl bg-red-500/10 py-3.5 text-sm font-bold text-red-500 transition-all hover:bg-red-500/20 active:scale-95 border border-red-500/20">
                Reset Filter
              </button>
            </div>
          </div>

          {/* 🍱 ZONA KANAN: THE PRODUCT MATRIX (Grid Hasil) */}
          <div className="lg:col-span-3">
            {/* Top Action Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-zinc-900/30 p-4 backdrop-blur-md">
              <span className="text-sm font-medium text-zinc-400">
                Menampilkan <strong className="text-white">8</strong> produk
                untuk "{selectedCategory}"
              </span>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-xs">
                  Urutkan
                </span>
                <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10">
                  Paling Relevan{" "}
                  <ChevronDown size={16} className="text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Grid Produk */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6 animate-in fade-in duration-700">
              {DUMMY_CATALOG.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Tombol Load More */}
            <div className="mt-12 flex justify-center">
              <button className="group flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-8 py-4 text-sm font-bold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                Muat Lebih Banyak Produk
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
