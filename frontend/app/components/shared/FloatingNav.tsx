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
  useChatContext,
  Attachment,
  WithComponents,
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";

import { useAiStore } from "~/store/aiStore";
import { useAuthStore } from "~/store/authStore";
import { useChatStore } from "~/store/chatStore";
import { useEffect, useState } from "react";

const apiKey = import.meta.env.VITE_GETSTREAM_PUBLIC_KEY || "DUMMY_KEY";
const chatClient = StreamChat.getInstance(apiKey);

function AutoSelectChannelManager({
  sellerId,
  productContext,
  user,
}: {
  sellerId: string;
  productContext: any;
  user: any;
}) {
  const { client, setActiveChannel } = useChatContext();

  useEffect(() => {
    if (sellerId && user && client) {
      const initChannel = async () => {
        const channel = client.channel("messaging", {
          members: [String(user.id), String(sellerId)],
        });
        await channel.watch();
        setActiveChannel(channel);

        if (productContext) {
          await channel.sendMessage({
            text: `Halo kak, saya tertarik dengan produk ini. Apakah masih tersedia?`,
            attachments: [
              {
                type: "product",
                title: productContext.name,
                image_url: productContext.image,
                text: `Rp ${productContext.price.toLocaleString("id-ID")}`,
              },
            ],
          });
          useChatStore.setState({ activeProductContext: null });
        }
      };
      initChannel();
    }
  }, [sellerId, user, productContext, client, setActiveChannel]);

  return null;
}

function CustomAttachment(props: any) {
  // 🔥 GETSTREAM V14 MENGIRIMKAN ARRAY 'attachments' (Pakai 's'), BUKAN TUNGGAL!
  const { attachments } = props;

  // Cari apakah di dalam array lampiran tersebut ada yang tipenya "product"
  const productAttachment = attachments?.find((a: any) => a.type === "product");

  if (productAttachment) {
    return (
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-3 flex gap-3 my-2 w-[280px] shadow-lg hover:border-cyan-500/30 transition-colors relative overflow-hidden">
        {/* Garis Aksen Kiri */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-purple-500"></div>

        {/* Gambar Produk */}
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black">
          <img
            src={productAttachment.image_url}
            alt={productAttachment.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info Produk */}
        <div className="flex flex-col justify-center flex-1">
          <h4 className="text-[13px] font-bold text-zinc-100 line-clamp-2 leading-tight">
            {productAttachment.title}
          </h4>
          <span className="text-cyan-400 font-black text-[13px] mt-1.5">
            {productAttachment.text}
          </span>
        </div>
      </div>
    );
  }

  // Jika bukan product (misal ngirim gambar biasa), kembalikan ke UI bawaan GetStream
  return <Attachment {...props} />;
}

function ChannelWrapper() {
  const { channel } = useChatContext();

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 bg-black">
        <MessageCircle size={48} className="mb-4 opacity-10" />
        <p>Pilih obrolan dari daftar, atau mulai chat baru.</p>
      </div>
    );
  }

  return (
    <WithComponents overrides={{ Attachment: CustomAttachment }}>
      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageComposer />
        </Window>
      </Channel>
    </WithComponents>
  );
}

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);

  const toggleAiChat = useAiStore((state) => state.toggleChat);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state: any) => state.user);
  const navigate = useNavigate();

  const { isChatOpen, activeSellerId, activeProductContext, closeChat } =
    useChatStore((state: any) => state);

  // KONEKSI KE SERVER GETSTREAM
  useEffect(() => {
    if (user && user.streamToken && isChatOpen && !isClientReady) {
      const connectionStream = async () => {
        try {
          await chatClient.connectUser(
            {
              id: String(user.id),
              name: user.name,
              image:
                user.avatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
            },
            user.streamToken,
          );
          setIsClientReady(true);
        } catch (error) {
          console.error("Gagal connect ke Stream Chat:", error);
        }
      };
      connectionStream();
    }
  }, [user, isChatOpen]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleOpenAi = () => {
    setIsOpen(false);
    toggleAiChat();
  };

  const handleToggleChat = () => {
    setIsOpen(false);
    if (isChatOpen) closeChat();
    else useChatStore.setState({ isChatOpen: true });
  };

  const filters = { members: { $in: [String(user?.id)] } };
  const sort = { last_message_at: -1 };

  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3 group"
        onMouseLeave={() => setIsOpen(false)}
      >
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

        <div
          className={`flex flex-col items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-bottom md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:scale-100 md:group-hover:pointer-events-auto ${isOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-10 scale-50 pointer-events-none"}`}
        >
          <button
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-red-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-red-500/20 active:scale-95"
          >
            <LogOut size={18} />
          </button>
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:text-white active:scale-95"
          >
            <Home size={18} />
          </Link>
          <Link
            to="/katalog"
            onClick={() => setIsOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:text-white active:scale-95"
          >
            <PackageSearch size={18} />
          </Link>

          <button
            onClick={handleToggleChat}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/30 bg-zinc-900 text-emerald-400 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-emerald-500/10 active:scale-95"
          >
            <MessageCircle size={18} />
          </button>

          <button
            onClick={handleOpenAi}
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/50 bg-zinc-900 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md transition-all hover:scale-110 hover:bg-cyan-500/10 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95"
          >
            <BotMessageSquare size={20} />
          </button>
        </div>
      </div>

      {/* 🚀 KOTAK POP-UP CHAT GETSTREAM */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-24 z-[70] w-[750px] h-[550px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 origin-bottom-right flex flex-col">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3.5 flex justify-between items-center text-black font-bold shrink-0">
            <span className="flex items-center gap-2">
              <MessageCircle size={18} /> Nexia Chat Center
            </span>
            <button
              onClick={closeChat}
              className="hover:bg-black/20 p-1 rounded-md transition-colors text-black"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-black text-white relative stream-theme-dark">
            {!isClientReady ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 animate-pulse">
                <MessageCircle size={40} className="mb-3 text-emerald-500/50" />
                <p>Menghubungkan ke Server...</p>
              </div>
            ) : (
              <Chat client={chatClient} theme="str-chat__theme-dark">
                {/* 🎯 SUNTIKAN MESIN RAHASIA KE DALAM OTAK CHAT! */}
                {activeSellerId && (
                  <AutoSelectChannelManager
                    sellerId={activeSellerId}
                    productContext={activeProductContext}
                    user={user}
                  />
                )}

                <div className="flex h-full w-full">
                  {/* KIRI: DAFTAR CHAT */}
                  <div className="w-[280px] h-full border-r border-white/10 shrink-0 overflow-y-auto bg-zinc-900/50">
                    {/* 🔥 HAPUS TOTAL onSelect! Biarkan Stream yang kerja otomatis */}
                    <ChannelList filters={filters as any} sort={sort as any} />
                  </div>

                  {/* KANAN: RUANG OBROLAN */}
                  <div className="flex-1 h-full min-w-0 flex flex-col bg-black relative">
                    {/* 🔥 Panggil Pembungkus Cerdas yang kita buat di atas */}
                    <ChannelWrapper />
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
