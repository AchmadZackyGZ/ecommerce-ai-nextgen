import axios from "axios";

// Mengambil URL dari .env
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

// Membuat "Pabrik" Axios yang sudah terkonfigurasi
export const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  // timeout: 10000, // Opsional: Batalkan jika backend tidak merespon dalam 10 detik
});

// NANTI: Di sinilah kita akan menaruh "Interceptor" untuk menyelipkan Token JWT Login secara otomatis!
// apiClient.interceptors.request.use((config) => { ... })
