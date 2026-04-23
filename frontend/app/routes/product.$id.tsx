import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
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
import { useChatStore } from "~/store/chatStore";
import { toast } from "sonner";
import { generateMeta } from "~/utils/seo";
import { apiClient } from "~/services/apiClient";
import { useAuthStore } from "~/store/authStore";

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
  const [reviews, setReviews] = useState<any[]>([]); // 🔥 STATE BARU UNTUK REVIEW ASLI
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // 🔥 STATE BARU UNTUK CHAT
  const openChatWithSeller = useChatStore(
    (state: any) => state.openChatWithSeller,
  );

  const user = useAuthStore((state: any) => state.user);

  // 🎨 State UI
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("ulasan");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | string>("Semua"); // 🔥 Tipe diubah untuk dukung filter string

  // 🚀 MESIN PENARIK DATA DARI SPRING BOOT (DOUBLE FETCHING)
  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setIsLoading(true);

        // 🔥 LAKUKAN 2 REQUEST SEKALIGUS UNTUK PERFORMA MAKSIMAL
        const [productRes, reviewsRes] = await Promise.all([
          apiClient.get(`/products/${id}`),
          apiClient.get(`/reviews/product/${id}`), // Menyedot dari API ReviewController Anda!
        ]);

        const fetchedProduct = productRes.data.data;
        setProduct(fetchedProduct);

        if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
          setSelectedVariant(fetchedProduct.variants[0]);
        }

        // Simpan data ulasan asli ke State
        setReviews(reviewsRes.data.data || []);
      } catch (error) {
        console.error("Gagal memuat data:", error);
        toast.error("Produk tidak ditemukan atau server bermasalah.");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndReviews();
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

  // 💡 HELPER SENSOR NAMA
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

  // 📊 MESIN PENGHITUNG STATISTIK ULASAN DINAMIS (Berdasarkan Data Asli)
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const withCommentCount = reviews.filter(
    (r) => r.comment && r.comment.trim() !== "",
  ).length;
  const withMediaCount = reviews.filter((r) => r.imageUrl).length;

  // 🔍 MESIN FILTER ULASAN
  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === "Semua") return true;
    if (reviewFilter === "Dengan Komentar")
      return r.comment && r.comment.trim() !== "";
    if (reviewFilter === "Dengan Media") return !!r.imageUrl;
    return r.rating === reviewFilter;
  });

  const shopData = {
    name: product?.shopName || "Toko Nexia",
    avatar:
      product?.shopAvatar ||
      `https://api.dicebear.com/7.x/shapes/svg?seed=${product?.shopName || "Nexia"}`,
    rating: product?.shopRating ? Number(product.shopRating).toFixed(1) : "4.8",
    totalProducts: product?.shopTotalProducts || 0,
    joinDate: product?.shopJoinDate || "Baru Bergabung",
    responseRate: product?.shopResponseRate || "100%",
    lastActive: product?.shopLastActive || "Offline",
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pb-32 pt-40 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400"></div>
          <span className="text-cyan-400 font-bold animate-pulse uppercase tracking-widest">
            Memuat Data Produk...
          </span>
        </div>
      </main>
    );
  }

  const productImages = [
    product?.imageUrl ||
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
  ];

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

        {/* 🏬 AREA TENGAH: KARTU PROFIL TOKO */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-6 w-full md:w-auto md:border-r border-white/10 md:pr-10">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/10 bg-black">
              <img
                src={shopData.avatar}
                alt="Avatar Toko"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-white">{shopData.name}</h3>
              <span
                className={`text-[11px] font-bold flex items-center gap-1.5 mt-0.5 ${shopData.lastActive === "Offline" ? "text-zinc-500" : "text-emerald-400"}`}
              >
                {shopData.lastActive !== "Offline" && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></span>
                )}
                {shopData.lastActive}
              </span>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    const sellerId = product.shopOwnerId;

                    // Keamanan ekstra: Cegah user chat dengan dirinya sendiri jika dia membuka produknya sendiri
                    if (String(sellerId) === String(user?.id)) {
                      return toast.error(
                        "Anda tidak bisa chat dengan toko Anda sendiri!",
                      );
                    }

                    if (!sellerId) {
                      return toast.error(
                        "Gagal memuat data toko. Silakan refresh halaman.",
                      );
                    }

                    // Buka chat dengan toko berdasarkan data produk!
                    openChatWithSeller(String(sellerId), {
                      name: product.name,
                      price: dynamicPrice,
                      image: productImages[0],
                    });
                  }}
                  className="flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-400 transition-colors hover:bg-cyan-500 hover:text-black"
                >
                  <MessageSquare size={14} /> Chat Sekarang
                </button>
                {/* 🚀 INI DIA TOMBOL KUNJUNGI TOKO NYA! */}
                <Link
                  to={`/toko/${product.shopId}`} // Menggunakan shopId dari ProductResponse
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs font-black hover:bg-cyan-500 hover:text-black transition-all border border-cyan-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                >
                  <Store size={14} /> Kunjungi Toko
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 w-full md:w-auto text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Penilaian Toko</span>
              <span className="font-bold text-cyan-400">
                {shopData.rating}k{" "}
                <span className="text-xs font-normal text-zinc-500">/ 5.0</span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Produk</span>
              <span className="font-bold text-cyan-400">
                {shopData.totalProducts}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Performa Chat</span>
              <span className="font-bold text-cyan-400">
                {shopData.responseRate}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Bergabung</span>
              <span className="font-bold text-cyan-400">
                {shopData.joinDate}
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
                    {totalReviews}
                  </span>
                )}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px] text-zinc-300">
            {/* TAB DESKRIPSI & SPESIFIKASI */}
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

            {/* ⭐ TAB ULASAN DINAMIS DARI DATABASE */}
            {activeTab === "ulasan" && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-8">
                {/* Review Header & Filters Dinamis */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 rounded-2xl bg-black/20 border border-white/5 p-6">
                  <div className="flex flex-col items-center justify-center min-w-[120px]">
                    <div className="text-5xl font-black text-white flex items-baseline gap-1">
                      {averageRating}{" "}
                      <span className="text-xl text-zinc-500 font-medium">
                        / 5
                      </span>
                    </div>
                    <div className="flex text-yellow-400 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          fill={
                            i < Math.round(Number(averageRating))
                              ? "currentColor"
                              : "none"
                          }
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
                        {star} Bintang (
                        {ratingCounts[star as keyof typeof ratingCounts]})
                      </button>
                    ))}
                    <button
                      onClick={() => setReviewFilter("Dengan Komentar")}
                      className={`px-5 py-2 rounded-xl text-sm font-bold border transition-colors ${reviewFilter === "Dengan Komentar" ? "bg-cyan-500 text-black border-cyan-500" : "bg-transparent text-zinc-400 border-white/10 hover:border-cyan-500/50"}`}
                    >
                      Dengan Komentar ({withCommentCount})
                    </button>
                    <button
                      onClick={() => setReviewFilter("Dengan Media")}
                      className={`px-5 py-2 rounded-xl text-sm font-bold border transition-colors ${reviewFilter === "Dengan Media" ? "bg-cyan-500 text-black border-cyan-500" : "bg-transparent text-zinc-400 border-white/10 hover:border-cyan-500/50"}`}
                    >
                      Dengan Media ({withMediaCount})
                    </button>
                  </div>
                </div>

                {/* Review List Dinamis */}
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
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.customerName}`}
                            alt="avatar"
                          />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-bold text-white">
                            {getMaskedName(review.customerName)}
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
                            {formatDate(review.createdAt)}
                          </span>

                          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {review.comment}
                          </p>

                          {/* Foto Review dari Cloudinary */}
                          {review.imageUrl && (
                            <div className="flex gap-2 mt-4">
                              <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-80 transition-opacity">
                                <img
                                  src={review.imageUrl}
                                  alt="Bukti Review"
                                  className="h-full w-full object-cover"
                                />
                              </div>
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
