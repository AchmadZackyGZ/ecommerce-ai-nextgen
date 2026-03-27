import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { apiClient } from "~/services/apiClient";
import {
  ShoppingCart,
  User,
  Search,
  Package,
  Ticket,
  Settings,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuthStore } from "~/store/authStore";

export default function TopNavbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // 🧠 STATE UNTUK BUG FIXES
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State khusus untuk tap di Mobile
  const [cartCount, setCartCount] = useState(0); // state untuk cart count

  // Fungsi menembak API untuk menghitung total kuantitas
  const fetchCartCount = async () => {
    try {
      const response = await apiClient.get("/cart");
      const items = response.data.data.items || [];
      const total = items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0,
      );
      setCartCount(total);
    } catch (error) {
      console.error("Gagal menarik data item dari keranjang:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount(); // panggil function cartCount saat pertama kali dimuat halaman

    const handleCartUpdate = (e: any) => {
      if (e.detail && e.detail.addedQuantity) {
        // Jika ada sinyal masuk, langsung tambah angkanya secara instan (0 detik!)
        setCartCount((prev) => prev + e.detail.addedQuantity);
      } else {
        // Fallback untuk aksi lain (misal dari keranjang)
        fetchCartCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate); // tambahkan event listener
    return () => window.removeEventListener("cartUpdated", handleCartUpdate); // hapus event listener
  }, [user]);

  // Fungsi cerdas pembuat Inisial (Misal: "Achmad Ghoutsu" -> "AG", "Budi" -> "BU")
  const getInitial = (name: string) => {
    if (!name) return "NX"; // fallback jika name kosong
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Fungsi Eksekusi Pencarian (Melempar query ke halaman Katalog)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      // Kita akan melempar query ke URL (contoh: /katalog?q=Sony)
      navigate(`/katalog?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileSearchOpen(false); // Tutup search mobile jika sedang terbuka
      setSearchQuery(""); // Bersihkan input setelah search
    }
  };

  return (
    <>
      <nav className="fixed left-0 top-0 z-[60] w-full border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          {/* KIRI: Logo Nexia */}
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <span className="text-xl font-black text-white">N</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white hidden sm:block">
              Nexia
            </span>
          </Link>

          {/* TENGAH: Search Bar (Desktop) - 🛠️ FIX BUG 1: Dibungkus Form */}
          <div className="hidden flex-1 px-8 lg:block max-w-2xl">
            <form onSubmit={handleSearch} className="relative group">
              <button
                type="submit"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-hover:text-cyan-400"
              >
                <Search size={18} />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk teknologi masa depan (Contoh: Sony)..."
                className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-black/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </form>
          </div>

          {/* KANAN: Aksi Navigasi */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Tombol Pencarian (Mobile Only) - 🛠️ FIX BUG 2: Toggle State */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
              {isMobileSearchOpen ? (
                <X size={20} className="text-cyan-400" />
              ) : (
                <Search size={20} />
              )}
            </button>

            {/* Tombol Keranjang */}
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* 🔥 THE GLASSMORPHISM PROFILE DROPDOWN - 🛠️ FIX BUG 3: Tambah onClick */}
            <div className="relative group">
              {/* Tombol Trigger Profile */}
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)} // Aktifkan di Mobile
                onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)} // Tutup saat klik di luar
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${isProfileOpen ? "border-cyan-500 text-cyan-400 bg-cyan-500/10" : "border-white/10 bg-zinc-900 text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-400"}`}
              >
                <User size={20} />
              </button>

              {/* Panel Dropdown: Kombinasi state isProfileOpen (Mobile) & group-hover (Desktop) */}
              <div
                className={`absolute right-0 top-full pt-2 transition-all duration-300 ${isProfileOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2 lg:group-hover:opacity-100 lg:group-hover:visible lg:group-hover:translate-y-0"}`}
              >
                <div className="w-72 rounded-[2rem] border border-white/10 bg-zinc-900/90 p-3 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                  {/* Header Profil Singkat */}
                  <div className="flex items-center gap-4 border-b border-white/10 p-3 pb-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 font-black text-white shadow-lg text-lg">
                      {user ? getInitial(user.name) : "NX"}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-white leading-tight">
                        {user ? user.name : "Guest"}
                      </h3>
                      <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-cyan-400">
                        <ShieldCheck size={14} /> {user?.role || "Member"}
                      </span>
                    </div>
                  </div>

                  {/* Menu Interaktif */}
                  <div className="flex flex-col gap-1 pt-3">
                    <Link
                      onClick={() => setIsProfileOpen(false)}
                      to="/pesanan"
                      className="group/item flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-cyan-400 transition-all hover:bg-cyan-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <Package size={18} /> Pesanan Saya
                      </div>
                      <ChevronRight
                        size={16}
                        className="transition-transform group-hover/item:translate-x-1"
                      />
                    </Link>
                    <Link
                      onClick={() => setIsProfileOpen(false)}
                      to="/voucher"
                      className="group/item flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex items-center gap-3">
                        <Ticket size={18} /> Dompet Voucher
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-zinc-500 transition-transform group-hover/item:translate-x-1 group-hover/item:text-white"
                      />
                    </Link>
                    <Link
                      onClick={() => setIsProfileOpen(false)}
                      to="/pengaturan"
                      className="group/item flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex items-center gap-3">
                        <Settings size={18} /> Pengaturan Akun
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-zinc-500 transition-transform group-hover/item:translate-x-1 group-hover/item:text-white"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 🚀 EXTENSION FIX BUG 2: PANEL SEARCH MOBILE MELUNCUR DARI ATAS */}
      <div
        className={`fixed top-20 left-0 w-full z-[55] bg-black/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300 lg:hidden ${isMobileSearchOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}
      >
        <div className="p-4">
          <form onSubmit={handleSearch} className="relative">
            <button
              type="submit"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
            >
              <Search size={18} />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk (Cth: Sony)..."
              className="w-full rounded-2xl border border-cyan-500/30 bg-zinc-900/80 py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </form>
        </div>
      </div>
    </>
  );
}
