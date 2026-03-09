import { create } from "zustand";
import { type ProductProps } from "~/components/ecommerce/ProductCard";

export interface CartItem extends ProductProps {
  quantity: number;
}

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  toggleCart: () => void;
  addItem: (product: ProductProps) => void;
  removeItem: (producId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const userCartStore = create<CartState>((set, get) => ({
  isOpen: false,
  items: [],

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        // Jika barang sudah ada, tambah quantity-nya saja
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      // Jika barang belum ada, tambahkan ke cart dengan quantity 1
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    })),

  clearCart: () => set({ items: [] }),

  // Menghitung total kuantitas barang (bukan cuma jenis barang)
  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
