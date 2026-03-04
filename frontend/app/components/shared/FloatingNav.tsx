import { Link } from "react-router"; // Gunakan "react-router" untuk versi v7 (eks-Remix)
import {
  Home,
  PackageSearch,
  Sparkles,
  ShoppingCart,
  User,
} from "lucide-react";

export default function FloatingNav() {
  return (
    // 🔥 INI MAGIC TAILWIND-NYA: bottom-6 untuk HP, md:top-6 md:bottom-auto untuk PC!
    <nav className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 md:bottom-auto md:top-6 md:w-auto md:max-w-none">
      <div className="flex items-center justify-between rounded-full border border-white/10 bg-zinc-900/80 px-6 py-3 shadow-2xl backdrop-blur-md md:gap-10">
        {/* Tombol Kiri */}
        <NavItem to="/" icon={<Home size={22} />} label="Home" />
        <NavItem
          to="/katalog"
          icon={<PackageSearch size={22} />}
          label="Katalog"
        />

        {/* 🤖 THE NEXIA COMMAND CENTER (Tombol Tengah Bersinar) */}
        <button className="group relative -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform hover:scale-105">
          <Sparkles
            size={24}
            className="transition-transform group-hover:rotate-12"
          />
        </button>

        {/* Tombol Kanan */}
        <NavItem to="/cart" icon={<ShoppingCart size={22} />} label="Cart" />
        <NavItem to="/profile" icon={<User size={22} />} label="Profile" />
      </div>
    </nav>
  );
}

// Sub-komponen agar kode rapi
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
      className="flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-white"
    >
      {icon}
      <span className="text-[10px] font-medium md:hidden">{label}</span>
    </Link>
  );
}
