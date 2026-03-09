import { Link, useNavigate } from "react-router";
import { Home, PackageSearch, Sparkles, LogOut } from "lucide-react";
import { useAiStore } from "~/store/aiStore";
import { useAuthStore } from "~/store/authStore";

export default function FloatingNav() {
  const toggleAiChat = useAiStore((state) => state.toggleChat);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3 group">
      {/* 🤖 THE CORE (Bola Utama AI) */}
      <button
        onClick={toggleAiChat}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(147,51,234,0.7)]"
      >
        <Sparkles
          size={24}
          className="transition-transform duration-500 group-hover:rotate-12"
        />
      </button>

      {/* 🚀 EXPANDING SPEED DIAL (Menu yang mekar ke atas saat Bola di-hover) */}
      <div className="flex flex-col items-center gap-3 opacity-0 translate-y-10 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-red-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut size={18} />
        </button>

        {/* Tombol Katalog */}
        <Link
          to="/katalog"
          title="Katalog"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-white/10 hover:text-white"
        >
          <PackageSearch size={18} />
        </Link>

        {/* Tombol Home */}
        <Link
          to="/"
          title="Home"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-white/10 hover:text-white"
        >
          <Home size={18} />
        </Link>
      </div>
    </div>
  );
}
