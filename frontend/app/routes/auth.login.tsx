import { useState } from "react";
import { useNavigate, Link } from "react-router"; // Ingat, kita pakai react-router v7
import { Sparkles, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner"; // Notifikasi premium kita
import { loginUser } from "~/services/authService";
import { useAuthStore } from "~/store/authStore";

export function meta() {
  return [{ title: "Login | Nexia Premium E-Commerce" }];
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // Panggil brankas kita

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Telepon Backend Java Spring Boot
      const response = await loginUser(email, password);

      // ⚠️ PENTING: Sesuaikan ini dengan bentuk JSON balasan dari Spring Boot Anda!
      // Asumsi standar: response.data berisi { token: "ey...", user: {...} }
      // Jika JSON Spring Boot Anda langsung mereturn token, gunakan: response.token
      const token = response.data?.token || response.token;

      // Kita langsung ambil seluruh isi response.data (yang berisi name, role, dll)
      // Jika email dari backend null, kita timpa dengan email yang diketik di form
      const user = { ...response.data, email: email };

      if (!token) throw new Error("Token tidak ditemukan dari server.");

      // 2. Simpan token ke Brankas Zustand & LocalStorage
      login(token, user);

      // 3. Munculkan notifikasi sukses yang cantik
      toast.success("Akses Diterima. Selamat datang di Nexia!");

      // 4. Lemparkan user kembali ke halaman utama
      navigate("/");
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Kredensial tidak valid. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      {/* 🌌 Efek Cahaya Kosmik di Belakang Card */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />

      {/* 💳 Glassmorphism Card */}
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Logo */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Masuk untuk melanjutkan belanja.
          </p>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black/60 focus:ring-1 focus:ring-cyan-500/50"
                placeholder="chief@nexia.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black/60 focus:ring-1 focus:ring-cyan-500/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Tombol Submit Premium */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-white py-4 font-bold text-black transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span className="flex items-center gap-2">
                Sign In{" "}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-zinc-500">
          Belum memiliki akun?{" "}
          <Link
            to="/auth/register"
            className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
