import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Store,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { useAuthStore } from "~/store/authStore"; // 🔥 Import State User
import { toast } from "sonner"; // 🔥 Import Toast

export const meta = () =>
  generateMeta("Nexia Seller Centre", "Pusat manajemen toko Anda.");

export default function SellerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state: any) => state.user);

  // 🔥 SATPAM FRONTEND: Eksekusi Pengecekan Role
  useEffect(() => {
    if (!user) {
      toast.error("Akses Ditolak! Silakan login terlebih dahulu.");
      navigate("/login");
    } else if (user.role !== "SELLER" && user.role !== "ADMIN") {
      toast.error("akses ditolak anda bukan penjual!");
      navigate("/"); // Lempar kembali ke halaman utama / katalog
    }
  }, [user, navigate]);

  // 🔥 CEGAH RENDER UI: Jika bukan Seller, tampilkan layar loading hitam
  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400"></div>
      </div>
    );
  }

  // Daftar Menu Sidebar
  const navItems = [
    { name: "Dashboard", path: "/seller", icon: LayoutDashboard },
    { name: "Produk Saya", path: "/seller/products", icon: Package },
    { name: "Pesanan", path: "/seller/orders", icon: ShoppingCart },
    { name: "Pengaturan Toko", path: "/seller/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black flex text-white font-sans overflow-hidden">
      {/* 👈 SIDEBAR KIRI (Navigasi) */}
      <aside className="w-64 bg-zinc-950 border-r border-white/5 flex flex-col hidden md:flex h-screen sticky top-0 shrink-0">
        {/* Logo Seller Center */}
        <div className="h-20 border-b border-white/5 flex items-center gap-3 px-6 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Store className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wide leading-none">
              NEXIA
            </span>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-1">
              Seller Centre
            </span>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2 px-2">
            Menu Utama
          </span>
          {navItems.map((item) => {
            const isActive =
              item.path === "/seller"
                ? location.pathname === "/seller"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300 border border-transparent"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Tombol Keluar */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20">
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* 👉 MAIN CONTENT KANAN (Area Kerja) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER ATAS */}
        <header className="h-20 bg-zinc-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-white hidden md:block">
            Manajemen Toko
          </h1>

          {/* Profil Toko Aktif */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              {/* 🔥 Tampilkan Nama User Asli dari State */}
              <span className="text-sm font-bold text-white">{user.name}</span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                {user.role}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 overflow-hidden bg-zinc-800 cursor-pointer hover:border-cyan-400 transition-colors">
              <img
                src={
                  user.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* ⚡ AREA OUTLET */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
