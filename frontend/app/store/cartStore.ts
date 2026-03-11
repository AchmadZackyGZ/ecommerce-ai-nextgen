import { create } from "zustand";
import { persist } from "zustand/middleware"; // 🔥 KITA PANGGIL MIDDLEWARE PERSIST
import type { ProductProps } from "~/components/ecommerce/ProductCard";

export interface CartItem extends ProductProps {
  quantity: number;
}

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  toggleCart: () => void;
  addItem: (product: ProductProps) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// 🔥 BUNGKUS DENGAN persist()
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "nexia-cart-storage", // Nama brankas di LocalStorage
      // 🔥 TRICK DEWA: Hanya simpan 'items'. Jangan simpan 'isOpen' agar laci tidak terbuka sendiri saat web di-refresh!
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
