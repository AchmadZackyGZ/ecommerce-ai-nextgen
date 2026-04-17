import { Link, useNavigate } from "react-router";
import {
  Home,
  PackageSearch,
  Sparkles,
  LogOut,
  X,
  BotMessageSquare,
  MessageCircle,
} from "lucide-react";

// 🔥 IMPORT LIBRARY GETSTREAM
import { StreamChat } from "stream-chat";
import {
  Chat,
  ChannelList,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageComposer,
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css"; // Wajib agar UI-nya tidak berantakan!

import { useAiStore } from "~/store/aiStore";
import { useAuthStore } from "~/store/authStore";
import { useEffect, useState } from "react";

// inisialisasi StreamChat dengan api
const apiKey = import.meta.env.VITE_GETSTREAM_PUBLIC_KEY || "DUMMY_KEY";
const chatClient = StreamChat.getInstance(apiKey);

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false); // state untuk cek apakah chat client sudah siap

  const toggleAiChat = useAiStore((state) => state.toggleChat);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user); // ambil data user dari authStore
  const navigate = useNavigate();

  // hubungkan dengan server getStream
  useEffect(() => {
    // Pastikan user sudah login dan memiliki streamToken (yang kita kirim dari Spring Boot!)
    if (user && user.streamToken && isChatOpen && !isClientReady) {
      const connectionStream = async () => {
        try {
          await chatClient.connectUser(
            {
              id: String(user.id), // pastikan id ini unik untuk setiap user
              name: user.name,
              image: user.avatarUrl, // pastikan ini URL yang valid
            },
            user.streamToken, // token yang kita generate di backend
          );
          setIsClientReady(true);
        } catch (error) {
          console.error("Gagal connect ke Stream Chat:", error);
        }
      };

      connectionStream();
    }
    // Membersihkan koneksi saat komponen ditutup/logout
    return () => {
      if (isClientReady) {
        chatClient.disconnectUser();
        setIsClientReady(false);
      }
    };
  }, [user, isChatOpen]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleOpenAi = () => {
    setIsOpen(false);
    toggleAiChat();
  };

  // 🔥 FUNGSI BARU UNTUK BUKA CHAT GETSTREAM
  const handleToggleChat = () => {
    setIsOpen(false); // Tutup menu bulat
    setIsChatOpen(!isChatOpen); // Buka Kotak Chat GetStream
  };

  // 🔥 FILTER: Hanya tampilkan chat yang melibatkan user ini
  const filters = { members: { $in: [String(user?.id)] } };
  const sort = { last_message_at: -1 };

  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3 group"
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* 🔘 THE TRIGGER BUTTON MAIN (LOGO BINTANG SPARKLE) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div
            className={`absolute transition-all duration-500 md:group-hover:rotate-90 md:group-hover:opacity-0 md:group-hover:scale-50 ${isOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`}
          >
            <Sparkles size={24} />
          </div>
          <div
            className={`absolute transition-all duration-500 md:group-hover:rotate-0 md:group-hover:opacity-100 md:group-hover:scale-100 ${isOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}`}
          >
            <X size={26} />
          </div>
        </button>

        {/* 🚀 EXPANDING SPEED DIAL (MENU YANG MUNCUL KE ATAS) */}
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

          {/* 💬 4. Tombol CHAT PENJUAL (MASUK KE DALAM MENU!) */}
          <button
            onClick={handleToggleChat}
            title="Chat Penjual"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/30 bg-zinc-900 text-emerald-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-emerald-500/10 active:scale-95"
          >
            <MessageCircle size={18} />
            {/* Lencana Titik Merah (Unread Badge) */}
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
              1
            </span>
          </button>

          {/* 🤖 5. Tombol AI CHAT */}
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

      {/* 🚀 KOTAK POP-UP CHAT GETSTREAM AKTIF! */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-24 z-[70] w-[750px] h-[550px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 origin-bottom-right flex flex-col">
          {/* Header Global */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3.5 flex justify-between items-center text-black font-bold shrink-0">
            <span className="flex items-center gap-2">
              <MessageCircle size={18} /> Nexia Chat Center
            </span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-black/20 p-1 rounded-md transition-colors text-black"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body GetStream */}
          <div className="flex-1 overflow-hidden bg-black text-white relative stream-theme-dark">
            {!isClientReady ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 animate-pulse">
                <MessageCircle size={40} className="mb-3 text-emerald-500/50" />
                <p>Menghubungkan ke Server...</p>
              </div>
            ) : (
              // 🔥 KOMPONEN AJAIB GETSTREAM
              <Chat client={chatClient} theme="str-chat__theme-dark">
                {/* 📐 MASTER-DETAIL LAYOUT (KIRI & KANAN) */}
                <div className="flex h-full w-full">
                  {/* KIRI (ASIDE): Daftar Siapa Saja yang Chat */}
                  <div className="w-[280px] h-full border-r border-white/10 shrink-0 overflow-y-auto bg-zinc-900/50">
                    <ChannelList filters={filters as any} sort={sort as any} />
                  </div>

                  {/* KANAN (MAIN): Ruang Obrolan Aktif */}
                  <div className="flex-1 h-full min-w-0 flex flex-col bg-black relative">
                    <Channel>
                      <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageComposer />
                      </Window>
                    </Channel>
                  </div>
                </div>
              </Chat>
            )}
          </div>
        </div>
      )}
    </>
  );
}
