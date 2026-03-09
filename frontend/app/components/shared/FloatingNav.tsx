import { Link, useNavigate } from "react-router"; // Tambahkan useNavigate
import {
  Home,
  PackageSearch,
  Sparkles,
  ShoppingCart,
  User,
  LogOut,
} from "lucide-react"; // Tambahkan LogOut
import { useAiStore } from "~/store/aiStore";
import { useAuthStore } from "~/store/authStore"; // Panggil brankas Auth kita
import { userCartStore } from "~/store/cartStore";

export default function FloatingNav() {
  const toggleAiChat = useAiStore((state) => state.toggleChat);
  const toggleCart = userCartStore((state) => state.toggleCart); // Panggil fungsi toggle
  const cartItems = userCartStore((state) => state.items); // Hitung jumlah barang

  // Ambil fungsi logout dari brankas
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Fungsi untuk mengeksekusi proses keluar
  const handleLogout = () => {
    logout(); // Hapus token dari memori & LocalStorage
    navigate("/auth/login"); // Lemparkan kembali ke gerbang depan
  };

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:bottom-auto md:top-6">
      <div className="group flex items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-950/20 p-2 shadow-lg backdrop-blur-xl transition-all duration-500 ease-out hover:bg-zinc-900/70 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] md:hover:p-3">
        {/* Tombol Kiri */}
        <NavItem to="/" icon={<Home size={20} />} label="Home" />
        <NavItem
          to="/katalog"
          icon={<PackageSearch size={20} />}
          label="Katalog"
        />

        {/* 🤖 THE NEXIA COMMAND CENTER */}
        <button
          onClick={toggleAiChat}
          className="relative mx-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-500 md:h-11 md:w-11 md:group-hover:scale-110"
        >
          <Sparkles
            size={20}
            className="transition-transform group-hover:rotate-12"
          />
        </button>

        <button
          onClick={toggleCart}
          className="relative flex items-center justify-center overflow-hidden rounded-full p-2 text-zinc-400 transition-all duration-300 hover:bg-white/10 hover:text-white md:group-hover:px-4"
        >
          <ShoppingCart size={20} />

          {/* Badge Notifikasi Angka */}
          {cartItems.length > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white md:right-2 md:top-2">
              {cartItems.length}
            </span>
          )}

          <span className="hidden max-w-0 overflow-hidden whitespace-nowrap pl-0 text-sm font-medium opacity-0 transition-all duration-500 ease-out md:block md:group-hover:max-w-[100px] md:group-hover:pl-2 md:group-hover:opacity-100">
            Cart
          </span>
        </button>
        {/* 🔥 TOMBOL LOGOUT DINAMIS */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center overflow-hidden rounded-full p-2 text-zinc-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 md:group-hover:px-4"
        >
          <LogOut size={20} />
          <span className="hidden max-w-0 overflow-hidden whitespace-nowrap pl-0 text-sm font-medium opacity-0 transition-all duration-500 ease-out md:block md:group-hover:max-w-[100px] md:group-hover:pl-2 md:group-hover:opacity-100">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}

// ... (Sub-komponen NavItem biarkan sama seperti sebelumnya) ...
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
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap pl-0 text-sm font-medium opacity-0 transition-all duration-500 ease-out md:block md:group-hover:max-w-[100px] md:group-hover:pl-2 md:group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}
