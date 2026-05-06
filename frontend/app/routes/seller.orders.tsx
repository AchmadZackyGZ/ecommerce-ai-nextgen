import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { toast } from "sonner";
import { apiClient } from "~/services/apiClient";

export const meta = () =>
  generateMeta("Pesanan Masuk", "Kelola pesanan masuk masuk toko anda");

export default function SellerOrders() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, PAID, SHIPPED, COMPLETED

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/orders/shop");
      const sortedOrders = response.data.data.sort(
        (a: any, b: any) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      );
      setOrders(sortedOrders);
    } catch (error) {
      toast.error("Gagal memuat daftar pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleShipOrder = async (orderId: string) => {
    try {
      toast.info("Memproses pengiriman...");
      await apiClient.put(`/orders/${orderId}/ship`);
      toast.success("Pesanan berhasil diubah menjadi DIKIRIM!");
      fetchOrders(); // Refresh data
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal memproses pengiriman.",
      );
    }
  };

  // Filter pesanan berdasarkan tab yang aktif
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <Clock size={14} /> Belum Bayar
          </span>
        );
      case "PAID":
        return (
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <Package size={14} /> Perlu Dikirim
          </span>
        );
      case "SHIPPED":
        return (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <Truck size={14} /> Sedang Dikirim
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <CheckCircle size={14} /> Selesai
          </span>
        );
      default:
        return (
          <span className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 px-3 py-1 rounded-full text-xs font-bold w-max">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
          <Package className="text-cyan-400" /> Pesanan Masuk
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Kelola dan proses pesanan dari pelanggan Anda.
        </p>
      </div>

      {/* TABS FILTER */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 [&::-webkit-scrollbar]:hidden">
        {["ALL", "PAID", "SHIPPED", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
            }`}
          >
            {tab === "ALL" && "Semua Pesanan"}
            {tab === "PAID" && "Perlu Dikirim"}
            {tab === "SHIPPED" && "Sedang Dikirim"}
            {tab === "COMPLETED" && "Selesai"}
          </button>
        ))}
      </div>

      {/* LIST PESANAN */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/30">
            <Package size={48} className="text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">
              Tidak Ada Pesanan
            </h3>
            <p className="text-sm text-zinc-500">
              Belum ada pesanan masuk untuk kategori ini.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:border-cyan-500/30 transition-all"
            >
              {/* Header Pesanan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black text-white">
                      {order.customerName}
                    </span>
                    <span className="text-xs font-bold text-zinc-500 px-2 py-0.5 bg-black rounded-md">
                      {order.invoiceId}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {new Date(order.orderDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Detail Alamat & Kurir */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-black/20 p-4 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                    Alamat Pengiriman
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {order.shippingAddress}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                    Metode Kurir
                  </span>
                  <p className="text-sm font-bold text-cyan-400 uppercase">
                    {order.shippingMethod || "REGULER"}
                  </p>
                </div>
              </div>

              {/* Item Produk */}
              <div className="space-y-4 mb-6">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="h-16 w-16 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-white/10">
                      <img
                        src={item.imageUrls[0]}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {item.productName}
                      </h4>
                      <span className="text-xs text-zinc-400">
                        {item.quantity} x Rp{" "}
                        {item.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-white">
                        Rp {item.subTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Pesanan (Total & Aksi) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div>
                  <span className="text-sm text-zinc-400 mr-2">
                    Total Pendapatan:
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    Rp {order.grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* ACTION BUTTONS BERDASARKAN STATUS */}
                <div className="w-full sm:w-auto">
                  {order.status === "PAID" && (
                    <button
                      onClick={() => handleShipOrder(order.orderId)}
                      className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 px-6 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Truck size={18} /> Kirim Barang
                    </button>
                  )}
                  {order.status === "PENDING" && (
                    <span className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-4 py-2.5 rounded-xl border border-yellow-500/20 block text-center">
                      Menunggu Pembayaran
                    </span>
                  )}
                  {order.status === "SHIPPED" && (
                    <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-4 py-2.5 rounded-xl border border-blue-500/20 block text-center">
                      Barang Sedang Dikirim
                    </span>
                  )}
                  {order.status === "COMPLETED" && (
                    <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 block text-center flex items-center justify-center gap-2">
                      <CheckCircle size={18} /> Transaksi Selesai
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
