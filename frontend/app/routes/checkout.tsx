import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  MapPin,
  Truck,
  Ticket,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Cpu,
  X,
  Lock,
  CheckCircle2,
  Percent,
} from "lucide-react";
import { useCartStore } from "~/store/cartStore";
import { toast } from "sonner";
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta("Checkout", "Selesaikan pembayaran pesanan Nexia Anda.");

const SHIPPING_OPTIONS = [
  { id: "reg", name: "Reguler (2-3 Hari)", price: 15000 },
  { id: "eco", name: "Hemat Kargo (4-7 Hari)", price: 8000 },
  { id: "inst", name: "Nexia Instant (1 hari)", price: 45000 },
];

// 🔥 DATA DUMMY DOMPET VOUCHER CUSTOMER
const CUSTOMER_VOUCHERS = [
  {
    id: "v1",
    title: "Diskon Nexia AI Optimal",
    discount: 50000,
    minPurchase: 500000,
    type: "Platform",
  },
  {
    id: "v2",
    title: "Gratis Ongkir Super",
    discount: 20000,
    minPurchase: 100000,
    type: "Shipping",
  },
  {
    id: "v3",
    title: "Diskon Khusus Sultan",
    discount: 1000000,
    minPurchase: 50000000,
    type: "Platform",
  }, // Sengaja dibuat Min Purchase tinggi agar ter-disabled!
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const checkoutItems = cartItems.filter((item) => item.selected);

  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 🔥 STATE MODAL MANUAL VOUCHER
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  useEffect(() => {
    if (checkoutItems.length === 0) {
      toast.error("Pilih setidaknya 1 barang untuk di-checkout!");
      navigate("/cart");
    }
  }, [checkoutItems, navigate]);

  const subtotalProduk = checkoutItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const ongkosKirim = selectedShipping.price;
  const totalPembayaran = subtotalProduk + ongkosKirim - voucherDiscount;

  const handleAiVoucher = () => {
    setIsAiThinking(true);
    setTimeout(() => {
      setVoucherDiscount(50000);
      setIsAiThinking(false);
      toast.success(
        "Nexia AI berhasil menerapkan diskon optimal Rp 50.000 untuk Anda!",
      );
    }, 1500);
  };

  // 🔥 FUNGSI PILIH VOUCHER MANUAL
  const handleManualVoucherSelect = (discount: number) => {
    setVoucherDiscount(discount);
    setIsVoucherModalOpen(false);
    toast.success(`Voucher berhasil diterapkan!`);
  };

  const handlePayment = () => {
    setIsProcessingPayment(true);
    toast.loading("Menghubungkan ke Nexia Secure Gateway (Midtrans)...");
    setTimeout(() => {
      setIsProcessingPayment(false);
      toast.dismiss();
      toast.success("Pembayaran Berhasil! Pesanan Anda sedang diproses.");
    }, 2500);
  };

  return (
    <main className="min-h-screen pb-40 pt-28 relative">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <h1 className="mb-8 text-3xl font-black text-white md:text-4xl">
          Checkout Pembayaran
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* KOLOM KIRI: ALAMAT & DAFTAR PESANAN */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Alamat Pengiriman */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <MapPin size={20} />
                  <h2 className="text-lg font-bold text-white">
                    Alamat Pengiriman
                  </h2>
                </div>
                <button className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                  Ubah
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-zinc-300">
                <div className="font-bold text-white whitespace-nowrap">
                  Achmad Zacky Ghoutsu Zamani <br />{" "}
                  <span className="text-zinc-500 font-normal">
                    (+62) 812 3456 7890
                  </span>
                </div>
                <div className="md:border-l md:border-white/10 md:pl-4">
                  Jl. Panglima Sudirman No. 123, Perumahan Graha Bunder Asri,
                  Gresik, Jawa Timur, 61111. (Rumah cat putih pagar hitam).
                </div>
              </div>
            </div>

            {/* Daftar Produk & Kurir */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                <ShieldCheck size={20} className="text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Pesanan Anda</h2>
              </div>

              <div className="flex flex-col gap-6">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className="line-clamp-1 text-sm font-bold text-white">
                        {item.name}
                      </h3>
                      <span className="text-xs text-zinc-500">
                        Kuantitas: {item.quantity}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-cyan-400">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-white/5 pt-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Truck size={16} /> Opsi Pengiriman
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SHIPPING_OPTIONS.map((shipping) => (
                    <button
                      key={shipping.id}
                      onClick={() => setSelectedShipping(shipping)}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${selectedShipping.id === shipping.id ? "border-cyan-400 bg-cyan-500/10 shadow-inner" : "border-white/10 bg-black/20 hover:border-white/30"}`}
                    >
                      <span
                        className={`text-sm font-bold ${selectedShipping.id === shipping.id ? "text-white" : "text-zinc-300"}`}
                      >
                        {shipping.name}
                      </span>
                      <span className="text-xs font-medium text-cyan-400 mt-1">
                        Rp {shipping.price.toLocaleString("id-ID")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: THE DISCOUNT ENGINE & PAYMENT TOTAL */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            {/* THE AI VOUCHER ENGINE */}
            <div className="rounded-3xl border border-cyan-500/30 bg-cyan-950/20 p-6 backdrop-blur-xl relative overflow-hidden">
              <div className="mb-4 flex items-center gap-2 text-cyan-400">
                <Ticket size={20} />
                <h2 className="text-lg font-bold text-white">
                  Voucher & Diskon
                </h2>
              </div>

              {voucherDiscount === 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex rounded-xl overflow-hidden border border-white/10 bg-black/30">
                    <input
                      type="text"
                      placeholder="Masukkan kode voucher"
                      className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none"
                    />
                    <button className="bg-white/10 px-4 text-sm font-bold text-white hover:bg-white/20 transition-colors">
                      Pakai
                    </button>
                  </div>

                  <div className="flex items-center gap-4 my-2">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-xs text-zinc-500 font-bold">
                      ATAU
                    </span>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>

                  <button
                    onClick={handleAiVoucher}
                    disabled={isAiThinking}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 overflow-hidden"
                  >
                    {isAiThinking ? (
                      <Cpu className="animate-pulse" size={18} />
                    ) : (
                      <Sparkles
                        size={18}
                        className="transition-transform group-hover:rotate-12"
                      />
                    )}
                    <span className="relative z-10">
                      {isAiThinking
                        ? "Menganalisis Data Anda..."
                        : "Auto-Apply AI Voucher"}
                    </span>
                    {isAiThinking && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    )}
                  </button>

                  {/* 🔥 NEW BUTTON: OPSI PEMILIHAN MANUAL */}
                  <button
                    onClick={() => setIsVoucherModalOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 py-3.5 text-sm font-bold text-zinc-300 transition-all hover:bg-white/5 hover:text-white active:scale-95"
                  >
                    Pilih Voucher Tersimpan
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles size={14} /> Voucher Terpasang
                    </span>
                    <span className="text-xs text-zinc-400">
                      Potongan Rp {voucherDiscount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    onClick={() => setVoucherDiscount(0)}
                    className="text-xs font-bold text-zinc-500 hover:text-red-400"
                  >
                    Batalkan
                  </button>
                </div>
              )}
            </div>

            {/* Rincian Pembayaran */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-2xl shadow-2xl">
              <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-purple-400" /> Rincian
                Pembayaran
              </h2>
              <div className="flex flex-col gap-3 py-4 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-white">
                    Rp {subtotalProduk.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal Pengiriman</span>
                  <span className="font-semibold text-white">
                    Rp {ongkosKirim.toLocaleString("id-ID")}
                  </span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between animate-in slide-in-from-right-4">
                    <span className="text-emerald-400">
                      Total Diskon Voucher
                    </span>
                    <span className="font-bold text-emerald-400">
                      - Rp {voucherDiscount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 pt-4 flex flex-col gap-1">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Total Pembayaran
                </span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500">
                  Rp {Math.max(0, totalPembayaran).toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="mt-6 w-full rounded-2xl bg-white py-4 font-black text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isProcessingPayment ? (
                  <Cpu size={20} className="animate-spin text-zinc-500" />
                ) : (
                  <ShieldCheck size={20} />
                )}
                {isProcessingPayment
                  ? "Memproses Gateway..."
                  : "Buat Pesanan & Bayar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔮 NEW MODAL: PILIH VOUCHER MANUAL */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsVoucherModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 bg-black/20 p-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="text-cyan-400" size={20} /> Voucher Tersimpan
              </h2>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {CUSTOMER_VOUCHERS.map((v) => {
                const isEligible = subtotalProduk >= v.minPurchase; // Validasi kelayakan

                return (
                  <div
                    key={v.id}
                    className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${isEligible ? "border-white/10 bg-zinc-800/50 hover:border-cyan-500/50" : "border-red-500/10 bg-red-950/10 opacity-70"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${isEligible ? "bg-cyan-500/20 text-cyan-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {isEligible ? (
                          <Percent size={20} />
                        ) : (
                          <Lock size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h4
                          className={`text-sm font-bold ${isEligible ? "text-white" : "text-zinc-500 line-through decoration-red-500/50"}`}
                        >
                          {v.title}
                        </h4>
                        <span className="text-xs text-zinc-400 mt-1">
                          Min. Belanja Rp{" "}
                          {v.minPurchase.toLocaleString("id-ID")}
                        </span>
                        {!isEligible && (
                          <span className="text-[10px] font-bold text-red-400 mt-1">
                            Belanjaan Anda kurang Rp{" "}
                            {(v.minPurchase - subtotalProduk).toLocaleString(
                              "id-ID",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    {isEligible ? (
                      <button
                        onClick={() => handleManualVoucherSelect(v.discount)}
                        className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors"
                      >
                        Pilih
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-zinc-600 px-4">
                        Tidak Berlaku
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
