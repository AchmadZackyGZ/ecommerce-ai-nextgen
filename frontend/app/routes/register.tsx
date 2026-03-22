import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { registerUser } from "~/services/authService";
import { generateMeta } from "~/utils/seo";

// Panggil Pabrik SEO Dinamis kita!
export const meta = () =>
  generateMeta("Register", "Bergabunglah dengan Nexia Premium E-Commerce");

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Kirim data ke Java Spring Boot
      await registerUser(name, email, password);

      // 2. Notifikasi Sukses
      toast.success("Akun berhasil dibuat! Silakan Login.");

      // 3. Lemparkan ke halaman Login
      navigate("/login");
    } catch (error: any) {
      console.error("Register Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Gagal membuat akun. Email mungkin sudah terdaftar.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      {/* 🌌 Efek Cahaya Kosmik di Belakang Card */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[120px]" />

      {/* 💳 Glassmorphism Card */}
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Logo */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-400 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Create Account</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Mulai perjalanan teknologi masa depan Anda.
          </p>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Field Nama */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-purple-500/50 focus:bg-black/60 focus:ring-1 focus:ring-purple-500/50"
                placeholder="John Doe"
              />
            </div>
          </div>

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
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-purple-500/50 focus:bg-black/60 focus:ring-1 focus:ring-purple-500/50"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-purple-500/50 focus:bg-black/60 focus:ring-1 focus:ring-purple-500/50"
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>

          {/* Tombol Submit Premium */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-white py-4 font-bold text-black transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span className="flex items-center gap-2">
                Create Account{" "}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-zinc-500">
          Sudah memiliki akun?{" "}
          <Link
            to="/login"
            className="font-semibold text-purple-400 transition-colors hover:text-purple-300"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
