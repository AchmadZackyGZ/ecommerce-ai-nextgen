import { apiClient } from "./apiClient";

export async function getProducts() {
  try {
    // Lihat betapa bersihnya ini! Tinggal panggil /products
    const response = await apiClient.get("/products");

    // Axios otomatis mengubah JSON, jadi kita tidak perlu response.json() lagi
    return response.data.data || response.data;
  } catch (error) {
    console.error("🤖 [FRONTEND/ERROR]: Gagal mengambil produk:", error);
    return [];
  }
}
