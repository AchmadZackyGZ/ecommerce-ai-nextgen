import { apiClient } from "./apiClient";

export async function chatWithNexia(message: string) {
  try {
    // Memanggil endpoint POST /ai/chat persis seperti di Postman Anda!
    const response = await apiClient.post("/ai/chat", { message });

    // Menangkap field "reply" dari response JSON Spring Boot Anda
    return response.data.data.reply;
  } catch (error) {
    console.error("🤖 [FRONTEND/ERROR]: Gagal ngobrol dengan Nexia:", error);
    return "Maaf, koneksi neural saya ke server Spring Boot sedang terganggu. Coba lagi nanti ya!";
  }
}
