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
  X,
  Upload,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { toast } from "sonner";

export const meta = () =>
  generateMeta(
    "Pengaturan Akun",
    "Kelola profil, alamat, dan keamanan akun Nexia Anda.",
  );

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("Profil");

  // State untuk Toggle Notifikasi (V1: In-App & Email only)
  const [notifyOrder, setNotifyOrder] = useState(true);
  const [notifyPromo, setNotifyPromo] = useState(false);

  // 🧠 STATES UNTUK MODALS
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Handlers untuk form submit simulasi
  const handleSaveData = (e: React.FormEvent, type: string) => {
    e.preventDefault();
    toast.success(`Data ${type} berhasil disimpan secara aman!`);
    setIsAddressModalOpen(false);
    setIsCardModalOpen(false);
    setIsPasswordModalOpen(false);
  };

  return (
    <main className="min-h-screen pb-40 pt-28 relative">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 🛡️ KOLOM KIRI: SIDEBAR NAVIGASI UTAMA */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 font-bold text-white shadow-lg text-xl">
                  AZ
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
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                    <User className="text-cyan-400" size={20} /> Informasi
                    Pribadi
                  </h3>

                  <div className="flex flex-col-reverse md:flex-row gap-10">
                    {/* Form Kiri */}
                    <div className="flex-1 grid grid-cols-1 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Username
                        </label>
                        <input
                          type="text"
                          defaultValue="zackynexia"
                          className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-300 focus:border-cyan-500/50 outline-none transition-colors"
                        />
                        <span className="text-[10px] text-zinc-500">
                          Username hanya dapat diubah satu (1) kali.
                        </span>
                      </div>
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
                          Email Terverifikasi
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            defaultValue="gho******@customer.com"
                            disabled
                            className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-emerald-400 font-medium cursor-not-allowed"
                          />
                          <button className="rounded-xl border border-white/10 bg-zinc-800 px-4 text-xs font-bold text-white hover:bg-zinc-700 transition-colors">
                            Ubah
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Nomor Telepon
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            defaultValue="(+62) 812 3456 ****"
                            disabled
                            className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-emerald-400 font-medium cursor-not-allowed"
                          />
                          <button className="rounded-xl border border-white/10 bg-zinc-800 px-4 text-xs font-bold text-white hover:bg-zinc-700 transition-colors">
                            Ubah
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleSaveData(e, "Profil")}
                        className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)] w-max"
                      >
                        Simpan Perubahan
                      </button>
                    </div>

                    {/* Foto Kanan */}
                    <div className="w-full md:w-1/3 flex flex-col items-center border-b md:border-b-0 md:border-l border-white/10 pb-8 md:pb-0 md:pl-8 pt-4">
                      <div className="relative group cursor-pointer mb-6">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 font-black text-white text-4xl shadow-[0_0_30px_rgba(168,85,247,0.3)] border-4 border-zinc-900 overflow-hidden">
                          AZ
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white" size={32} />
                        </div>
                      </div>
                      <button className="rounded-lg border border-white/20 bg-transparent px-6 py-2 text-sm font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                        <Upload size={16} /> Pilih Gambar
                      </button>
                      <p className="text-[10px] text-zinc-500 text-center mt-3">
                        Ukuran gambar: maks. 1 MB
                        <br />
                        Format gambar: .JPEG, .PNG
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 2: ALAMAT & KARTU --- */}
            {activeTab === "Alamat & Kartu" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                {/* Section Alamat */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="text-purple-400" size={20} /> Buku
                      Alamat
                    </h3>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Plus size={18} /> Tambah Alamat Baru
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="relative rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 overflow-hidden">
                      <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                        Utama (AI Default)
                      </div>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-col pr-12">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">
                              Achmad Zacky Ghoutsu Zamani
                            </span>
                            <span className="text-zinc-500">|</span>
                            <span className="text-xs text-zinc-400">
                              (+62) 812 3456 7890
                            </span>
                          </div>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            Jl. Panglima Sudirman No. 123, Perumahan Graha
                            Bunder Asri, Gresik, Jawa Timur, 61111. (Rumah cat
                            putih pagar hitam).
                          </p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <button className="text-sm font-bold text-cyan-400 hover:text-cyan-300">
                            Ubah
                          </button>
                          <button className="text-sm font-bold text-red-500 hover:text-red-400">
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Kartu */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="text-emerald-400" size={20} />{" "}
                      Kartu Kredit / Debit
                    </h3>
                    <button
                      onClick={() => setIsCardModalOpen(true)}
                      className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20 active:scale-95 transition-all border border-white/5"
                    >
                      <Plus size={18} /> Tambahkan Kartu Baru
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                    <CreditCard size={40} className="text-zinc-600 mb-3" />
                    <span className="text-sm text-zinc-500">
                      Kamu belum memiliki kartu yang terdaftar
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 3: NOTIFIKASI (V1: Email & In-App) --- */}
            {activeTab === "Notifikasi" && (
              <div className="animate-in fade-in duration-500 rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Bell className="text-yellow-400" size={20} /> Preferensi
                  Notifikasi
                </h3>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex flex-col max-w-[80%]">
                      <span className="text-sm font-bold text-white">
                        Update Status Pesanan (In-App & Email)
                      </span>
                      <span className="text-xs text-zinc-400 mt-1">
                        Dapatkan notifikasi real-time ke sistem Nexia dan Email
                        Anda saat Seller memproses, mengirim, atau mengubah
                        status pesanan Anda.
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

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col max-w-[80%]">
                      <span className="text-sm font-bold text-white">
                        Promo & Voucher Nexia AI
                      </span>
                      <span className="text-xs text-zinc-400 mt-1">
                        Izinkan AI kami mengirimkan rekomendasi produk dan
                        voucher kilat eksklusif khusus untuk Anda ke Email
                        terdaftar.
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

            {/* --- TAB 4: KEAMANAN --- */}
            {activeTab === "Keamanan" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6">
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
                        Ganti kata sandi secara berkala untuk menjaga keamanan
                        akun Anda.
                      </span>
                    </div>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="rounded-xl border border-white/10 bg-black/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors active:scale-95"
                    >
                      Ubah Kata Sandi
                    </button>
                  </div>
                </div>

                {/* AI Security Log */}
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
                          Chrome Browser on Windows 11
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

      {/* ========================================= */}
      {/* 🚀 MODALS SECTION (THE SECURE OVERLAYS)  */}
      {/* ========================================= */}

      {/* 1. MODAL TAMBAH ALAMAT */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsAddressModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-2xl bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
              <h2 className="text-lg font-bold text-white">Alamat Baru</h2>
            </div>
            <form
              onSubmit={(e) => handleSaveData(e, "Alamat")}
              className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-cyan-500"
                />
                <input
                  type="tel"
                  placeholder="Nomor Telepon"
                  required
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>
              <select
                required
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-cyan-500 appearance-none"
              >
                <option value="" disabled selected>
                  Provinsi, Kota, Kecamatan, Kode Pos
                </option>
                <option value="1">
                  Jawa Timur, Kab. Gresik, Gresik, 61111
                </option>
                <option value="2">
                  Jawa Timur, Kota Surabaya, Gubeng, 60281
                </option>
              </select>
              <input
                type="text"
                placeholder="Nama Jalan, Gedung, No. Rumah"
                required
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Detail Lainnya (Cth: Blok / Unit No., Patokan)"
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-cyan-500"
              />

              <div className="mt-2">
                <span className="text-xs font-bold text-zinc-500 uppercase">
                  Tandai Sebagai:
                </span>
                <div className="flex gap-3 mt-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="label"
                      className="peer sr-only"
                      defaultChecked
                    />
                    <div className="rounded-xl border border-white/10 p-3 text-center text-sm font-medium text-zinc-400 peer-checked:border-cyan-500 peer-checked:bg-cyan-500/10 peer-checked:text-cyan-400 transition-all">
                      Rumah
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="label" className="peer sr-only" />
                    <div className="rounded-xl border border-white/10 p-3 text-center text-sm font-medium text-zinc-400 peer-checked:border-cyan-500 peer-checked:bg-cyan-500/10 peer-checked:text-cyan-400 transition-all">
                      Kantor
                    </div>
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-3 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-black text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-900"
                />
                <span className="text-sm text-zinc-300">
                  Atur sebagai alamat utama
                </span>
              </label>

              <div className="flex justify-end gap-3 mt-6 border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:bg-white/5 transition-colors"
                >
                  Nanti Saja
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                >
                  OK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL TAMBAH KARTU (MIDTRANS STYLE) */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsCardModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-lg bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-black/20">
              <h2 className="text-lg font-bold text-white">Tambahkan Kartu</h2>
            </div>
            <form
              onSubmit={(e) => handleSaveData(e, "Kartu Kredit")}
              className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]"
            >
              <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mb-2">
                <ShieldCheck className="text-emerald-400 shrink-0" size={20} />
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  <strong className="text-emerald-400">
                    Detail kartu Anda terlindungi dengan aman.
                  </strong>
                  <br />
                  Kami bekerja sama dengan Midtrans Gateway untuk memastikan
                  informasi kartu Anda tetap rahasia. Nexia tidak menyimpan data
                  kartu Anda.
                </p>
              </div>

              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-white">
                  Rincian Kartu
                </span>
                <div className="flex gap-2">
                  <div className="text-[10px] font-black italic bg-white text-blue-800 px-2 py-0.5 rounded">
                    VISA
                  </div>
                  <div className="text-[10px] font-black italic bg-white text-red-600 px-2 py-0.5 rounded flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 -mr-1 mix-blend-multiply"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mix-blend-multiply"></div>
                  </div>
                </div>
              </div>

              <input
                type="text"
                placeholder="Nomor Kartu"
                required
                maxLength={16}
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-cyan-500 tracking-widest font-mono"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Tanggal Kedaluwarsa (BB/TT)"
                  required
                  maxLength={5}
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  required
                  maxLength={3}
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>
              <input
                type="text"
                placeholder="Nama di Kartu"
                required
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-cyan-500 uppercase"
              />

              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded border-white/20 bg-black text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-900 mt-1"
                />
                <span className="text-xs text-zinc-400 leading-relaxed">
                  Dengan klik "Kirimkan", kamu bersedia memberikan data sesuai
                  Kebijakan Privasi dan Syarat & Ketentuan Nexia Secure Payment.
                </span>
              </label>

              <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:bg-white/5 transition-colors"
                >
                  Nanti Saja
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-cyan-600 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                >
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL UBAH PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsPasswordModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock size={18} className="text-rose-400" /> Ubah Kata Sandi
              </h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => handleSaveData(e, "Kata Sandi")}
              className="p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  required
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-rose-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-rose-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-sm text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                >
                  Simpan Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
