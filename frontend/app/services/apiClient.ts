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
