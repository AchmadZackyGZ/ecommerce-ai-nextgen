import { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  Settings,
  Sparkles,
  Ticket,
  ShieldCheck,
  Search,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { Link } from "react-router";

export const meta = () =>
  generateMeta(
    "Pesanan Saya",
    "Pantau dan kelola seluruh transaksi Nexia Anda.",
  );

// 📦 DATA DUMMY PESANAN (Simulasi Database)
const DUMMY_ORDERS = [
  {
    id: "INV-20260314-001",
    storeName: "Sony Official Store",
    status: "BELUM_BAYAR",
    date: "14 Mar 2026",
    totalAmount: 11650000,
    items: [
      {
        name: "Sony WH-1000XM5 Noise Cancelling",
        variant: "Desert Gold, + Premium Hardcase",
        qty: 2,
        price: 5825000,
        image:
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=200",
      },
    ],
  },
  {
    id: "INV-20260310-089",
    storeName: "Keychron Indonesia",
    status: "DIKIRIM",
    date: "10 Mar 2026",
    totalAmount: 2850000,
    items: [
      {
        name: "Mechanical Keyboard Keychron Q1 Pro",
        variant: "Carbon Black, Brown Switch",
        qty: 1,
        price: 2850000,
        image:
          "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=200",
      },
    ],
  },
  {
    id: "INV-20260228-402",
    storeName: "Apple Authorized Reseller",
    status: "SELESAI",
    date: "28 Feb 2026",
    totalAmount: 12500000,
    items: [
      {
        name: "Apple Watch Ultra 2",
        variant: "Alpine Loop - Blue",
        qty: 1,
        price: 12500000,
        image:
          "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=200",
      },
    ],
  },
];

const TABS = ["Semua", "Belum Bayar", "Dikemas", "Dikirim", "Selesai", "Batal"];

export default function OrderDashboard() {
  const [activeTab, setActiveTab] = useState("Semua");

  // Filter logika
  const filteredOrders = DUMMY_ORDERS.filter((order) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Belum Bayar" && order.status === "BELUM_BAYAR")
      return true;
    if (activeTab === "Dikemas" && order.status === "DIKEMAS") return true;
    if (activeTab === "Dikirim" && order.status === "DIKIRIM") return true;
    if (activeTab === "Selesai" && order.status === "SELESAI") return true;
    if (activeTab === "Batal" && order.status === "BATAL") return true;
    return false;
  });

  // Cek apakah ada barang yang sedang dikirim untuk trigger AI Widget
  const hasShippedOrders = DUMMY_ORDERS.some((o) => o.status === "DIKIRIM");

  // Helper Render Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "BELUM_BAYAR":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500 border border-yellow-500/20">
            <Clock size={14} /> Menunggu Pembayaran
          </span>
        );
      case "DIKEMAS":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
            <Package size={14} /> Sedang Dikemas
          </span>
        );
      case "DIKIRIM":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20">
            <Truck size={14} /> Sedang Dikirim
          </span>
        );
      case "SELESAI":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={14} /> Pesanan Selesai
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen pb-40 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 🛡️ KOLOM KIRI: SIDEBAR PROFIL KACA BURAM */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-2xl shadow-2xl">
              {/* Profil Singkat */}
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

              {/* Menu Navigasi */}
              <nav className="flex flex-col gap-2">
                <Link
                  to="/pesanan"
                  className="group flex items-center justify-between rounded-xl bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-400 border border-cyan-500/20 transition-all"
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

          {/* 🍱 KOLOM KANAN: THE MAIN DASHBOARD */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* 🤖 THE AI PREDICTION WIDGET (Muncul jika ada pesanan Dikirim) */}
            {(activeTab === "Semua" || activeTab === "Dikirim") &&
              hasShippedOrders && (
                <div className="animate-in slide-in-from-top-4 flex items-center justify-between gap-4 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-cyan-900/20 p-5 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                  <div className="flex items-start md:items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-400">
                      <Sparkles size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        Nexia Neural Tracking{" "}
                        <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] uppercase text-purple-300">
                          Live
                        </span>
                      </h3>
                      <p className="mt-1 text-xs md:text-sm text-zinc-300 leading-relaxed">
                        AI kami memprediksi pesanan{" "}
                        <strong className="text-white">Keychron Q1 Pro</strong>{" "}
                        Anda akan tiba <strong>2 hari lebih cepat</strong> dari
                        estimasi kurir reguler karena kondisi lalu lintas
                        logistik yang lengang.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* NEON STATUS TABS */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-2 backdrop-blur-md">
              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                      activeTab === tab
                        ? "bg-zinc-800 text-white shadow-md"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* DAFTAR KARTU PESANAN */}
            <div className="flex flex-col gap-6">
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/20 py-20 text-center">
                  <Search size={48} className="mb-4 text-zinc-600" />
                  <h3 className="text-lg font-bold text-white">
                    Tidak ada pesanan di kategori ini
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Ayo belanja dan penuhi teknologi masa depan Anda!
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col rounded-3xl border border-white/10 bg-zinc-900/30 p-5 md:p-6 backdrop-blur-xl transition-all hover:border-white/20"
                  >
                    {/* Header Kartu */}
                    <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        <span className="font-bold text-white">
                          {order.storeName}
                        </span>
                        <span className="hidden md:inline-block text-zinc-600">
                          •
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                          {order.date}
                        </span>
                        <span className="hidden md:inline-block text-zinc-600">
                          •
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                          {order.id}
                        </span>
                      </div>
                      {renderStatusBadge(order.status)}
                    </div>

                    {/* Body Kartu (Item List) */}
                    <div className="flex flex-col gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <h4 className="text-sm md:text-base font-bold text-white">
                              {item.name}
                            </h4>
                            <p className="mt-1 text-xs text-zinc-400">
                              Varian: {item.variant}
                            </p>
                            <span className="mt-1 text-xs text-zinc-500">
                              {item.qty} Barang x Rp{" "}
                              {item.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="hidden md:block text-right">
                            <span className="text-xs text-zinc-500 block mb-1">
                              Total Harga
                            </span>
                            <span className="text-sm font-bold text-cyan-400">
                              Rp{" "}
                              {(item.price * item.qty).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Kartu (Aksi Dinamis) */}
                    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
                      <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                        <span className="text-xs text-zinc-500">
                          Total Pesanan:
                        </span>
                        <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                          Rp {order.totalAmount.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="w-full md:w-auto flex gap-3">
                        {order.status === "BELUM_BAYAR" && (
                          <button className="w-full md:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            Bayar Sekarang
                          </button>
                        )}
                        {order.status === "DIKIRIM" && (
                          <>
                            <button className="w-full md:w-auto rounded-xl border border-white/10 bg-transparent px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/5">
                              Lacak Resi
                            </button>
                            <button className="w-full md:w-auto rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-zinc-200">
                              Pesanan Diterima
                            </button>
                          </>
                        )}
                        {order.status === "SELESAI" && (
                          <>
                            <button className="w-full md:w-auto rounded-xl border border-white/10 bg-transparent px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/5">
                              Beli Lagi
                            </button>
                            <button className="w-full md:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95">
                              Beri Ulasan
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
