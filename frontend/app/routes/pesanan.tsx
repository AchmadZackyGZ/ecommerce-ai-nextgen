import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Settings,
  Sparkles,
  Ticket,
  ShieldCheck,
  Search,
  XCircle,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { Link } from "react-router";
import { apiClient } from "~/services/apiClient";
import { toast } from "sonner";

export const meta = () =>
  generateMeta(
    "Pesanan Saya",
    "Pantau dan kelola seluruh transaksi Nexia Anda.",
  );

const TABS = ["Semua", "Belum Bayar", "Dikemas", "Dikirim", "Selesai", "Batal"];

export default function OrderDashboard() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 INJEKSI SCRIPT MIDTRANS (Agar bisa lanjut bayar dari halaman pesanan)
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 🔄 FUNGSI MENGAMBIL DATA DARI BACKEND
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/orders/history");
      // Urutkan dari yang terbaru ke terlama
      const sortedOrders = res.data.data.sort(
        (a: any, b: any) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      );
      setOrders(sortedOrders);
    } catch (error) {
      toast.error("Gagal mengambil riwayat pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 💸 FUNGSI MELANJUTKAN PEMBAYARAN MIDTRANS
  const handlePayNow = (snapToken: string) => {
    if (!snapToken) {
      return toast.error(
        "Token pembayaran tidak ditemukan. Silakan hubungi admin.",
      );
    }

    // @ts-ignore
    window.snap.pay(snapToken, {
      onSuccess: function () {
        toast.success("Pembayaran berhasil diselesaikan!");
        fetchOrders(); // Refresh data untuk update status jadi PAID
      },
      onPending: function () {
        toast.info("Menunggu konfirmasi pembayaran Anda.");
      },
      onError: function () {
        toast.error("Pembayaran gagal diproses!");
      },
    });
  };

  // ✅ FUNGSI KONFIRMASI PESANAN DITERIMA
  const handleCompleteOrder = async (orderId: number) => {
    try {
      await apiClient.put(`/orders/${orderId}/complete`);
      toast.success("Pesanan berhasil diselesaikan. Terima kasih!");
      fetchOrders(); // Refresh data
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menyelesaikan pesanan.",
      );
    }
  };

  // Filter logika mencocokkan Status Enum Backend dengan Tab UI
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Belum Bayar" && order.status === "PENDING") return true;
    if (activeTab === "Dikemas" && order.status === "PAID") return true;
    if (activeTab === "Dikirim" && order.status === "SHIPPED") return true;
    if (activeTab === "Selesai" && order.status === "COMPLETED") return true;
    if (activeTab === "Batal" && order.status === "CANCELLED") return true;
    return false;
  });

  // Cek apakah ada barang yang sedang dikirim untuk trigger AI Widget
  const hasShippedOrders = orders.some((o) => o.status === "SHIPPED");

  // Helper Render Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500 border border-yellow-500/20">
            <Clock size={14} /> Menunggu Pembayaran
          </span>
        );
      case "PAID":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
            <Package size={14} /> Sedang Dikemas
          </span>
        );
      case "SHIPPED":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20">
            <Truck size={14} /> Sedang Dikirim
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={14} /> Pesanan Selesai
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/20">
            <XCircle size={14} /> Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <main className="min-h-screen pb-40 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 🛡️ KOLOM KIRI: SIDEBAR PROFIL */}
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
            {/* 🤖 THE AI PREDICTION WIDGET */}
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
                        AI kami memprediksi pesanan Anda akan tiba{" "}
                        <strong>2 hari lebih cepat</strong> dari estimasi kurir
                        reguler karena kondisi lalu lintas logistik yang
                        lengang.
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
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <span className="text-cyan-400 font-bold animate-pulse uppercase tracking-widest">
                    Memuat Pesanan...
                  </span>
                </div>
              ) : filteredOrders.length === 0 ? (
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
                    key={order.orderId}
                    className="flex flex-col rounded-3xl border border-white/10 bg-zinc-900/30 p-5 md:p-6 backdrop-blur-xl transition-all hover:border-white/20"
                  >
                    {/* Header Kartu */}
                    <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        <span className="font-bold text-white">
                          Nexia Merchant
                        </span>
                        <span className="hidden md:inline-block text-zinc-600">
                          •
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                          {formatDate(order.orderDate)}
                        </span>
                        <span className="hidden md:inline-block text-zinc-600">
                          •
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                          ORD-{order.orderId}
                        </span>
                      </div>
                      {renderStatusBadge(order.status)}
                    </div>

                    {/* Body Kartu (Item List) */}
                    <div className="flex flex-col gap-4">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center">
                            <Package size={24} className="text-zinc-600" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <h4 className="text-sm md:text-base font-bold text-white">
                              {item.productName}
                            </h4>
                            <span className="mt-2 text-xs text-zinc-500">
                              {item.quantity} Barang x Rp{" "}
                              {item.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="hidden md:block text-right">
                            <span className="text-xs text-zinc-500 block mb-1">
                              Total Harga
                            </span>
                            <span className="text-sm font-bold text-cyan-400">
                              Rp {item.subTotal.toLocaleString("id-ID")}
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
                          Rp {order.grandTotal.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="w-full md:w-auto flex gap-3">
                        {order.status === "PENDING" &&
                          order.paymentMethod === "bank_transfer" && (
                            <button
                              onClick={() => handlePayNow(order.snapToken)}
                              className="w-full md:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                            >
                              Lanjut Bayar
                            </button>
                          )}
                        {order.status === "PAID" && (
                          <span className="text-sm text-zinc-400 italic flex items-center gap-2">
                            Menunggu Penjual mengirim barang...
                          </span>
                        )}
                        {order.status === "SHIPPED" && (
                          <>
                            <button className="w-full md:w-auto rounded-xl border border-white/10 bg-transparent px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/5">
                              Lacak Resi
                            </button>
                            <button
                              onClick={() => handleCompleteOrder(order.orderId)}
                              className="w-full md:w-auto rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-zinc-200"
                            >
                              Pesanan Diterima
                            </button>
                          </>
                        )}
                        {order.status === "COMPLETED" && (
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
