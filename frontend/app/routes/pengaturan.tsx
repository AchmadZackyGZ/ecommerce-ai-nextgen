import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
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
import { useAuthStore } from "~/store/authStore";

export const meta = () =>
  generateMeta(
    "Pengaturan Akun",
    "Kelola profil, alamat, dan keamanan akun Nexia Anda.",
  );

export default function AccountSettings() {
  // tab state dari URL
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabFromUrl || "Profil");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set active tab from URL
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // 📦 STATE DATA GLOBAL
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  //  STATE DINAMIS DARI DATABASE
  const user = useAuthStore((state: any) => state.user);

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

  // State Form Kartu Baru real data api midtrans
  const [newCard, setNewCard] = useState({
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    bankName: "BCA",
  });

  // state untuk keamanan
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [devices, setDevices] = useState<any[]>([]);

  //  INJEKSI SCRIPT MIDTRANS API
  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const scriptId = "midtrans-script";

    // 1. Cek apakah script sudah ada (Mencegah bentrok dengan React Strict Mode)
    let cardScript = document.getElementById(
      scriptId,
    ) as HTMLScriptElement | null;

    if (!cardScript) {
      cardScript = document.createElement("script");
      cardScript.id = scriptId; // 🔥 KUNCI UTAMA: Midtrans MENCARI ID INI!
      cardScript.src =
        "https://api.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js";
      cardScript.setAttribute("data-environment", "sandbox");
      cardScript.setAttribute("data-client-key", clientKey);
      cardScript.async = true;
      document.body.appendChild(cardScript);
    }

    // 🔥 PENTING: Kita sengaja TIDAK menghapus script di return cleanup
    // Agar Midtrans tidak terbunuh di tengah jalan oleh React Strict Mode.
  }, []);

  //  FETCH SEMUA DATA (PROFIL, ALAMAT, KARTU)
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [userRes, addressRes, cardRes, devicesRes] = await Promise.all([
        apiClient.get("/users/me"),
        apiClient.get("/addresses"),
        apiClient.get("/cards"),
        apiClient.get("/users/devices"),
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
      setDevices(devicesRes.data.data || []);
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

  // --- HANDLER KARTU KREDIT (REAL MIDTRANS INTEGRATION) ---
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.cardNumber.length < 16)
      return toast.error("Nomor kartu tidak valid.");

    // @ts-ignore
    if (typeof window.MidtransNew3ds === "undefined") {
      return toast.error(
        "Sistem keamanan Midtrans sedang dimuat. Harap tunggu sebentar.",
      );
    }

    setIsSaving(true);
    toast.info("Memverifikasi keamanan kartu Anda...");

    // @ts-ignore
    window.MidtransNew3ds.getCardToken(
      {
        card_number: newCard.cardNumber,
        card_exp_month: newCard.expMonth,
        card_exp_year: newCard.expYear,
        card_cvv: newCard.cvv,
      },
      //  Gunakan Object { onSuccess, onFailure } untuk versi 3DS!
      {
        onSuccess: async function (response: any) {
          try {
            const finalToken = response.saved_token_id || response.token_id;

            if (!finalToken) {
              toast.error(
                "Midtrans gagal memberikan Token Keamanan. Coba gunakan kartu lain.",
              );
              return;
            }

            const payload = {
              bankName: newCard.bankName,
              cardType: "Kredit",
              maskedNumber:
                response.masked_card ||
                `**** **** **** ${newCard.cardNumber.slice(-4)}`,
              savedTokenId: finalToken,
            };

            //  SEKARANG, REACT PASTI AKAN MENEMBAK POST INI!
            await apiClient.post("/cards", payload);

            toast.success("Kartu berhasil diverifikasi dan berhasil disimpan");
            setIsCardModalOpen(false);
            setNewCard({
              cardNumber: "",
              expMonth: "",
              expYear: "",
              cvv: "",
              bankName: "BCA",
            });
            fetchAllData();
          } catch (backendError: any) {
            console.error("Backend Error:", backendError);
            toast.error(
              backendError.response?.data?.message ||
                "Gagal menyimpan kartu di sistem Nexia. Cek terminal Spring Boot Anda.",
            );
          } finally {
            setIsSaving(false);
          }
        },
        onFailure: function (response: any) {
          console.error("Midtrans Error:", response);
          toast.error(
            response.status_message ||
              "Kartu ditolak oleh sistem keamanan bank.",
          );
          setIsSaving(false);
        },
      },
    );
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("Konfirmasi password baru tidak cocok!");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error("Password baru minimal 6 karakter!");
    }

    try {
      setIsSaving(true);
      const payload = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      };

      const response = await apiClient.put("/users/password", payload);
      toast.success(response.data.message || "Password berhasil diubah!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah password.");
    } finally {
      setIsSaving(false);
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
                    <ShieldCheck size={14} /> {user?.role || "Member"}
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
            {/* TAB KEAMANAN (FASE 3) */}
            {activeTab === "Keamanan" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* --- 1. KOTAK GANTI PASSWORD --- */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Lock className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Ubah Password
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Pastikan akun Anda selalu aman.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Password Lama
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordForm.oldPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            oldPassword: e.target.value,
                          })
                        }
                        className="bg-black/50 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-cyan-500"
                        placeholder="Masukkan password saat ini"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Password Baru
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="bg-black/50 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-cyan-500"
                          placeholder="Minimal 6 karakter"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Konfirmasi Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="bg-black/50 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-cyan-500"
                          placeholder="Ulangi password baru"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-3 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 transition-colors"
                      >
                        {isSaving ? "Menyimpan..." : "Simpan Password Baru"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* --- 2. KOTAK PERANGKAT TERHUBUNG --- */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Smartphone className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Perangkat Terhubung
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Daftar perangkat yang masuk ke akun Anda.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {devices.length === 0 ? (
                      <p className="text-center text-zinc-500 py-6">
                        Memuat data perangkat Akun Anda...
                      </p>
                    ) : (
                      devices.map((device, index) => {
                        const isMobile = device.userAgent
                          .toLowerCase()
                          .includes("mobile");
                        const isCurrent = index === 0;
                        return (
                          <div
                            key={device.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-black/50"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                {isMobile ? (
                                  <Smartphone className="text-zinc-400" />
                                ) : (
                                  <Monitor className="text-zinc-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-white flex items-center gap-2">
                                  {device.userAgent.split(" ")[0]}{" "}
                                  {isMobile ? "Mobile" : "Desktop"}
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                      Sekarang
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} /> IP: {device.ipAddress}
                                  </span>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="flex items-center gap-1">
                                    <Activity size={12} />{" "}
                                    {new Date(device.lastLogin).toLocaleString(
                                      "id-ID",
                                    )}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
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

      {/* 💳 MODAL TAMBAH KARTU KREDIT */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddCard}
            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <CreditCard className="text-cyan-400" /> Tambah Kartu Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* SECURITY TRUST BADGE */}
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6">
              <ShieldCheck size={24} className="text-emerald-400 shrink-0" />
              <p className="text-[11px] text-emerald-400/90 leading-tight">
                Informasi kartu Anda dilindungi oleh enkripsi PCI-DSS tingkat
                bank dan tidak disimpan secara mentah di server kami.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Nama Bank
                </label>
                <select
                  value={newCard.bankName}
                  onChange={(e) =>
                    setNewCard({ ...newCard, bankName: e.target.value })
                  }
                  className="bg-black/50 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Nomor Kartu
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={16}
                    required
                    placeholder="0000 0000 0000 0000"
                    value={newCard.cardNumber}
                    onChange={(e) =>
                      setNewCard({
                        ...newCard,
                        cardNumber: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 p-3.5 pl-10 rounded-xl text-white outline-none focus:border-cyan-500 font-mono tracking-widest"
                  />
                  <CreditCard
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Masa Berlaku
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={2}
                      required
                      placeholder="MM"
                      value={newCard.expMonth}
                      onChange={(e) =>
                        setNewCard({
                          ...newCard,
                          expMonth: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-cyan-500 font-mono text-center"
                    />
                    <span className="text-zinc-500 font-bold">/</span>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      placeholder="YYYY"
                      value={newCard.expYear}
                      onChange={(e) =>
                        setNewCard({
                          ...newCard,
                          expYear: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-cyan-500 font-mono text-center"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={3}
                    required
                    placeholder="•••"
                    value={newCard.cvv}
                    onChange={(e) =>
                      setNewCard({
                        ...newCard,
                        cvv: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-cyan-500 font-mono text-center tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2"
              >
                {isSaving ? (
                  "Memverifikasi..."
                ) : (
                  <>
                    <ShieldCheck size={18} /> Simpan Kartu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
