import { Link, useNavigate } from "react-router";
import {
  Home,
  PackageSearch,
  Sparkles,
  LogOut,
  X,
  BotMessageSquare,
} from "lucide-react";
import { useAiStore } from "~/store/aiStore";
import { useAuthStore } from "~/store/authStore";
import { useState } from "react";

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAiChat = useAiStore((state) => state.toggleChat);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleOpenAi = () => {
    setIsOpen(false);
    toggleAiChat();
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3 group"
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* 🔘 THE TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {/* Ikon Sparkles: Hilang saat state Open (Mobile) ATAU di-hover (Desktop) */}
        <div
          className={`absolute transition-all duration-500 md:group-hover:rotate-90 md:group-hover:opacity-0 md:group-hover:scale-50 ${isOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`}
        >
          <Sparkles size={24} />
        </div>

        {/* Ikon X: Muncul saat state Open (Mobile) ATAU di-hover (Desktop) */}
        <div
          className={`absolute transition-all duration-500 md:group-hover:rotate-0 md:group-hover:opacity-100 md:group-hover:scale-100 ${isOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}`}
        >
          <X size={26} />
        </div>
      </button>

      {/* 🚀 EXPANDING SPEED DIAL */}
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-bottom 
          md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:scale-100 md:group-hover:pointer-events-auto
          ${isOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-10 scale-50 pointer-events-none"}
        `}
      >
        {/* 1. Tombol Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-red-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-red-500/20 active:scale-95"
        >
          <LogOut size={18} />
        </button>

        {/* 2. Tombol Home */}
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          title="Home"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:text-white active:scale-95"
        >
          <Home size={18} />
        </Link>

        {/* 3. Tombol Katalog */}
        <Link
          to="/katalog"
          onClick={() => setIsOpen(false)}
          title="Katalog"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:text-white active:scale-95"
        >
          <PackageSearch size={18} />
        </Link>

        {/* 🤖 4. Tombol AI CHAT */}
        <button
          onClick={handleOpenAi}
          title="Tanya Nexia AI"
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/50 bg-zinc-900 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md transition-all hover:scale-110 hover:bg-cyan-500/10 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95"
        >
          <BotMessageSquare size={20} />
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-cyan-400 border-2 border-zinc-900"></span>
        </button>
      </div>
    </div>
  );
}
