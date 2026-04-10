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
  Upload,
  Home,
  Briefcase,
  Monitor,
  Trash2,
  X,
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
  const [activeTab, setActiveTab] = useState("Profil"); // Default tab "Alamat & Kartu"
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 📦 STATE DATA GLOBAL
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State Profil
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // State Alamat & Kartu Asli dari Backend
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  // State Modals
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // State Form Alamat Baru
  const [newAddress, setNewAddress] = useState({
    label: "Rumah",
    recipientName: "",
    phoneNumber: "",
    province: "",
    city: "",
    district: "",
    postalCode: "",
    streetDetails: "",
    otherDetails: "",
    isPrimary: false,
  });

  // State Form Kartu Baru (Simulator Midtrans)
  const [newCard, setNewCard] = useState({
    bankName: "BCA",
    cardType: "VISA",
    last4Digits: "",
  });

  //  FETCH SEMUA DATA (PROFIL, ALAMAT, KARTU)
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [userRes, addressRes, cardRes] = await Promise.all([
        apiClient.get("/users/me"),
        apiClient.get("/addresses"),
        apiClient.get("/cards"),
      ]);

      const user = userRes.data.data;
      setUserData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
      });
      setAddresses(addressRes.data.data || []);
      setCards(cardRes.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- HANDLER PROFIL ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024)
        return toast.error("Ukuran gambar maksimal 10MB.");
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
      toast.success("Profil berhasil diperbarui!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- HANDLER ALAMAT ---
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await apiClient.post("/addresses", newAddress);
      toast.success("Alamat berhasil ditambahkan!");
      setIsAddressModalOpen(false);
      fetchAllData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menambah alamat.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Yakin ingin menghapus alamat ini?")) return;
    try {
      await apiClient.delete(`/addresses/${id}`);
      toast.success("Alamat dihapus.");
      fetchAllData();
    } catch (error: any) {
      toast.error("Gagal menghapus alamat.");
    }
  };

  // --- HANDLER KARTU KREDIT ---
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.last4Digits.length !== 4)
      return toast.error("Masukkan 4 digit terakhir kartu dengan benar.");

    try {
      setIsSaving(true);
      // SIMULASI RESPONSE MIDTRANS
      const payload = {
        bankName: newCard.bankName,
        cardType: newCard.cardType,
        maskedNumber: `**** **** **** ${newCard.last4Digits}`,
        // TODO: Ganti dengan response midtrans yang sebenarnya saat integrasi fase 3
        savedTokenId: `sim-token-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Token Dummy
      };

      await apiClient.post("/cards", payload);
      toast.success("Kartu berhasil disimpan dengan aman!");
      setIsCardModalOpen(false);
      setNewCard({ bankName: "BCA", cardType: "VISA", last4Digits: "" });
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan kartu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kartu ini dari sistem?")) return;
    try {
      await apiClient.delete(`/cards/${id}`);
      toast.success("Kartu berhasil dihapus.");
      fetchAllData();
    } catch (error: any) {
      toast.error("Gagal menghapus kartu.");
    }
  };

  const currentAvatar =
    avatarPreview ||
    userData.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`;

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
                <button className="group flex items-center justify-between rounded-xl bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-400 border border-cyan-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <Settings size={18} /> Pengaturan Akun
                  </div>
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
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

            {/* --- TAB 1: PROFIL --- */}
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
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
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

            {/* --- TAB 2: ALAMAT & KARTU (LIVE API) --- */}
            {activeTab === "Alamat & Kartu" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                {/* Section Alamat */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="text-cyan-400" size={20} /> Buku Alamat
                    </h3>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="flex items-center gap-1 text-sm font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-4 py-2 rounded-lg"
                    >
                      <Plus size={16} /> Tambah Alamat
                    </button>
                  </div>
                  {addresses.length === 0 ? (
                    <p className="text-center text-zinc-500 py-6">
                      Anda belum memiliki alamat tersimpan.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`flex flex-col gap-2 rounded-2xl border bg-black/30 p-5 relative overflow-hidden group transition-colors ${addr.primary ? "border-cyan-500/50" : "border-white/10 hover:border-cyan-500/30"}`}
                        >
                          {addr.primary && (
                            <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                              Utama
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-white font-bold text-sm">
                            {addr.label.toLowerCase().includes("rumah") ? (
                              <Home size={14} className="text-zinc-400" />
                            ) : (
                              <Briefcase size={14} className="text-zinc-400" />
                            )}
                            {addr.label}
                          </div>
                          <div className="flex flex-col text-sm text-zinc-400 mt-2">
                            <span className="font-bold text-zinc-300">
                              {addr.recipientName}{" "}
                              <span className="font-normal text-zinc-500">
                                | {addr.phoneNumber}
                              </span>
                            </span>
                            <span className="mt-1 leading-relaxed">
                              {addr.streetDetails}, Kec. {addr.district},{" "}
                              {addr.city}, {addr.province} {addr.postalCode}{" "}
                              {addr.otherDetails
                                ? `(${addr.otherDetails})`
                                : ""}
                            </span>
                          </div>
                          <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 text-sm font-bold">
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section Kartu Kredit */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="text-cyan-400" size={20} /> Kartu
                      Tersimpan (Maks 3)
                    </h3>
                    {cards.length < 3 && (
                      <button
                        onClick={() => setIsCardModalOpen(true)}
                        className="flex items-center gap-1 text-sm font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-4 py-2 rounded-lg"
                      >
                        <Plus size={16} /> Tambah Kartu
                      </button>
                    )}
                  </div>
                  {cards.length === 0 ? (
                    <p className="text-center text-zinc-500 py-6">
                      Tidak ada kartu yang tersimpan.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-black p-5 h-36 relative overflow-hidden group shadow-xl"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xl font-black italic text-zinc-300">
                              {card.cardType.toUpperCase()}
                            </span>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-500 mb-1">
                              {card.bankName}
                            </span>
                            <span className="text-lg font-mono text-cyan-400 tracking-widest">
                              {card.maskedNumber}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB NOTIFIKASI & KEAMANAN (Dibiarkan Dummy untuk Fase 3) */}
            {activeTab === "Notifikasi" && (
              <div className="p-10 text-center text-zinc-500">
                <Bell size={48} className="mx-auto mb-4 opacity-20" />
                Fitur Notifikasi segera hadir di Fase 3.
              </div>
            )}
            {activeTab === "Keamanan" && (
              <div className="p-10 text-center text-zinc-500">
                <Lock size={48} className="mx-auto mb-4 opacity-20" />
                Fitur Keamanan Login segera hadir di Fase 3.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔮 MODAL TAMBAH ALAMAT */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddAddress}
            className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="text-cyan-400" /> Tambah Alamat Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  Label (Cth: Rumah/Kantor)
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, label: e.target.value })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.recipientName}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      recipientName: e.target.value,
                    })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  required
                  value={newAddress.phoneNumber}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  Provinsi
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.province}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, province: e.target.value })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  Kota/Kabupaten
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  Kecamatan
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.district}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, district: e.target.value })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  Kode Pos
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.postalCode}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, postalCode: e.target.value })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-zinc-400">
                  Detail Jalan ALAMAT ANDA / Gedung
                </label>
                <textarea
                  required
                  value={newAddress.streetDetails}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      streetDetails: e.target.value,
                    })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500 h-20"
                ></textarea>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-zinc-400">
                  Patokan (Opsional)
                </label>
                <input
                  type="text"
                  value={newAddress.otherDetails}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      otherDetails: e.target.value,
                    })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2 mt-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={newAddress.isPrimary}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      isPrimary: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-cyan-500"
                />
                <label
                  htmlFor="isPrimary"
                  className="text-sm font-bold text-white cursor-pointer"
                >
                  Jadikan Alamat Utama
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Alamat"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🔮 MODAL SIMULATOR KARTU KREDIT (MIDTRANS DUMMY) */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddCard}
            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="text-cyan-400" /> Simulator Midtrans
              </h3>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-6 bg-black/50 p-3 rounded-lg border border-white/5">
              Ini adalah form simulasi. Di production, form ini akan digantikan
              oleh pop-up iframe resmi dari Midtrans untuk keamanan PCI-DSS.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  Pilih Bank
                </label>
                <select
                  value={newCard.bankName}
                  onChange={(e) =>
                    setNewCard({ ...newCard, bankName: e.target.value })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                >
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  Tipe Jaringan
                </label>
                <select
                  value={newCard.cardType}
                  onChange={(e) =>
                    setNewCard({ ...newCard, cardType: e.target.value })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                >
                  <option value="VISA">VISA</option>
                  <option value="MASTERCARD">MASTERCARD</option>
                  <option value="JCB">JCB</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-400">
                  4 Digit Terakhir Kartu
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="Cth: 4242"
                  value={newCard.last4Digits}
                  onChange={(e) =>
                    setNewCard({
                      ...newCard,
                      last4Digits: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500 font-mono tracking-widest text-lg"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-2"
              >
                <ShieldCheck size={18} />{" "}
                {isSaving ? "Menyimpan..." : "Simpan Aman"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
