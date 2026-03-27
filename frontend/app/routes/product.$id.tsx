import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Sparkles,
  ShoppingCart,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Star,
  PlayCircle,
  MessageSquareQuote,
  CheckCircle2,
  Plus,
  Minus,
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
  const toggleCart = useCartStore((state) => state.toggleCart);

  //  STATE : Data Asli dari Backend
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // State UI
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("deskripsi");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  //  MESIN PENARIK DATA DARI SPRING BOOT
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
        navigate("/"); // Tendang ke home jika produk tidak ada
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  //  KALKULATOR HARGA DINAMIS V1 (Harga Dasar Produk + Harga Tambahan Varian)
  const dynamicPrice =
    (product?.price || 0) + (selectedVariant?.priceModifier || 0);

  // Fungsi mengubah kuantitas
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () =>
    setQuantity((prev) =>
      prev < (selectedVariant?.stock || product?.stock || 1) ? prev + 1 : prev,
    );

  //   ADD TO CART (MENEMBAK API BACKEND)
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      return toast.error("Silakan pilih varian terlebih dahulu!");
    }

    try {
      setIsAddingToCart(true);
      //  KITA TEMBAK LANGSUNG KE API KERANJANG KITA!
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

      // Buka panel keranjang jika Anda punya Drawer
      // toggleCart();
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

  // Tampilan Loading Kosmik
  if (isLoading) {
    return (
      <main className="min-h-screen pb-32 pt-40 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400"></div>
          <span className="text-cyan-400 font-bold animate-pulse uppercase tracking-widest">
            Loading Data...
          </span>
        </div>
      </main>
    );
  }

  // Fallback Data Gambar (karena backend baru punya 1 gambar)
  const productImages = [product.imageUrl];

  return (
    <main className="min-h-screen pb-32 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {/*  SPLIT SCREEN HERO */}
        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* KIRI: The Multimedia Carousel */}
          <div className="w-full flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl group">
              <img
                src={productImages[activeImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Carousel Thumbnail Tetap Ada (Meski cuma 1 gambar untuk sekarang) */}
            <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImageIndex === idx ? "border-cyan-400 opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}
                >
                  <img
                    src={img}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* KANAN: The Conversion Header & Varian */}
          <div className="flex flex-col justify-start pt-4">
            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-medium">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/30">
                Dari Toko: {product.shopName}
              </span>
            </div>

            <h1 className="mb-6 text-3xl font-black text-white md:text-4xl leading-tight">
              {product.name}
            </h1>

            {/*  DYNAMIC PRICE BLOCK V1 */}
            <div className="mb-8 flex flex-col gap-1 rounded-2xl bg-zinc-900/50 border border-white/5 p-5 backdrop-blur-md transition-all duration-300">
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-in slide-in-from-bottom-2">
                Rp {dynamicPrice.toLocaleString("id-ID")}
              </p>
            </div>

            {/*  NEXIA DYNAMIC VARIANT MATRIX V1 */}
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
                        {/* Indikator harga tambahan */}
                        {variant.priceModifier > 0 && (
                          <span className="text-xs font-medium text-emerald-400">
                            (+Rp {variant.priceModifier.toLocaleString("id-ID")}
                            )
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/*  QUANTITY SELECTOR */}
            <div className="mb-8 flex items-center gap-6">
              <span className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Kuantitas
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900 p-1">
                  <button
                    onClick={handleDecrease}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50"
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

            {/* Action Buttons */}
            <div className="mt-auto pt-6 flex gap-3 md:gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="group flex flex-1 items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl bg-white px-2 py-3.5 md:py-4 font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 shrink-0 transition-transform group-hover:-rotate-12" />
                <span className="text-[11px] leading-tight sm:text-sm md:text-base">
                  {isAddingToCart ? "Memproses..." : "Masukkan Keranjang"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/*  BAGIAN 2: THE DATA MATRIX (Deskripsi Produk) */}
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-zinc-900/30 p-6 md:p-10 backdrop-blur-xl">
          <div className="mb-8 flex gap-8 border-b border-white/10 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {["deskripsi", "spesifikasi"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-4 text-lg font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[200px] text-zinc-300">
            {activeTab === "deskripsi" && (
              <div className="animate-in fade-in duration-500 space-y-6 text-base leading-relaxed">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {activeTab === "spesifikasi" && (
              <div className="animate-in fade-in duration-500 grid grid-cols-1 gap-y-4">
                <p className="text-zinc-500 italic">
                  Spesifikasi teknis belum ditambahkan oleh Toko{" "}
                  {product.shopName}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
