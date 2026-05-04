import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  MapPin,
  Package,
  Truck,
  CreditCard,
  Ticket,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  X,
  PlusCircle,
  AlertCircle,
  Building,
  Check,
  Home,
  Briefcase,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { toast } from "sonner";
import { apiClient } from "~/services/apiClient";

declare global {
  interface Window {
    snap: any;
  }
}

export const meta = () =>
  generateMeta("Checkout", "Selesaikan pembayaran pesanan Nexia Anda.");

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalProductPrice, setTotalProductPrice] = useState(0);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // 🔥 STATE MODAL ALAMAT
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false); // Mode Lihat vs Mode Tambah
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Rumah");
  const [isPrimaryAddress, setIsPrimaryAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: "",
    phoneNumber: "",
    province: "",
    city: "",
    district: "",
    postalCode: "",
    streetDetails: "",
    otherDetails: "",
  });

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  const [sellerNote, setSellerNote] = useState("");
  const [shippingMethod, setShippingMethod] = useState("reguler");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [selectedBank, setSelectedBank] = useState("");

  const shippingCost = shippingMethod === "kargo" ? 35000 : 15000;
  const protectionFee = 1000;

  let discountAmount = 0;
  if (selectedVoucher) {
    const calculatedDiscount =
      (totalProductPrice * selectedVoucher.discountPercentage) / 100;
    discountAmount =
      calculatedDiscount > selectedVoucher.maxDiscountAmount
        ? selectedVoucher.maxDiscountAmount
        : calculatedDiscount;
  }

  const grandTotal =
    totalProductPrice + shippingCost + protectionFee - discountAmount;

  const bankOptions = [
    {
      id: "bca",
      name: "BCA Virtual Account",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
    },
    {
      id: "mandiri",
      name: "Mandiri Virtual Account",
      logoUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Bank_Mandiri_logo_2016.svg",
    },
    {
      id: "bni",
      name: "BNI Virtual Account",
      logoUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Bank_Negara_Indonesia_logo_(2004).svg",
    },
    {
      id: "bri",
      name: "BRI Virtual Account",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg",
    },
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const cartRes = await apiClient.get("/cart");
      const cartData = cartRes.data.data;

      if (!cartData.items || cartData.items.length === 0) {
        toast.error("Keranjang kosong. Silakan belanja dulu.");
        return navigate("/cart");
      }

      setCartItems(cartData.items);
      setTotalProductPrice(cartData.totalPrice);

      try {
        const addressRes = await apiClient.get("/addresses");
        const addressList = addressRes.data.data || [];
        setAddresses(addressList);
        if (addressList.length > 0) {
          const primary =
            addressList.find((a: any) => a.isPrimary) || addressList[0];
          setSelectedAddress(primary);
        }
      } catch (addrError) {
        setAddresses([]);
      }

      try {
        const voucherRes = await apiClient.get("/vouchers/public");
        const allVouchers = voucherRes.data.data || [];
        const now = new Date();
        setVouchers(
          allVouchers.filter(
            (v: any) => new Date(v.expiredAt) >= now && v.quota > 0,
          ),
        );
      } catch (voucherError) {
        setVouchers([]);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleSaveAddress = async () => {
    if (
      !newAddress.recipientName ||
      !newAddress.phoneNumber ||
      !newAddress.province ||
      !newAddress.city ||
      !newAddress.district ||
      !newAddress.streetDetails
    ) {
      return toast.error("Harap isi semua kolom wajib!");
    }
    try {
      setIsSavingAddress(true);
      const payload = {
        ...newAddress,
        label: addressLabel,
        isPrimary: isPrimaryAddress,
      };
      await apiClient.post("/addresses", payload);
      toast.success("Alamat berhasil ditambahkan!");
      setIsAddingNewAddress(false);
      fetchData(); // Refresh address list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan alamat.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress)
      return toast.error(
        "Silakan tambahkan alamat pengiriman terlebih dahulu!",
      );
    if (paymentMethod === "bank_transfer" && !selectedBank)
      return toast.error("Silakan pilih Bank tujuan.");

    try {
      setIsProcessingOrder(true);
      toast.success("Mempersiapkan Gateway Pembayaran...");

      const payload = {
        addressId: selectedAddress.id,
        voucherCode: selectedVoucher ? selectedVoucher.code : null,
        shippingMethod: shippingMethod,
        paymentMethod: paymentMethod,
        paymentBank: paymentMethod === "bank_transfer" ? selectedBank : null,
        sellerNote: sellerNote,
      };

      const response = await apiClient.post("/orders/checkout", payload);
      const orderData = response.data.data;

      if (paymentMethod === "cod") {
        toast.success("Pesanan COD berhasil dibuat!");
        return navigate("/pesanan");
      }

      if (orderData.snapToken) {
        // @ts-ignore
        window.snap.pay(orderData.snapToken, {
          onSuccess: function () {
            toast.success("Pembayaran berhasil diselesaikan!");
            navigate("/pesanan");
          },
          onPending: function () {
            toast.warning("Menunggu pembayaran Anda.");
            navigate("/pesanan");
          },
          onError: function () {
            toast.error("Pembayaran gagal diproses!");
            navigate("/pesanan");
          },
          onClose: function () {
            toast.info("Anda menutup halaman sebelum membayar.");
            navigate("/pesanan");
          },
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat pesanan.");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (isLoading)
    return (
      <main className="min-h-screen pb-40 pt-40 flex justify-center items-center">
        <span className="text-cyan-400 font-bold animate-pulse tracking-widest uppercase">
          Menyiapkan Checkout...
        </span>
      </main>
    );

  return (
    <main className="min-h-screen pb-40 pt-28 relative">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <h1 className="mb-8 text-3xl font-black text-white md:text-4xl">
          Checkout Pesanan
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">
            {/* 📍 ALAMAT PENGIRIMAN */}
            <div
              className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all ${!selectedAddress ? "border-red-500/50 bg-red-500/5" : "border-white/10 bg-zinc-900/30 group hover:border-cyan-500/30"}`}
            >
              {selectedAddress && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center gap-2 font-bold ${!selectedAddress ? "text-red-400" : "text-cyan-400"}`}
                >
                  <MapPin size={20} /> Alamat Pengiriman
                </div>
                {selectedAddress && (
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Ubah Alamat
                  </button>
                )}
              </div>
              {selectedAddress ? (
                <div className="flex flex-col gap-1 pl-7">
                  <span className="font-bold text-white text-lg">
                    {selectedAddress.recipientName}{" "}
                    <span className="text-sm font-normal text-zinc-400">
                      ({selectedAddress.phoneNumber})
                    </span>
                  </span>
                  <span className="text-zinc-400 text-sm leading-relaxed mt-1">
                    {selectedAddress.streetDetails}{" "}
                    {selectedAddress.otherDetails &&
                      `(${selectedAddress.otherDetails})`}
                    <br />
                    {selectedAddress.district}, {selectedAddress.city},{" "}
                    {selectedAddress.province} {selectedAddress.postalCode}
                  </span>
                  <div className="flex gap-2 mt-2">
                    <span className="w-max rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                      {selectedAddress.label}
                    </span>
                    {selectedAddress.isPrimary && (
                      <span className="w-max rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        Utama
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle size={32} className="text-red-500 mb-3" />
                  <h3 className="text-white font-bold mb-1">
                    Anda Belum Memiliki Alamat
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddressModalOpen(true);
                      setIsAddingNewAddress(true);
                    }}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    <PlusCircle size={18} /> Tambah Alamat Baru
                  </button>
                </div>
              )}
            </div>

            {/* 📦 DAFTAR PRODUK */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-white font-bold mb-6 border-b border-white/10 pb-4">
                <Package size={20} className="text-purple-400" /> Produk Dipesan
              </div>
              <div className="flex flex-col gap-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-zinc-800 border border-white/10">
                      <img
                        src={
                          item.imageUrls && item.imageUrls.length > 0
                            ? item.imageUrls[0]
                            : "/placeholder-image.jpg"
                        }
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-white line-clamp-2">
                        {item.productName}
                      </h3>
                      <span className="text-xs text-zinc-500 mt-1">
                        Kuantitas: {item.quantity}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-cyan-400">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-4">
                <MessageSquare size={18} className="text-zinc-500" />
                <input
                  type="text"
                  value={sellerNote}
                  onChange={(e) => setSellerNote(e.target.value)}
                  placeholder="Pesan untuk penjual (Opsional)..."
                  className="flex-1 bg-transparent border-b border-white/10 pb-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* 🚚 PENGIRIMAN */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-white font-bold mb-4">
                <Truck size={20} className="text-emerald-400" /> Opsi Pengiriman
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${shippingMethod === "reguler" ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-black/20 hover:border-white/30"}`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value="reguler"
                    className="sr-only"
                    checked={shippingMethod === "reguler"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Reguler</span>
                    <span className="font-bold text-cyan-400">Rp 15.000</span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Estimasi tiba 2-4 hari kerja.
                  </span>
                </label>
                <label
                  className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${shippingMethod === "kargo" ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-black/20 hover:border-white/30"}`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value="kargo"
                    className="sr-only"
                    checked={shippingMethod === "kargo"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Kargo (Hemat)</span>
                    <span className="font-bold text-cyan-400">Rp 35.000</span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Untuk barang di atas 5kg. Estimasi 5-7 hari.
                  </span>
                </label>
              </div>
            </div>

            {/* 🎫 VOUCHER & 💳 PEMBAYARAN */}
            <div
              onClick={() => setIsVoucherModalOpen(true)}
              className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl flex items-center justify-between cursor-pointer group transition-all hover:border-cyan-500/50 hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <Ticket
                  size={24}
                  className="text-yellow-400 transition-transform group-hover:scale-110"
                />
                <span className="font-bold text-white">Nexia Voucher</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedVoucher ? (
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    - Rp {discountAmount.toLocaleString("id-ID")}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                    Pilih atau Masukkan Voucher
                  </span>
                )}
                <ChevronRight
                  size={20}
                  className="text-zinc-500 group-hover:text-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl flex flex-col">
              <div className="flex items-center gap-2 text-white font-bold mb-4">
                <CreditCard size={20} className="text-orange-400" /> Metode
                Pembayaran
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${paymentMethod === "bank_transfer" ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-black/20 hover:border-white/30"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    className="sr-only"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "bank_transfer" ? "border-cyan-400" : "border-zinc-500"}`}
                  >
                    {paymentMethod === "bank_transfer" && (
                      <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">
                      Transfer Bank / VA
                    </span>
                    <span className="text-xs text-zinc-500">
                      Dicek otomatis (Midtrans)
                    </span>
                  </div>
                </label>
                <label
                  className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${paymentMethod === "cod" ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-black/20 hover:border-white/30"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    className="sr-only"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setSelectedBank("");
                    }}
                  />
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-cyan-400" : "border-zinc-500"}`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-xs text-zinc-500">
                      Bayar saat barang sampai
                    </span>
                  </div>
                </label>
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <span className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
                    <Building size={16} /> Pilih Bank (Virtual Account)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bankOptions.map((bank) => (
                      <label
                        key={bank.id}
                        className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${selectedBank === bank.id ? "border-cyan-400 bg-cyan-500/10" : "border-white/5 bg-black/20 hover:border-white/20"}`}
                      >
                        <input
                          type="radio"
                          name="bank"
                          value={bank.id}
                          className="sr-only"
                          checked={selectedBank === bank.id}
                          onChange={(e) => setSelectedBank(e.target.value)}
                        />
                        <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-white px-1.5 py-1 shadow-md">
                          <img
                            src={bank.logoUrl}
                            alt={bank.id}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span className="font-bold text-white text-xs leading-tight">
                          {bank.name}
                        </span>
                        {selectedBank === bank.id && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 💸 ORDER SUMMARY */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-2xl shadow-2xl">
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">
                Ringkasan Belanja
              </h3>
              <div className="flex flex-col gap-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-white">
                    Rp {totalProductPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal Pengiriman</span>
                  <span className="font-semibold text-white">
                    Rp {shippingCost.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Proteksi</span>
                  <span className="font-semibold text-white">
                    Rp {protectionFee.toLocaleString("id-ID")}
                  </span>
                </div>
                {selectedVoucher && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Diskon Voucher</span>
                    <span className="font-semibold">
                      - Rp {discountAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 pt-4 flex flex-col gap-1">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Total Pembayaran
                </span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || isProcessingOrder}
                className="mt-4 flex items-center justify-center w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:grayscale disabled:animate-pulse"
              >
                {isProcessingOrder
                  ? "Mempersiapkan Gateway..."
                  : "Buat Pesanan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📍 MODAL PILIH ATAU TAMBAH ALAMAT */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
              <h3 className="text-xl font-black text-white">
                {isAddingNewAddress ? "Alamat Baru" : "Pilih Alamat Pengiriman"}
              </h3>
              <button
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setIsAddingNewAddress(false);
                }}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {!isAddingNewAddress ? (
              // BUKU ALAMAT LIST
              <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {addresses.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4">
                    Belum ada alamat tersimpan.
                  </p>
                ) : (
                  addresses.map((addr: any) => (
                    <label
                      key={addr.id}
                      className={`relative flex cursor-pointer gap-4 rounded-2xl border p-4 transition-all ${selectedAddress?.id === addr.id ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-black/20 hover:border-white/30"}`}
                    >
                      <input
                        type="radio"
                        name="addressSelect"
                        className="sr-only"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => {
                          setSelectedAddress(addr);
                          setIsAddressModalOpen(false);
                        }}
                      />
                      <div className="mt-1">
                        <MapPin
                          size={20}
                          className={
                            selectedAddress?.id === addr.id
                              ? "text-cyan-400"
                              : "text-zinc-500"
                          }
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white flex items-center gap-2">
                          {addr.recipientName}
                          <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase text-zinc-400">
                            {addr.label}
                          </span>
                          {addr.isPrimary && (
                            <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase text-emerald-400">
                              Utama
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-zinc-400 mt-1">
                          {addr.phoneNumber}
                        </span>
                        <span className="text-sm text-zinc-300 mt-2 leading-relaxed">
                          {addr.streetDetails}{" "}
                          {addr.otherDetails && `(${addr.otherDetails})`}
                          <br />
                          {addr.district}, {addr.city}, {addr.province}{" "}
                          {addr.postalCode}
                        </span>
                      </div>
                    </label>
                  ))
                )}
                <button
                  onClick={() => setIsAddingNewAddress(true)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-500/50 bg-cyan-500/5 py-4 font-bold text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <PlusCircle size={18} /> Tambah Alamat Baru
                </button>
              </div>
            ) : (
              // FORM TAMBAH ALAMAT
              <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => setIsAddingNewAddress(false)}
                  className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 mb-2"
                >
                  &larr; Kembali ke Daftar Alamat
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={newAddress.recipientName}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        recipientName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-zinc-600"
                  />
                  <input
                    type="tel"
                    placeholder="Nomor Telepon"
                    value={newAddress.phoneNumber}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-zinc-600"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Provinsi"
                    value={newAddress.province}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, province: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-zinc-600"
                  />
                  <input
                    type="text"
                    placeholder="Kota/Kab"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-zinc-600"
                  />
                  <input
                    type="text"
                    placeholder="Kecamatan"
                    value={newAddress.district}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, district: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-zinc-600"
                  />
                  <input
                    type="text"
                    placeholder="Kode Pos"
                    value={newAddress.postalCode}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-zinc-600"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nama Jalan, Gedung, No. Rumah"
                  value={newAddress.streetDetails}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      streetDetails: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-zinc-600"
                />
                <input
                  type="text"
                  placeholder="Detail Lainnya (Opsional)"
                  value={newAddress.otherDetails}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      otherDetails: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-zinc-600"
                />
                <div className="mt-2 flex flex-col gap-3">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Tandai Sebagai:
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setAddressLabel("Rumah")}
                      className={`rounded-xl py-3 text-sm font-bold transition-all border ${addressLabel === "Rumah" ? "border-cyan-400 text-cyan-400 bg-cyan-500/10" : "border-white/10 text-zinc-400 hover:text-white"}`}
                    >
                      Rumah
                    </button>
                    <button
                      onClick={() => setAddressLabel("Kantor")}
                      className={`rounded-xl py-3 text-sm font-bold transition-all border ${addressLabel === "Kantor" ? "border-cyan-400 text-cyan-400 bg-cyan-500/10" : "border-white/10 text-zinc-400 hover:text-white"}`}
                    >
                      Kantor
                    </button>
                  </div>
                </div>
                <label className="mt-4 flex cursor-pointer items-center gap-3 w-max">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border ${isPrimaryAddress ? "border-cyan-400 bg-cyan-400" : "border-zinc-600"}`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isPrimaryAddress}
                      onChange={(e) => setIsPrimaryAddress(e.target.checked)}
                    />
                    {isPrimaryAddress && (
                      <Check size={14} className="text-black font-bold" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-zinc-300 select-none">
                    Atur sebagai alamat utama
                  </span>
                </label>
                <button
                  onClick={handleSaveAddress}
                  disabled={isSavingAddress}
                  className="mt-4 px-8 py-3 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors disabled:opacity-50 w-full"
                >
                  {isSavingAddress ? "Menyimpan..." : "Simpan Alamat Baru"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎫 MODAL VOUCHER (Tetap Sama) */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Ticket className="text-yellow-400" /> Pilih Voucher
              </h3>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 max-h-[40vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {vouchers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Ticket size={40} className="text-zinc-700 mb-3" />
                  <p className="text-white font-bold mb-1">
                    Voucher Anda Tidak Ada
                  </p>
                </div>
              ) : (
                vouchers.map((voucher) => (
                  <label
                    key={voucher.id}
                    className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${selectedVoucher?.id === voucher.id ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-black/20 hover:border-white/30"}`}
                  >
                    <input
                      type="radio"
                      name="voucher"
                      className="sr-only"
                      checked={selectedVoucher?.id === voucher.id}
                      onChange={() => setSelectedVoucher(voucher)}
                    />
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex shrink-0 items-center justify-center ${selectedVoucher?.id === voucher.id ? "border-cyan-400" : "border-zinc-500"}`}
                    >
                      {selectedVoucher?.id === voucher.id && (
                        <div className="h-2.5 w-2.5 rounded-full bg-cyan-400"></div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">
                        Diskon {voucher.discountPercentage}% (Max Rp{" "}
                        {voucher.maxDiscountAmount?.toLocaleString("id-ID")})
                      </span>
                      <span className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        KODE: {voucher.code} • Toko: {voucher.shopName}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedVoucher(null);
                  setIsVoucherModalOpen(false);
                }}
                className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Hapus Pilihan
              </button>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="px-8 py-3 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
