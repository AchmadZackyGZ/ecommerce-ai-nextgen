import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, User, X, Bot } from "lucide-react";
import { useAiStore } from "~/store/aiStore";
import { chatWithNexia } from "~/services/aiService";

export default function NexiaChat() {
  const { isOpen, toggleChat, messages, addMessage, isLoading, setLoading } =
    useAiStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbawah setiap kali ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput(""); // Kosongkan input

    // 1. Masukkan pesan User ke layar
    addMessage({ id: Date.now().toString(), role: "user", content: userText });
    setLoading(true);

    // 2. Panggil API Spring Boot
    const aiReply = await chatWithNexia(userText);

    // 3. Masukkan balasan Nexia ke layar
    addMessage({
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: aiReply,
    });
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 🌌 Latar Belakang Gelap (Backdrop Blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleChat} // Tutup chat jika background diklik
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* 🤖 JENDELA SPOTLIGHT COMMAND CENTER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            className="fixed left-1/2 top-[10%] z-[70] flex max-h-[80vh] w-[95%] max-w-3xl -translate-x-1/2 flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-2xl md:top-[15%]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Nexia AI</h2>
                  <p className="text-xs text-cyan-400">
                    Shopping Assistant Online
                  </p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Area Obrolan (Messages) - Menyembunyikan Scrollbar untuk estetika */}
            <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-col gap-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-zinc-800" : "bg-cyan-900/50 text-cyan-400 border border-cyan-500/30"}`}
                    >
                      {msg.role === "user" ? (
                        <User size={16} />
                      ) : (
                        <Bot size={16} />
                      )}
                    </div>

                    {/* Bubble Text */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-zinc-800 text-white"
                          : "bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5 text-zinc-300"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Indikator Loading Nexia */}
                {isLoading && (
                  <div className="flex flex-row gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-900/50 border border-cyan-500/30 text-cyan-400">
                      <Sparkles size={16} className="animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5 px-5 py-4">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0,
                        }}
                        className="h-2 w-2 rounded-full bg-cyan-500"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0.2,
                        }}
                        className="h-2 w-2 rounded-full bg-cyan-500"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0.4,
                        }}
                        className="h-2 w-2 rounded-full bg-cyan-500"
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Box */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-white/10 bg-black/20 p-4"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanya Nexia untuk mencari produk, spesifikasi, atau rekomendasi..."
                  className="w-full rounded-full border border-white/10 bg-zinc-900/50 py-4 pl-6 pr-14 text-sm text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
