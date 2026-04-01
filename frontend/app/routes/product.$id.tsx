import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Minus,
  Store,
  MessageSquare,
  Star,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import { useCartStore } from "~/store/cartStore";
import { toast } from "sonner";
import { generateMeta } from "~/utils/seo";
import { apiClient } from "~/services/apiClient";

export const meta = () =>
  generateMeta(
    "Detail Produk",
    "Spesifikasi dan ulasan lengkap produk premium Nexia.",
  );

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toggleCart = useCartStore((state: any) => state.toggleCart);

  // 📦 STATE : Data Asli dari Backend
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // 🎨 State UI
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("ulasan"); // Default ke ulasan agar langsung terlihat!
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | "Semua">("Semua");

  // 🚀 MESIN PENARIK DATA DARI SPRING BOOT
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/products/${id}`);
        const fetchedProduct = response.data.data;

        setProduct(fetchedProduct);

        // Auto-select varian pertama jika ada
        if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
          setSelectedVariant(fetchedProduct.variants[0]);
        }
      } catch (error) {
        console.error("Gagal memuat detail produk:", error);
        toast.error("Produk tidak ditemukan atau server bermasalah.");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const dynamicPrice =
    (product?.price || 0) + (selectedVariant?.priceModifier || 0);

  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () =>
    setQuantity((prev) =>
      prev < (selectedVariant?.stock || product?.stock || 1) ? prev + 1 : prev,
    );

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      return toast.error("Silakan pilih varian terlebih dahulu!");
    }

    try {
      setIsAddingToCart(true);
      await apiClient.post("/cart", {
        variantId: selectedVariant.id,
        quantity: quantity,
      });

      window.dispatchEvent(
        new CustomEvent("cartUpdated", {
          detail: { addedQuantity: quantity },
        }),
      );

      toast.success(
        `Berhasil menambahkan ${product.name} (${selectedVariant.variantName}) ke keranjang!`,
      );
    } catch (error: any) {
      console.error("Gagal masuk keranjang:", error);
      toast.error(
        error.response?.data?.message ||
          "Gagal menambahkan ke keranjang. Pastikan Anda sudah login.",
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 💡 HELPER SENSOR NAMA (Contoh: "achmad zacky" -> "ac***ky")
  const getMaskedName = (name: string) => {
    if (!name || name.length <= 2) return name;
    return `${name.substring(0, 2)}***${name.substring(name.length - 2)}`;
  };

  // 💡 HELPER FORMAT TANGGAL
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🚧 DUMMY DATA SEMENTARA (Sambil Menunggu Backend Di-update)
  const DUMMY_SHOP = {
    name: product?.shopName || "Nexia Official Store",
    rating: 4.9,
    totalProducts: 124,
    joinDate: "2 Tahun Lalu",
    responseRate: "98%",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=" + product?.shopName,
  };

  const DUMMY_REVIEWS = [
    {
      id: 1,
      userName: "priskadev",
      rating: 5,
      date: "2026-10-29T17:56:00",
      variantName: "Titanium Blue, 256GB",
      comment:
        "Sepadan dengan Harga: Ya\nFitur Terbaik: Dynamic Island, Type C\n\nKerasa banget Upgrade Iphone Reguler Tahun ini. Pink nya soft banget. Finishing BackGlass nya Mate. Tidak bercak jari. Mantap lah pokoknya Unitnya tidak ada kendala. Katanya preorder tapi udh kayak di kirim tanpa preorder. cepat sekali ⚡⚡⚡",
      images: [
        "https://images.unsplash.com/photo-1603898037225-b44c6e4e89bd?w=100",
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=100",
      ],
    },
    {
      id: 2,
      userName: "dewiknthi288",
      rating: 4,
      date: "2026-02-04T16:21:00",
      variantName: "Titanium Gray, 512GB",
      comment:
        "Barang ori, imei terdaftar. Cuma pengirimannya agak telat 1 hari dari estimasi. Tapi so far puas sama barangnya.",
      images: [],
    },
    {
      id: 3,
      userName: "achmadzacky",
      rating: 5,
      date: "2026-01-15T09:30:00",
      variantName: "Titanium Black, 1TB",
      comment:
        "Gila sih ini performanya buat main game berat rata kanan semua! Kameranya juga jernih banget buat zoom jauh.",
      images: [
        "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=100",
      ],
    },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen pb-32 pt-40 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400"></div>
          <span className="text-cyan-400 font-bold animate-pulse uppercase tracking-widest">
            Memuat Data...
          </span>
        </div>
      </main>
    );
  }

  const productImages = [
    product?.imageUrl ||
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
  ];
  const filteredReviews =
    reviewFilter === "Semua"
      ? DUMMY_REVIEWS
      : DUMMY_REVIEWS.filter((r) => r.rating === reviewFilter);

  return (
    <main className="min-h-screen pb-32 pt-28 relative">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {/* 📱 AREA ATAS: DETAIL PRODUK */}
        <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* KIRI: Gambar Produk */}
          <div className="w-full flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl group">
              <img
                src={productImages[activeImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* KANAN: Checkout & Varian */}
          <div className="flex flex-col justify-start pt-4">
            <h1 className="mb-6 text-3xl font-black text-white md:text-4xl leading-tight">
              {product.name}
            </h1>

            {/* DYNAMIC PRICE BLOCK */}
            <div className="mb-8 flex flex-col gap-1 rounded-2xl bg-zinc-900/50 border border-white/5 p-5 backdrop-blur-md">
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Rp {dynamicPrice.toLocaleString("id-ID")}
              </p>
            </div>

            {/* VARIAN MATRIKS */}
            <div className="mb-8 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                  Pilihan Varian <span className="text-cyan-400">*</span>
                </span>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant: any) => {
                    const isActive = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`relative flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-all overflow-hidden ${
                          isActive
                            ? "border-cyan-400 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                            : "border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {isActive && (
                          <CheckCircle2 size={16} className="text-cyan-400" />
                        )}
                        <span>{variant.variantName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* KUANTITAS & ADD TO CART */}
            <div className="mb-8 flex items-center gap-6">
              <span className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Kuantitas
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900 p-1">
                  <button
                    onClick={handleDecrease}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                    disabled={quantity >= (selectedVariant?.stock || 0)}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-sm text-zinc-500 font-medium">
                  Tersisa {selectedVariant?.stock || 0} buah
                </span>
              </div>
            </div>

            <div className="mt-auto pt-6 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                <ShoppingCart size={20} />
                <span>
                  {isAddingToCart ? "Memproses..." : "Masukkan Keranjang"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 🏬 AREA TENGAH: KARTU PROFIL TOKO (SHOPEE CLONE) */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-6 w-full md:w-auto md:border-r border-white/10 md:pr-10">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/10 bg-black">
              <img
                src={DUMMY_SHOP.avatar}
                alt="Avatar Toko"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-white">
                {DUMMY_SHOP.name}
              </h3>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                Aktif 2 Menit Lalu
              </span>
              <div className="mt-2 flex gap-2">
                <button className="flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-400 transition-colors hover:bg-cyan-500 hover:text-black">
                  <MessageSquare size={14} /> Chat Sekarang
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/5">
                  <Store size={14} /> Kunjungi Toko
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 w-full md:w-auto text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Penilaian</span>
              <span className="font-bold text-cyan-400">
                {DUMMY_SHOP.rating}k{" "}
                <span className="text-xs font-normal text-zinc-500">/ 5.0</span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Produk</span>
              <span className="font-bold text-cyan-400">
                {DUMMY_SHOP.totalProducts}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Performa Chat</span>
              <span className="font-bold text-cyan-400">
                {DUMMY_SHOP.responseRate}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Bergabung</span>
              <span className="font-bold text-cyan-400">
                {DUMMY_SHOP.joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* 📚 AREA BAWAH: TABS & ULASAN */}
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-zinc-900/30 p-6 md:p-10 backdrop-blur-xl">
          <div className="mb-8 flex gap-8 border-b border-white/10 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {["deskripsi", "spesifikasi", "ulasan"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-4 text-lg font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === tab ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {tab}
                {tab === "ulasan" && (
                  <span className="ml-2 text-xs bg-cyan-500 text-black px-2 py-0.5 rounded-full">
                    {DUMMY_REVIEWS.length}
                  </span>
                )}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px] text-zinc-300">
            {/* TAB DESKRIPSI & SPESIFIKASI (Sama seperti sebelumnya) */}
            {activeTab === "deskripsi" && (
              <div className="animate-in fade-in duration-500 space-y-6 text-base leading-relaxed">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
            {activeTab === "spesifikasi" && (
              <div className="animate-in fade-in duration-500">
                <p className="text-zinc-500 italic">
                  Spesifikasi teknis belum ditambahkan oleh Toko.
                </p>
              </div>
            )}

            {/* ⭐ THE REVIEW ENGINE (SHOPEE CLONE) */}
            {activeTab === "ulasan" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-8">
                {/* Review Header & Filters */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 rounded-2xl bg-black/20 border border-white/5 p-6">
                  <div className="flex flex-col items-center justify-center min-w-[120px]">
                    <div className="text-5xl font-black text-white flex items-baseline gap-1">
                      4.8{" "}
                      <span className="text-xl text-zinc-500 font-medium">
                        / 5
                      </span>
                    </div>
                    <div className="flex text-yellow-400 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          fill={i < 4 ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setReviewFilter("Semua")}
                      className={`px-5 py-2 rounded-xl text-sm font-bold border transition-colors ${reviewFilter === "Semua" ? "bg-cyan-500 text-black border-cyan-500" : "bg-transparent text-zinc-400 border-white/10 hover:border-cyan-500/50"}`}
                    >
                      Semua
                    </button>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewFilter(star)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold border transition-colors ${reviewFilter === star ? "bg-cyan-500 text-black border-cyan-500" : "bg-transparent text-zinc-400 border-white/10 hover:border-cyan-500/50"}`}
                      >
                        {star} Bintang
                      </button>
                    ))}
                    <button className="px-5 py-2 rounded-xl text-sm font-bold border border-white/10 bg-transparent text-zinc-400 hover:border-cyan-500/50">
                      Dengan Komentar
                    </button>
                    <button className="px-5 py-2 rounded-xl text-sm font-bold border border-white/10 bg-transparent text-zinc-400 hover:border-cyan-500/50">
                      Dengan Media
                    </button>
                  </div>
                </div>

                {/* Review List */}
                <div className="flex flex-col divide-y divide-white/5">
                  {filteredReviews.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 flex flex-col items-center gap-3">
                      <MessageCircle size={48} className="opacity-20" />
                      <p>Belum ada ulasan untuk filter ini.</p>
                    </div>
                  ) : (
                    filteredReviews.map((review) => (
                      <div key={review.id} className="flex gap-4 py-8">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.userName}`}
                            alt="avatar"
                          />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-bold text-white">
                            {getMaskedName(review.userName)}
                          </span>
                          <div className="flex text-yellow-400 mt-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={
                                  i < review.rating ? "currentColor" : "none"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-zinc-500 mb-3">
                            {formatDate(review.date)} | Variasi:{" "}
                            {review.variantName}
                          </span>

                          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {review.comment}
                          </p>

                          {/* Foto Review */}
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mt-4">
                              {review.images.map((img, i) => (
                                <div
                                  key={i}
                                  className="h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                  <img
                                    src={img}
                                    alt="review"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 flex items-center gap-2 text-zinc-500 text-xs cursor-pointer hover:text-cyan-400 transition-colors w-max">
                            <ThumbsUp size={14} /> Membantu?
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
