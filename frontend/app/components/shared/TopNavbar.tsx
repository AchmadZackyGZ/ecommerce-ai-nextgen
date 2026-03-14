import { Link, useNavigate } from "react-router";
import {
  ShoppingCart,
  User,
  Search,
  Package,
  Ticket,
  Settings,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "~/store/cartStore";

export default function TopNavbar() {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);

  // Kalkulasi total item di keranjang
  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-md">
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

        {/* TENGAH: Search Bar (Desktop) */}
        <div className="hidden flex-1 px-8 lg:block max-w-2xl">
          <div className="relative group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-hover:text-cyan-400"
            />
            <input
              type="text"
              placeholder="Cari produk teknologi masa depan..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-black/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        {/* KANAN: Aksi Navigasi */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Tombol Pencarian (Mobile Only) */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden">
            <Search size={20} />
          </button>

          {/* Tombol Keranjang */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <ShoppingCart size={22} />
            {totalCartItems > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-in zoom-in">
                {totalCartItems}
              </span>
            )}
          </Link>

          {/* 🔥 THE GLASSMORPHISM PROFILE DROPDOWN */}
          <div className="relative group">
            {/* Tombol Trigger (Ikon Profil) */}
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400 transition-all hover:border-cyan-500/50 hover:text-cyan-400">
              <User size={20} />
            </button>

            {/* Panel Dropdown (Tersembunyi, muncul saat hover) */}
            <div className="absolute right-0 top-full pt-2 opacity-0 invisible translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
              <div className="w-72 rounded-[2rem] border border-white/10 bg-zinc-900/90 p-3 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                {/* Header Profil Singkat */}
                <div className="flex items-center gap-4 border-b border-white/10 p-3 pb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 font-black text-white shadow-lg text-lg">
                    AZ
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-white leading-tight">
                      Achmad Zacky
                    </h3>
                    <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-cyan-400">
                      <ShieldCheck size={14} /> Nexia Elite Member
                    </span>
                  </div>
                </div>

                {/* Menu Interaktif */}
                <div className="flex flex-col gap-1 pt-3">
                  <Link
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
          {/* End of Dropdown */}
        </div>
      </div>
    </nav>
  );
}
