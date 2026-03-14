import { useState } from "react";
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

export const meta = () =>
  generateMeta(
    "Dompet Voucher",
    "Kelola diskon dan promo eksklusif Nexia Anda.",
  );

// 🎟️ DATA DUMMY VOUCHER DENGAN T&C
const ACTIVE_VOUCHERS = [
  {
    id: "V-AI-001",
    title: "Diskon Nexia AI Optimal",
    description: "Potongan Rp 50.000 untuk semua produk Elektronik & Gadget.",
    type: "DISCOUNT",
    minPurchase: 500000,
    validUntil: "Besok, 23:59 WIB",
    isExpiringSoon: true,
    tnc: [
      "Minimal transaksi Rp 500.000 (belum termasuk ongkir).",
      "Maksimal potongan harga Rp 50.000.",
      "Berlaku untuk semua metode pembayaran yang tersedia di Nexia.",
      "Hanya berlaku untuk kategori Gadget, Laptop, dan Audio.",
      "Voucher tidak dapat digabungkan dengan promo Flash Sale.",
    ],
  },
  {
    id: "V-SHIP-002",
    title: "Gratis Ongkir Premium",
    description:
      "Potongan ongkir s/d Rp 40.000 menggunakan Nexia Instant / Kargo.",
    type: "SHIPPING",
    minPurchase: 100000,
    validUntil: "30 Mar 2026",
    isExpiringSoon: false,
    tnc: [
      "Minimal transaksi Rp 100.000.",
      "Maksimal potongan ongkos kirim Rp 40.000.",
      "Hanya berlaku untuk kurir Nexia Instant dan Hemat Kargo.",
      "Berlaku untuk pengiriman ke seluruh wilayah Indonesia.",
    ],
  },
  {
    id: "V-CASH-003",
    title: "Cashback Koin Nexia 10%",
    description:
      "Cashback hingga 100.000 Koin untuk pembelian Aksesoris Komputer.",
    type: "CASHBACK",
    minPurchase: 250000,
    validUntil: "25 Mar 2026",
    isExpiringSoon: false,
    tnc: [
      "Minimal transaksi Rp 250.000.",
      "Maksimal Cashback yang diberikan adalah 100.000 Koin Nexia.",
      "Koin akan masuk otomatis setelah pesanan berstatus 'Selesai'.",
      "Koin memiliki masa berlaku 3 bulan setelah diterima.",
    ],
  },
];

const EXPIRED_VOUCHERS = [
  {
    id: "V-EXP-001",
    title: "Diskon Pengguna Baru",
    description: "Potongan Rp 100.000 khusus transaksi pertama.",
    type: "DISCOUNT",
    validUntil: "Berakhir pada 10 Mar 2026",
  },
];

export default function VoucherWallet() {
  const [activeTab, setActiveTab] = useState("Aktif");

  // 🧠 STATE UNTUK MODAL VOUCHER
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  const openModal = (voucher: any) => setSelectedVoucher(voucher);
  const closeModal = () => setSelectedVoucher(null);

  const renderVoucherIcon = (type: string) => {
    switch (type) {
      case "DISCOUNT":
        return <Percent size={28} className="text-purple-400" />;
      case "SHIPPING":
        return <Zap size={28} className="text-cyan-400" />;
      case "CASHBACK":
        return <Ticket size={28} className="text-yellow-400" />;
      default:
        return <Ticket size={28} className="text-white" />;
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

            {/* 🔥 NEW: PINTU KLAIM VOUCHER MANUAL */}
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
                  placeholder="Contoh: ZACKY100..."
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder-zinc-600 font-mono uppercase"
                />
                <button className="bg-white text-black px-6 text-sm font-bold transition-colors hover:bg-zinc-200 active:scale-95">
                  Klaim
                </button>
              </div>
            </div>

            <div className="flex gap-4 border-b border-white/10 pb-px">
              <button
                onClick={() => setActiveTab("Aktif")}
                className={`relative pb-3 text-sm font-bold transition-colors ${activeTab === "Aktif" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Voucher Aktif ({ACTIVE_VOUCHERS.length})
                {activeTab === "Aktif" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("Riwayat")}
                className={`relative pb-3 text-sm font-bold transition-colors ${activeTab === "Riwayat" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Riwayat & Kedaluwarsa
                {activeTab === "Riwayat" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
                )}
              </button>
            </div>

            {/* DAFTAR VOUCHER AKTIF */}
            {activeTab === "Aktif" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in duration-500">
                {ACTIVE_VOUCHERS.map((voucher) => (
                  <div
                    key={voucher.id}
                    onClick={() => openModal(voucher)} // 🔥 Klik di mana saja pada kartu memicu Modal
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
                          {/* Tombol Info kini menjadi indikator visual klik */}
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
                          <span className="text-[10px] text-zinc-500">
                            Min. Belanja Rp{" "}
                            {voucher.minPurchase.toLocaleString("id-ID")}
                          </span>
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
                        {/* Tombol Pakai menggunakan e.stopPropagation agar tidak men-trigger Modal saat mau pindah ke katalog */}
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
                ))}
              </div>
            )}

            {/* DAFTAR VOUCHER KEDALUWARSA */}
            {activeTab === "Riwayat" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in duration-500">
                {EXPIRED_VOUCHERS.map((voucher) => (
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
                        EXPIRED
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔮 THE HOLOGRAPHIC VOUCHER MODAL */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur Gelap */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeModal}
          ></div>

          {/* Panel Modal */}
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
            {/* Header Biru/Ungu */}
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
              <p className="mt-2 text-sm text-cyan-100/80">
                {selectedVoucher.description}
              </p>
            </div>

            {/* Body: Expiry & T&C */}
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
                Syarat & Ketentuan
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

            {/* Footer Action */}
            <div className="border-t border-white/10 bg-black/20 p-6">
              <Link
                to="/katalog"
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                Gunakan Voucher Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
