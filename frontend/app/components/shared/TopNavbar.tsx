import { Link } from "react-router";
import { Search, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "~/store/cartStore";

export default function TopNavbar() {
  const toggleCart = useCartStore((state) => state.toggleCart);
  const cartItems = useCartStore((state) => state.items);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 md:px-8">
        {/* KIRI: Logo Nexia Menyamping */}
        <Link
          to="/"
          className="flex items-center gap-3 transition-transform hover:scale-105"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <span className="text-xl font-black text-white">N</span>
          </div>
          <span className="text-2xl font-extrabold tracking-wide text-white">
            Nexia
          </span>
        </Link>

        {/* TENGAH: Omni-Search Bar (Zona 0) */}
        <div className="hidden flex-1 px-12 md:block max-w-3xl">
          <div className="group relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 text-zinc-500 transition-colors group-hover:text-cyan-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari produk teknologi masa depan..."
              className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-14 pr-6 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-black/60 focus:ring-1 focus:ring-cyan-500/50 group-hover:border-white/20 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
            />
          </div>
        </div>

        {/* KANAN: Cart & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Tombol Keranjang */}
          <button
            onClick={toggleCart}
            className="relative rounded-full p-2.5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <ShoppingCart size={22} />
            {cartItems.length > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                {cartItems.length}
              </span>
            )}
          </button>

          {/* Tombol Profile */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400 transition-all hover:border-cyan-500/50 hover:text-white">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
