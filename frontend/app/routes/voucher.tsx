import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Ticket,
  Package,
  Settings,
  ChevronRight,
  ShieldCheck,
  Clock,
  Zap,
  Percent,
  Info,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { apiClient } from "~/services/apiClient";
import { toast } from "sonner";
import { useAuthStore } from "~/store/authStore"; // 🔥 Import State Global Anda

export const meta = () =>
  generateMeta(
    "Dompet Voucher",
    "Kelola diskon dan promo eksklusif Nexia Anda.",
  );

export default function VoucherWallet() {
  const [activeTab, setActiveTab] = useState("Aktif");

  // 🧠 STATE UNTUK MODAL VOUCHER
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  // 👑 STATE DINAMIS GLOBAL USER
  const user = useAuthStore((state: any) => state.user);

  // 🔥 STATE DINAMIS DARI DATABASE
  const [activeVouchers, setActiveVouchers] = useState<any[]>([]);
  const [expiredVouchers, setExpiredVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const openModal = (voucher: any) => setSelectedVoucher(voucher);
  const closeModal = () => setSelectedVoucher(null);

  // 💡 FUNGSI HELPER UNTUK INISIAL NAMA
  const getInitial = (name: string) => {
    if (!name) return "NX"; // fallback jika name kosong
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // 🔄 FUNGSI PENYEDOT DATA VOUCHER DARI POSTGRESQL
  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/vouchers/public");
      const allVouchers = res.data.data || [];

      const now = new Date();
      const active: any[] = [];
      const expired: any[] = [];

      allVouchers.forEach((v: any) => {
        // Ekstrak tanggal expired dari Backend
        const expiryDate = new Date(v.expiredAt);

        // 🔮 MAPPING MAGIC: Mencocokkan DTO Backend (VoucherResponse.java) ke UI Card
        const mappedVoucher = {
          id: v.id,
          code: v.code,
          title: `Diskon ${v.discountPercentage}% dari ${v.shopName}`, // Dinamis dari nama toko & persen diskon
          description: `Potongan harga spesial s/d Rp ${v.maxDiscountAmount?.toLocaleString("id-ID")} untuk produk di toko ${v.shopName}.`,
          type: "DISCOUNT", // Sesuai dengan fungsionalitas Backend saat ini
          minPurchase: 0, // Backend Anda belum punya minPurchase, diset 0 sementara
          quota: v.quota,
          validUntil:
            expiryDate.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) + " WIB",
          isExpiringSoon:
            expiryDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000, // Merah jika sisa < 24 jam!
          tnc: [
            `Diskon sebesar ${v.discountPercentage}%.`,
            `Maksimal potongan harga Rp ${v.maxDiscountAmount?.toLocaleString("id-ID")}.`,
            `Sisa Kuota Penggunaan global: ${v.quota} kali.`,
            `Eksklusif hanya untuk produk dari toko: ${v.shopName}.`,
            "Berlaku untuk semua metode pembayaran di Nexia.",
          ],
        };

        // Filter tab berdasarkan waktu & kuota
        if (expiryDate >= now && v.quota > 0) {
          active.push(mappedVoucher);
        } else {
          expired.push(mappedVoucher);
        }
      });

      setActiveVouchers(active);
      setExpiredVouchers(expired);
    } catch (error: any) {
      // Menangkap pesan error dari backend jika ada
      toast.error(
        error.response?.data?.message ||
          "Gagal memuat data voucher dari server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const renderVoucherIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "DISCOUNT":
        return <Percent size={28} className="text-purple-400" />;
      case "SHIPPING":
        return <Zap size={28} className="text-cyan-400" />;
      case "CASHBACK":
        return <Ticket size={28} className="text-yellow-400" />;
      default:
        return <Percent size={28} className="text-purple-400" />;
    }
  };

  return (
    <main className="min-h-screen pb-40 pt-28 relative">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 🛡️ SIDEBAR PROFIL */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 font-bold text-white shadow-lg text-xl">
                  {/* 🔥 NAMA INISIAL DINAMIS */}
                  {user ? getInitial(user.name) : "NX"}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-white leading-tight uppercase">
                    {/* 🔥 NAMA LENGKAP DINAMIS */}
                    {user ? user.name : "Guest"}
                  </h2>
                  <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-cyan-400 uppercase tracking-widest">
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
                  className="group flex items-center justify-between rounded-xl bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-400 border border-cyan-500/20 transition-all"
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
                  className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
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

          {/* 🎟️ THE VOUCHER WALLET */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex items-start md:items-center gap-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Nexia AI Auto-Apply
                </h3>
                <p className="mt-1 text-xs md:text-sm text-cyan-50/80 leading-relaxed">
                  Tidak perlu repot menyalin kode. Kumpulkan voucher di sini,
                  dan sistem AI kami akan otomatis memilihkannya untuk Anda saat
                  Checkout untuk diskon paling maksimal!
                </p>
              </div>
            </div>

            {/* PINTU KLAIM VOUCHER MANUAL */}
            <div className="flex flex-col md:flex-row gap-4 rounded-2xl border border-white/10 bg-zinc-900/40 p-5 backdrop-blur-md items-center justify-between">
              <div className="w-full md:w-auto">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Ticket size={18} className="text-purple-400" /> Klaim Voucher
                  Toko / Referal
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Punya kode rahasia dari Seller atau Livestream? Masukkan di
                  sini.
                </p>
              </div>
              <div className="flex w-full md:w-96 rounded-xl overflow-hidden border border-white/10 bg-black/40 focus-within:border-cyan-500/50 transition-colors">
                <input
                  type="text"
                  placeholder="Contoh: TokoElectronicZacky100..."
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder-zinc-600 font-mono uppercase"
                />
                <button
                  onClick={() =>
                    toast.success("Fitur klaim voucher segera hadir!")
                  }
                  className="bg-white text-black px-6 text-sm font-bold transition-colors hover:bg-zinc-200 active:scale-95"
                >
                  Klaim
                </button>
              </div>
            </div>

            <div className="flex gap-4 border-b border-white/10 pb-px">
              <button
                onClick={() => setActiveTab("Aktif")}
                className={`relative pb-3 text-sm font-bold transition-colors ${activeTab === "Aktif" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Voucher Aktif ({activeVouchers.length})
                {activeTab === "Aktif" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("Riwayat")}
                className={`relative pb-3 text-sm font-bold transition-colors ${activeTab === "Riwayat" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Riwayat & Kedaluwarsa ({expiredVouchers.length})
                {activeTab === "Riwayat" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
                )}
              </button>
            </div>

            {/* LOADING STATE */}
            {isLoading && (
              <div className="flex justify-center py-20">
                <span className="text-cyan-400 font-bold animate-pulse tracking-widest uppercase">
                  Menganalisis Brankas Voucher...
                </span>
              </div>
            )}

            {/* DAFTAR VOUCHER AKTIF */}
            {!isLoading && activeTab === "Aktif" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in duration-500">
                {activeVouchers.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/20 py-20 text-center">
                    <Ticket size={48} className="mb-4 text-zinc-600" />
                    <h3 className="text-lg font-bold text-white">
                      Dompet Kosong
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Belum ada voucher aktif yang bisa Anda gunakan.
                    </p>
                  </div>
                ) : (
                  activeVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      onClick={() => openModal(voucher)}
                      className="group relative flex h-36 cursor-pointer rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-lg transition-transform hover:-translate-y-1 hover:border-cyan-500/30"
                    >
                      <div className="flex w-28 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-zinc-800 bg-black/40 p-4 transition-colors group-hover:border-zinc-700">
                        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 shadow-inner group-hover:bg-zinc-700/50">
                          {renderVoucherIcon(voucher.type)}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          {voucher.type}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="line-clamp-1 text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {voucher.title}
                            </h4>
                            <div className="text-zinc-500 group-hover:text-cyan-400">
                              <Info size={16} />
                            </div>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                            {voucher.description}
                          </p>
                        </div>

                        <div className="flex items-end justify-between mt-2">
                          <div className="flex flex-col">
                            {voucher.minPurchase > 0 && (
                              <span className="text-[10px] text-zinc-500">
                                Min. Belanja Rp{" "}
                                {voucher.minPurchase.toLocaleString("id-ID")}
                              </span>
                            )}
                            <span
                              className={`mt-0.5 flex items-center gap-1 text-[11px] font-bold ${voucher.isExpiringSoon ? "text-red-400 animate-pulse" : "text-emerald-400"}`}
                            >
                              {voucher.isExpiringSoon ? (
                                <AlertCircle size={12} />
                              ) : (
                                <Clock size={12} />
                              )}
                              {voucher.validUntil}
                            </span>
                          </div>
                          <Link
                            to="/katalog"
                            onClick={(e) => e.stopPropagation()}
                            className="relative z-10 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105 active:scale-95"
                          >
                            Pakai
                          </Link>
                        </div>
                      </div>

                      <div className="absolute -top-3 left-[100px] h-6 w-6 rounded-full bg-zinc-950 border-b border-white/10 transition-colors group-hover:border-zinc-700"></div>
                      <div className="absolute -bottom-3 left-[100px] h-6 w-6 rounded-full bg-zinc-950 border-t border-white/10 transition-colors group-hover:border-zinc-700"></div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* DAFTAR VOUCHER KEDALUWARSA */}
            {!isLoading && activeTab === "Riwayat" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in duration-500">
                {expiredVouchers.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/20 py-20 text-center">
                    <Clock size={48} className="mb-4 text-zinc-600" />
                    <h3 className="text-lg font-bold text-white">
                      Riwayat Bersih
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Belum ada riwayat voucher yang hangus atau terpakai.
                    </p>
                  </div>
                ) : (
                  expiredVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="relative flex h-36 rounded-2xl bg-zinc-900/50 border border-white/5 overflow-hidden opacity-60 grayscale"
                    >
                      <div className="flex w-28 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-zinc-800 bg-black/20 p-4">
                        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
                          {renderVoucherIcon(voucher.type)}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <h4 className="line-clamp-1 text-sm font-bold text-white">
                            {voucher.title}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                            {voucher.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-red-500 mt-2">
                          <AlertCircle size={12} /> {voucher.validUntil}
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <div className="rotate-[-15deg] rounded border-2 border-red-500/50 px-3 py-1 text-xl font-black tracking-widest text-red-500/50">
                          {voucher.quota <= 0 ? "HABIS TERPAKAI" : "EXPIRED"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔮 THE HOLOGRAPHIC VOUCHER MODAL */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeModal}
          ></div>

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
            <div className="relative bg-gradient-to-r from-cyan-900/40 to-purple-900/40 p-6 text-center">
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-white/10 shadow-lg">
                {renderVoucherIcon(selectedVoucher.type)}
              </div>
              <h2 className="text-xl font-black text-white leading-tight">
                {selectedVoucher.title}
              </h2>
              <div className="mt-2 inline-block rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-sm font-bold text-cyan-400 tracking-wider">
                {selectedVoucher.code}
              </div>
            </div>

            <div className="p-6">
              <div
                className={`mb-6 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${selectedVoucher.isExpiringSoon ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}
              >
                {selectedVoucher.isExpiringSoon ? (
                  <AlertCircle size={18} className="animate-pulse" />
                ) : (
                  <Clock size={18} />
                )}
                Berlaku s/d: {selectedVoucher.validUntil}
              </div>

              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                Syarat & Ketentuan Sistem
              </div>
              <ul className="flex flex-col gap-3">
                {selectedVoucher.tnc.map((rule: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-zinc-300"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-cyan-500/50"
                    />
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/10 bg-black/20 p-6">
              <Link
                to="/katalog"
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                Belanja Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
