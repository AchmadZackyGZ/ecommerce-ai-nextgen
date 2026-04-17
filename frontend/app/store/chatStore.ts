import { create } from "zustand";

interface ChatState {
  isChatOpen: boolean;
  activeSellerId: string | null;
  activeProductContext: any | null; // Untuk menyimpan data produk (Gambar, Nama, Harga)

  // Fungsi yang akan dipanggil dari halaman Detail Produk
  openChatWithSeller: (sellerId: string, productData?: any) => void;

  // Fungsi untuk menutup chat
  closeChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isChatOpen: false,
  activeSellerId: null,
  activeProductContext: null,

  openChatWithSeller: (sellerId, productData = null) =>
    set({
      isChatOpen: true,
      activeSellerId: sellerId,
      activeProductContext: productData,
    }),

  closeChat: () =>
    set({
      isChatOpen: false,
      activeSellerId: null,
      activeProductContext: null,
    }),
}));
