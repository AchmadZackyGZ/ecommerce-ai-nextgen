import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: any | null; // Nanti bisa kita ganti dengan tipe data User yang lebih spesifik
  login: (token: string, userData: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Cek apakah ada token di localStorage saat web pertama kali dimuat
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,

  // Aksi saat user berhasil login
  login: (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    set({ token, user: userData });
  },

  // Aksi saat user menekan tombol logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
