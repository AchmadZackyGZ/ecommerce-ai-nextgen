import { useState, useEffect, useRef } from "react";
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
  Home,
  Briefcase,
  Monitor,
  Trash2,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { toast } from "sonner";
import { apiClient } from "~/services/apiClient";

export const meta = () =>
  generateMeta(
    "Pengaturan Akun",
    "Kelola profil, alamat, dan keamanan akun Nexia Anda.",
  );

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("Profil");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 🚀 FETCH DATA PROFIL (Tetap Hidup!)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get("/users/me");
        const user = res.data.data;
        setUserData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          avatarUrl: user.avatarUrl || "",
        });
      } catch (error) {
        console.error("Gagal mengambil profil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024)
        return toast.error("Ukuran gambar maksimal 2MB.");
      setNewAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      if (newAvatarFile) formData.append("avatar", newAvatarFile);

      const res = await apiClient.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = res.data.data;
      setUserData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        avatarUrl: updatedUser.avatarUrl || "",
      });
      setNewAvatarFile(null);
      toast.success(res.data.message || "Profil berhasil diperbarui!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan perubahan.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatar =
    avatarPreview ||
    userData.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`;

  // ==========================================
  // 🚧 DUMMY DATA UNTUK UI FASE 3 (SHOWCASE)
  // ==========================================
  const dummyAddresses = [
    {
      id: 1,
      label: "Rumah",
      receiver: "Achmad Zacky",
      phone: "081234567890",
      fullAddress:
        "Jl. Ketintang Baru No. 123, Gayungan, Surabaya, Jawa Timur 60231",
      isMain: true,
    },
    {
      id: 2,
      label: "Kantor",
      receiver: "Achmad Zacky (Resepsionis)",
      phone: "081987654321",
      fullAddress:
        "Gedung Nexia Tower Lt. 5, Jl. Basuki Rahmat, Surabaya, Jawa Timur 60271",
      isMain: false,
    },
  ];

  const dummyCards = [
    {
      id: 1,
      type: "visa",
      number: "**** **** **** 4242",
      expiry: "12/28",
      bank: "BCA",
    },
    {
      id: 2,
      type: "mastercard",
      number: "**** **** **** 5555",
      expiry: "08/27",
      bank: "Mandiri",
    },
  ];

  const dummyNotifications = [
    {
      id: 1,
      type: "promo",
      title: "Voucher Cashback 50% Hampir Habis!",
      desc: "Segera gunakan voucher Anda sebelum jam 23:59 malam ini.",
      time: "2 jam lalu",
      read: false,
    },
    {
      id: 2,
      type: "system",
      title: "Login Baru Terdeteksi",
      desc: "Akun Anda baru saja login dari perangkat Mac OS di Jakarta.",
      time: "1 hari lalu",
      read: true,
    },
    {
      id: 3,
      type: "chat",
      title: "Pesan dari Zacky Premium Store",
      desc: "'Halo kak, barangnya ready ya silakan diorder...'",
      time: "3 hari lalu",
      read: true,
    },
  ];

  const dummyDevices = [
    {
      id: 1,
      device: "Windows PC - Chrome",
      location: "Surabaya, Indonesia",
      time: "Sedang Aktif",
      current: true,
      icon: <Monitor size={20} />,
    },
    {
      id: 2,
      device: "iPhone 15 Pro - Safari",
      location: "Surabaya, Indonesia",
      time: "Kemarin, 14:30 WIB",
      current: false,
      icon: <Smartphone size={20} />,
    },
  ];

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400"></div>
      </div>
    );

  return (
    <main className="min-h-screen pb-40 pt-28 relative">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 🛡️ SIDEBAR KIRI */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-800 overflow-hidden shadow-lg border-2 border-white/10">
                  <img
                    src={currentAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-white leading-tight line-clamp-1">
                    {userData.name || "Customer Nexia"}
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
            <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-2 backdrop-blur-md overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 min-w-max">
                {["Profil", "Alamat & Kartu", "Notifikasi", "Keamanan"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === tab ? "bg-zinc-800 text-white shadow-md border border-white/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* --- TAB 1: PROFIL (HIDUP / REAL DATA) --- */}
            {activeTab === "Profil" && (
              <form
                onSubmit={handleSaveProfile}
                className="animate-in fade-in duration-500 flex flex-col gap-6"
              >
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                    <User className="text-cyan-400" size={20} /> Informasi
                    Pribadi
                  </h3>
                  <div className="flex flex-col-reverse md:flex-row gap-10">
                    <div className="flex-1 grid grid-cols-1 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) =>
                            setUserData({ ...userData, name: e.target.value })
                          }
                          className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Email Terverifikasi
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          disabled
                          className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-emerald-400 font-medium cursor-not-allowed"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Nomor Telepon
                        </label>
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) =>
                            setUserData({ ...userData, phone: e.target.value })
                          }
                          placeholder="Contoh: 081234567890"
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] w-max disabled:opacity-50"
                      >
                        {isSaving ? "Menyinkronkan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                    <div className="w-full md:w-1/3 flex flex-col items-center border-b md:border-b-0 md:border-l border-white/10 pb-8 md:pb-0 md:pl-8 pt-4">
                      <div
                        className="relative group cursor-pointer mb-6"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-zinc-800 border-4 border-zinc-900 overflow-hidden">
                          <img
                            src={currentAvatar}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white" size={32} />
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/jpeg, image/png"
                          className="hidden"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg border border-white/20 bg-transparent px-6 py-2 text-sm font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <Upload size={16} /> Pilih Gambar
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* --- TAB 2: ALAMAT & KARTU (MOCKUP UI) --- */}
            {activeTab === "Alamat & Kartu" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                {/* Section Alamat */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="text-cyan-400" size={20} /> Alamat
                      Pengiriman
                    </h3>
                    <button className="flex items-center gap-1 text-sm font-bold text-cyan-400 hover:text-cyan-300">
                      <Plus size={16} /> Tambah Alamat
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {dummyAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-colors"
                      >
                        {addr.isMain && (
                          <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-400 text-[10px] font-black px-3 py-1 rounded-bl-xl border-b border-l border-cyan-500/30 uppercase tracking-widest">
                            Utama
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                          {addr.label === "Rumah" ? (
                            <Home size={14} className="text-zinc-400" />
                          ) : (
                            <Briefcase size={14} className="text-zinc-400" />
                          )}
                          {addr.label}
                        </div>
                        <div className="flex flex-col text-sm text-zinc-400 mt-2">
                          <span className="font-bold text-zinc-300">
                            {addr.receiver}{" "}
                            <span className="font-normal text-zinc-500">
                              | {addr.phone}
                            </span>
                          </span>
                          <span className="mt-1 leading-relaxed">
                            {addr.fullAddress}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 text-sm font-bold">
                          <button className="text-cyan-400 hover:text-cyan-300">
                            Ubah
                          </button>
                          {!addr.isMain && (
                            <button className="text-red-400 hover:text-red-300">
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Kartu Kredit */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="text-cyan-400" size={20} /> Kartu
                      Kredit / Debit
                    </h3>
                    <button className="flex items-center gap-1 text-sm font-bold text-cyan-400 hover:text-cyan-300">
                      <Plus size={16} /> Tambah Kartu
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dummyCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-black p-5 h-32 relative overflow-hidden group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xl font-black italic text-zinc-400">
                            {card.type.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-zinc-500">
                            {card.bank}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-lg font-mono text-zinc-300 tracking-widest">
                            {card.number}
                          </span>
                          <span className="text-xs font-bold text-zinc-500 border border-white/10 px-2 py-1 rounded-md">
                            {card.expiry}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 3: NOTIFIKASI (MOCKUP UI) --- */}
            {activeTab === "Notifikasi" && (
              <div className="animate-in fade-in duration-500 rounded-3xl border border-white/10 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell className="text-cyan-400" size={20} /> Pusat
                    Notifikasi
                  </h3>
                  <button className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">
                    Tandai semua dibaca
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {dummyNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex gap-4 p-4 rounded-2xl transition-colors cursor-pointer border ${notif.read ? "bg-transparent border-transparent hover:bg-white/5" : "bg-cyan-500/5 border-cyan-500/20"}`}
                    >
                      <div className="mt-1">
                        {notif.type === "promo" && (
                          <Ticket size={24} className="text-rose-400" />
                        )}
                        {notif.type === "system" && (
                          <Activity size={24} className="text-emerald-400" />
                        )}
                        {notif.type === "chat" && (
                          <Bell size={24} className="text-cyan-400" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-start">
                          <h4
                            className={`text-sm font-bold ${notif.read ? "text-zinc-300" : "text-white"}`}
                          >
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-zinc-500 whitespace-nowrap ml-2">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {notif.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- TAB 4: KEAMANAN (MOCKUP UI) --- */}
            {activeTab === "Keamanan" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Lock className="text-cyan-400" size={20} /> Ganti Kata
                    Sandi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="password"
                      placeholder="Kata Sandi Saat Ini"
                      className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Kata Sandi Baru"
                      className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                  <button className="mt-4 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-colors border border-white/5">
                    Update Sandi
                  </button>
                </div>

                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Activity className="text-emerald-400" size={20} />{" "}
                    Aktivitas Login
                  </h3>
                  <p className="text-xs text-zinc-400 mb-6">
                    Daftar perangkat yang saat ini sedang masuk ke akun Nexia
                    Anda.
                  </p>

                  <div className="flex flex-col gap-4">
                    {dummyDevices.map((dev) => (
                      <div
                        key={dev.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-white/10">
                            {dev.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                              {dev.device}
                              {dev.current && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  Perangkat Ini
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {dev.location} • {dev.time}
                            </span>
                          </div>
                        </div>
                        {!dev.current && (
                          <button className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 w-full rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20">
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
