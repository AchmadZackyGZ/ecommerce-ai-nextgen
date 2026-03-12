import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductProps } from "~/components/ecommerce/ProductCard";

export interface CartItem extends ProductProps {
  quantity: number;
  selected: boolean; // 🔥 State untuk Checkbox Shopee
  storeName: string; // 🔥 Simulasi nama toko
}

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  toggleCart: () => void;
  addItem: (product: any) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  toggleSelectItem: (productId: number) => void;
  toggleSelectAll: (select: boolean) => void;
  clearCart: () => void;
  getTotalPrice: () => number; // Hanya menghitung yang di-centang!
  getTotalItems: () => number; // Hanya menghitung yang di-centang!
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product) =>
        set((state) => {
          const incomingQuantity = product.quantity || 1;
          const existingItem = state.items.find(
            (item) => item.id === product.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + incomingQuantity }
                  : item,
              ),
            };
          }
          // 🔥 Default: Barang baru langsung ter-centang & anggap dari "Nexia Official"
          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: incomingQuantity,
                selected: true,
                storeName: "Nexia Official Store",
              },
            ],
          };
        }),

      // Hapus Barang
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      // Ubah Kuantitas (+/-)
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),

      // Centang/Uncentang satu barang
      toggleSelectItem: (productId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId
              ? { ...item, selected: !item.selected }
              : item,
          ),
        })),

      // Centang/Uncentang SEMUA barang
      toggleSelectAll: (select) =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, selected: select })),
        })),

      clearCart: () => set({ items: [] }),

      // 🔥 Kalkulasi hanya menghitung barang yang `selected: true`
      getTotalPrice: () => {
        const { items } = get();
        return items
          .filter((item) => item.selected)
          .reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items
          .filter((item) => item.selected)
          .reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "nexia-cart-storage",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
