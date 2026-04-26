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
  Star,
  MessageSquareQuote,
  X,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { Link } from "react-router";
import { apiClient } from "~/services/apiClient";
import { toast } from "sonner";
import { useAuthStore } from "~/store/authStore";

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

  // 👑 STATE DINAMIS USER & AVATAR (MENGGUNAKAN LOGIKA ANDA!)
  const user = useAuthStore((state: any) => state.user);
  const [userData, setUserData] = useState<any>({ avatarUrl: "" });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 🌟 STATE UNTUK MODAL REVIEW
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] =
    useState<any>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    productId: "",
    rating: 5,
    comment: "",
  });

  // 🚀 INJEKSI SCRIPT MIDTRANS
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

  // 🔥 FUNGSI SEDOT AVATAR (BUATAN ANDA)
  const fetchUserData = async () => {
    try {
      const res = await apiClient.get("/users/me");
      setUserData(res.data.data);
      setAvatarPreview(res.data.data.avatarUrl);
    } catch (error: any) {
      console.error("Gagal memuat foto profil.");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUserData(); // Panggil di sini!
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
        fetchOrders();
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
      fetchOrders();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menyelesaikan pesanan.",
      );
    }
  };

  // 🌟 FUNGSI MENGIRIM ULASAN KE BACKEND
  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      return toast.error("Silakan tulis pengalaman Anda tentang produk ini!");
    }

    try {
      setIsSubmittingReview(true);

      const formData = new FormData();
      formData.append("productId", reviewForm.productId);
      formData.append("rating", reviewForm.rating.toString());
      formData.append("comment", reviewForm.comment);

      await apiClient.post("/reviews", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Ulasan berhasil dikirim! Terima kasih atas masukan Anda.");
      setIsReviewModalOpen(false);
      setReviewForm({ productId: "", rating: 5, comment: "" });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Gagal mengirim ulasan. Server mungkin sedang sibuk.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // 🌟 FUNGSI MEMBUKA MODAL ULASAN
  const openReviewModal = (order: any) => {
    setSelectedOrderForReview(order);
    if (order.items && order.items.length > 0) {
      setReviewForm({
        productId: order.items[0].productId.toString(),
        rating: 5,
        comment: "",
      });
    }
    setIsReviewModalOpen(true);
  };

  // 💡 HELPER INISIAL NAMA
  const getInitial = (name: string) => {
    if (!name) return "NX";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Belum Bayar" && order.status === "PENDING") return true;
    if (activeTab === "Dikemas" && order.status === "PAID") return true;
    if (activeTab === "Dikirim" && order.status === "SHIPPED") return true;
    if (activeTab === "Selesai" && order.status === "COMPLETED") return true;
    if (activeTab === "Batal" && order.status === "CANCELLED") return true;
    return false;
  });

  const hasShippedOrders = orders.some((o) => o.status === "SHIPPED");

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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // 🔥 PENENTU GAMBAR AVATAR
  const currentAvatar =
    avatarPreview ||
    userData.avatarUrl ||
    (user?.name
      ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
      : null);

  return (
    <main className="min-h-screen pb-40 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 🛡️ KOLOM KIRI: SIDEBAR PROFIL */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                {/* 🔥 AVATAR DINAMIS DISINI */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-800 overflow-hidden shadow-lg border-2 border-white/10">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-white text-xl">
                      {getInitial(user?.name || "Guest")}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-white leading-tight uppercase">
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
                            {item.imageUrls && item.imageUrls.length > 0 ? (
                              <img
                                src={item.imageUrls[0]}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={24} className="text-zinc-600" />
                            )}
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
                            <button
                              onClick={() => openReviewModal(order)}
                              className="w-full md:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                            >
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

      {/* ⭐ MODAL FORM BERI ULASAN */}
      {isReviewModalOpen && selectedOrderForReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsReviewModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/50 p-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <MessageSquareQuote className="text-cyan-400" /> Tulis Ulasan
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Jika pesanannya punya lebih dari 1 barang, munculkan Dropdown pilihan! */}
              {selectedOrderForReview.items &&
                selectedOrderForReview.items.length > 1 && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Pilih Produk yang mau di-review
                    </label>
                    <select
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                      value={reviewForm.productId}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          productId: e.target.value,
                        })
                      }
                    >
                      {selectedOrderForReview.items.map((item: any) => (
                        <option
                          key={item.productId}
                          value={item.productId}
                          className="bg-zinc-900 text-white"
                        >
                          {item.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {/* Tampilan 1 Barang (Jika hanya beli 1 macam barang) */}
              {selectedOrderForReview.items &&
                selectedOrderForReview.items.length === 1 && (
                  <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-black">
                      {selectedOrderForReview.items[0].imageUrls &&
                      selectedOrderForReview.items[0].imageUrls.length > 0 ? (
                        <img
                          src={selectedOrderForReview.items[0].imageUrls[0]}
                          alt="Product"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package
                          size={20}
                          className="text-zinc-600 m-auto mt-3"
                        />
                      )}
                    </div>
                    <span className="text-sm font-bold text-white line-clamp-2">
                      {selectedOrderForReview.items[0].productName}
                    </span>
                  </div>
                )}

              {/* RATING BINTANG INTERAKTIF */}
              <div className="flex flex-col items-center justify-center gap-3">
                <span className="text-sm font-bold text-zinc-400">
                  Bagaimana kualitas produk ini?
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: star })
                      }
                      className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                    >
                      <Star
                        size={40}
                        fill={
                          star <= reviewForm.rating ? "#facc15" : "transparent"
                        }
                        className={
                          star <= reviewForm.rating
                            ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                            : "text-zinc-600"
                        }
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {reviewForm.rating === 5
                    ? "Sempurna!"
                    : reviewForm.rating === 4
                      ? "Sangat Bagus"
                      : reviewForm.rating === 3
                        ? "Cukup Bagus"
                        : reviewForm.rating === 2
                          ? "Kurang Memuaskan"
                          : "Sangat Mengecewakan"}
                </span>
              </div>

              {/* KOLOM KOMENTAR */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Bagikan pengalaman Anda
                </label>
                <textarea
                  rows={4}
                  placeholder="Misal: Barangnya ori, packing aman, dan pengirimannya super cepat! Mantap pokoknya."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-zinc-600 resize-none"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                ></textarea>
              </div>
            </div>

            <div className="border-t border-white/10 bg-zinc-900/50 p-6 flex justify-end gap-3">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                disabled={isSubmittingReview}
              >
                Batal
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-8 py-3 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:animate-pulse"
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
