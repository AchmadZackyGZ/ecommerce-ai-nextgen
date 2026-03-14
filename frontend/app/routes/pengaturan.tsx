import { useState } from "react";
import { Link } from "react-router";
import {
  User,
  Package,
  Ticket,
  Settings,
  ChevronRight,
  ShieldCheck,
  Camera,
  MapPin,
  Plus,
  CreditCard,
  Bell,
  Lock,
  Smartphone,
  Activity,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta(
    "Pengaturan Akun",
    "Kelola profil, alamat, dan keamanan akun Nexia Anda.",
  );

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("Profil");

  // State untuk Toggle Notifikasi
  const [notifyOrder, setNotifyOrder] = useState(true);
  const [notifyPromo, setNotifyPromo] = useState(false);

  return (
    <main className="min-h-screen pb-40 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 🛡️ KOLOM KIRI: SIDEBAR NAVIGASI UTAMA */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 font-bold text-white shadow-lg text-xl relative group cursor-pointer">
                  AZ
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={20} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-white leading-tight">
                    Achmad Zacky
                  </h2>
                  <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-cyan-400">
                    <ShieldCheck size={14} /> Nexia Elite Member
                  </span>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                <Link
                  to="/pesanan"
                  className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Package size={18} /> Pesanan Saya
                  </div>
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  to="/voucher"
                  className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Ticket size={18} /> Dompet Voucher
                  </div>
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  to="/pengaturan"
                  className="group flex items-center justify-between rounded-xl bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-400 border border-cyan-500/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Settings size={18} /> Pengaturan Akun
                  </div>
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </nav>
            </div>
          </div>

          {/* ⚙️ KOLOM KANAN: THE SETTINGS MATRIX */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* TABS MENU PENGATURAN */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-2 backdrop-blur-md overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 min-w-max">
                {["Profil", "Alamat & Kartu", "Notifikasi", "Keamanan"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === tab ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* --- TAB 1: PROFIL --- */}
            {activeTab === "Profil" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <User className="text-cyan-400" size={20} /> Informasi
                    Pribadi
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        defaultValue="Achmad Zacky Ghoutsu Zamani"
                        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Username
                      </label>
                      <input
                        type="text"
                        defaultValue="@zackynexia"
                        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-400 focus:border-cyan-500/50 outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Email Utama
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          defaultValue="ghoutsu@customer.com"
                          disabled
                          className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-zinc-500 cursor-not-allowed"
                        />
                        <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 text-xs font-bold text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors">
                          Ubah
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        defaultValue="(+62) 812 3456 7890"
                        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button className="mt-8 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

            {/* --- TAB 2: ALAMAT & KARTU --- */}
            {activeTab === "Alamat & Kartu" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                {/* Section Alamat */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="text-purple-400" size={20} /> Buku
                      Alamat
                    </h3>
                    <button className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors">
                      <Plus size={16} /> Tambah Alamat
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Alamat Utama */}
                    <div className="relative rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 overflow-hidden">
                      <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                        Utama (AI Default)
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-bold text-white mb-1">
                            Rumah (Achmad Zacky)
                          </span>
                          <span className="text-xs text-zinc-400 mb-2">
                            (+62) 812 3456 7890
                          </span>
                          <p className="text-sm text-zinc-300">
                            Jl. Panglima Sudirman No. 123, Perumahan Graha
                            Bunder Asri, Gresik, Jawa Timur, 61111.
                          </p>
                        </div>
                        <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300">
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Alamat Tambahan */}
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-300 mb-1">
                            Kantor (Zacky)
                          </span>
                          <span className="text-xs text-zinc-500 mb-2">
                            (+62) 812 3456 7890
                          </span>
                          <p className="text-sm text-zinc-400">
                            Gedung UISI, Kompleks PT Semen Indonesia, Gresik,
                            Jawa Timur, 61122.
                          </p>
                        </div>
                        <button className="text-xs font-bold text-zinc-400 hover:text-white">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Kartu (Midtrans Style) */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="text-emerald-400" size={20} />{" "}
                      Metode Pembayaran Tersimpan
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">
                    Informasi kartu Anda disimpan secara aman oleh Midtrans
                    Secure Gateway. Nexia tidak menyimpan nomor kartu lengkap
                    Anda.
                  </p>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-16 items-center justify-center rounded bg-white font-black italic text-blue-800">
                        VISA
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          Bank BCA - Kartu Kredit
                        </span>
                        <span className="text-xs text-zinc-500">
                          **** **** **** 1234
                        </span>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-red-500 hover:text-red-400">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 3: NOTIFIKASI --- */}
            {activeTab === "Notifikasi" && (
              <div className="animate-in fade-in duration-500 rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Bell className="text-yellow-400" size={20} /> Preferensi
                  Notifikasi
                </h3>

                <div className="flex flex-col gap-6">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex flex-col max-w-[80%]">
                      <span className="text-sm font-bold text-white">
                        Update Status Pesanan (WhatsApp & Email)
                      </span>
                      <span className="text-xs text-zinc-400 mt-1">
                        Dapatkan notifikasi real-time saat "ZACKY SELLER"
                        memproses, mengirim, atau mengubah pesanan Anda.
                      </span>
                    </div>
                    <button
                      onClick={() => setNotifyOrder(!notifyOrder)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyOrder ? "bg-cyan-500" : "bg-zinc-700"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyOrder ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col max-w-[80%]">
                      <span className="text-sm font-bold text-white">
                        Promo & Voucher Nexia AI
                      </span>
                      <span className="text-xs text-zinc-400 mt-1">
                        Izinkan AI kami mengirimkan rekomendasi produk dan
                        voucher kilat eksklusif untuk Anda.
                      </span>
                    </div>
                    <button
                      onClick={() => setNotifyPromo(!notifyPromo)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyPromo ? "bg-cyan-500" : "bg-zinc-700"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyPromo ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 4: KEAMANAN & AI --- */}
            {activeTab === "Keamanan" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                {/* Ubah Password */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Lock className="text-rose-400" size={20} /> Keamanan Akun
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        Kata Sandi (Password)
                      </span>
                      <span className="text-xs text-zinc-400 mt-1">
                        Terakhir diubah 3 bulan yang lalu.
                      </span>
                    </div>
                    <button className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                      Ubah Kata Sandi
                    </button>
                  </div>
                </div>

                {/* AI Security Log (Fitur Spesial Anda) */}
                <div className="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-6 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={100} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="text-purple-400" size={20} /> Nexia AI
                    Security Log
                  </h3>

                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-start gap-4 rounded-xl border border-purple-500/20 bg-black/30 p-4">
                      <Smartphone className="text-zinc-400 mt-1" size={20} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                          Login Berhasil{" "}
                          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 uppercase">
                            Saat ini
                          </span>
                        </span>
                        <span className="text-xs text-zinc-300 mt-1">
                          Chrome on Windows 11
                        </span>
                        <span className="text-xs text-zinc-500 mt-0.5">
                          Surabaya, East Java, Indonesia • IP: 192.168.1.1
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-black/20 p-4">
                      <Smartphone className="text-zinc-500 mt-1" size={20} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-300">
                          Login Berhasil
                        </span>
                        <span className="text-xs text-zinc-400 mt-1">
                          Nexia Mobile App on iOS
                        </span>
                        <span className="text-xs text-zinc-500 mt-0.5">
                          Gresik, East Java, Indonesia • 2 hari yang lalu
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="mt-6 text-xs font-bold text-purple-400 hover:text-purple-300">
                    Keluar dari semua perangkat lain
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
