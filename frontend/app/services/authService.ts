import { apiClient } from "./apiClient";

export async function loginUser(email: string, password: string) {
  try {
    // Sesuaikan endpoint ini dengan URL di Spring Boot / Postman Anda
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data; // Biasanya berisi Token dan Data User
  } catch (error) {
    console.error("Gagal Login:", error);
    throw error;
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  try {
    const response = await apiClient.post("/users/register", {
      name,
      email,
      password,
    });
    return response.data; // Biasanya berisi pesan sukses atau data user
  } catch (error) {
    console.error("Gagal Registrasi:", error);
    throw error;
  }
}
