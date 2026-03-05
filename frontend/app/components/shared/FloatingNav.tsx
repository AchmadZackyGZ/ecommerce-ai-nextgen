import { Link } from "react-router";
import {
  Home,
  PackageSearch,
  Sparkles,
  ShoppingCart,
  User,
} from "lucide-react";
import { useAiStore } from "~/store/aiStore";

export default function FloatingNav() {
  const toggleAiChat = useAiStore((state) => state.toggleChat);

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:bottom-auto md:top-6">
      {/* 🔥 MAGIC KAPSUL UTAMA: 
        1. bg-zinc-950/20 = Ekstra transparan saat diam (menyatu dengan background).
        2. backdrop-blur-xl = Efek kaca buram ala macOS.
        3. group = Kunci untuk mendeteksi hover dan memerintahkan elemen di dalamnya membesar!
      */}
      <div className="group flex items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-950/20 p-2 shadow-lg backdrop-blur-xl transition-all duration-500 ease-out hover:bg-zinc-900/70 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] md:hover:p-3">
        {/* Tombol Kiri */}
        <NavItem to="/" icon={<Home size={20} />} label="Home" />
        <NavItem
          to="/katalog"
          icon={<PackageSearch size={20} />}
          label="Katalog"
        />

        {/* 🤖 THE NEXIA COMMAND CENTER (Tombol Tengah) */}
        <button
          onClick={toggleAiChat}
          className="relative mx-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-500 md:h-11 md:w-11 md:group-hover:scale-110"
        >
          <Sparkles
            size={20}
            className="transition-transform group-hover:rotate-12"
          />
        </button>

        {/* Tombol Kanan */}
        <NavItem to="/cart" icon={<ShoppingCart size={20} />} label="Cart" />
        <NavItem to="/profile" icon={<User size={20} />} label="Profile" />
      </div>
    </nav>
  );
}

// Sub-komponen Tombol
function NavItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center overflow-hidden rounded-full p-2 text-zinc-400 transition-all duration-300 hover:bg-white/10 hover:text-white md:group-hover:px-4"
    >
      {icon}
      {/* 🔥 EFEK DYNAMIC ISLAND: 
        Teks disembunyikan pakai max-w-0 (lebar nol). 
        Saat Kapsul Utama di-hover (group-hover), teks akan meluncur keluar! 
      */}
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap pl-0 text-sm font-medium opacity-0 transition-all duration-500 ease-out md:block md:group-hover:max-w-[100px] md:group-hover:pl-2 md:group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}
