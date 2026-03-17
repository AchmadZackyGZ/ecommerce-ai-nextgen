import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

export const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 MAGIC INTERCEPTOR: Selipkan Token JWT otomatis sebelum request dikirim!
apiClient.interceptors.request.use(
  (config) => {
    // Ambil token dari brankas LocalStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Jika token ada, pakaikan seragam "Bearer <token>"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 🔥 SATPAM FRONTEND: Tangkap respon dari Backend
apiClient.interceptors.response.use(
  (response) => {
    return response; // Jika sukses (200 OK), biarkan lewat
  },
  (error) => {
    // JIKA BACKEND TERIAK 401 UNAUTHORIZED (Token Expired / Palsu)
    if (error.response && error.response.status === 401) {
      console.warn("Token Expired! Menendang user keluar...");

      // 1. Hapus isi laci (Storage)
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 2. Tendang ke halaman Login secara paksa
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
