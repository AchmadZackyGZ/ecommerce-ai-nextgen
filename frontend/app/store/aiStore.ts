import { create } from "zustand";

export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

interface AiState {
  isOpen: boolean; // Mengingat apakah jendela chat sedang terbuka
  messages: Message[]; // Menyimpan riwayat obrolan
  isLoading: boolean; // Efek loading saat Nexia sedang mengetik
  toggleChat: () => void;
  addMessage: (msg: Message) => void;
  setLoading: (loading: boolean) => void;
}

export const useAiStore = create<AiState>((set) => ({
  isOpen: false,
  // Pesan sambutan default dari Nexia
  messages: [
    {
      id: "welcome-1",
      role: "ai",
      content:
        "Halo, selamat datang di Toko Nexia! Saya Nexia AI. asissten anda untuk membantu anda mencari product yang anda inginkan, Ada yang bisa saya bantu?",
    },
  ],
  isLoading: false,

  // Fungsi-fungsi pengubah state (Actions)
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
