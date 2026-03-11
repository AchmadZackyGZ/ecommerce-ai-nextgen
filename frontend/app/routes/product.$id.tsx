import { useState } from "react";
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
} from "lucide-react";
import { useCartStore } from "~/store/cartStore";
import { toast } from "sonner";
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta(
    "Detail Produk",
    "Spesifikasi dan ulasan lengkap produk premium Nexia.",
  );

// 🔥 DATA DUMMY SUPER LENGKAP (Simulasi API Database)
const DUMMY_PRODUCT = {
  id: 901,
  name: "Sony WH-1000XM5 Noise Cancelling",
  category: "Audio",
  // Logika Harga & Diskon
  originalPrice: 5500000,
  price: 5225000,
  discountPercentage: 5,
  // Social Proof
  rating: 4.9,
  reviewsCount: 1245,
  soldCount: "2RB+",
  // Multimedia
  hasVideo: true,
  images: [
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1200", // Anggap ini thumbnail video
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1200", // Foto 1
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200", // Foto 2 (angle lain)
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1200", // Foto 3
  ],
  // Spesifikasi Data Matrix
  specs: {
    Merek: "Sony",
    Stok: "TERSEDIA",
    "Dikirim Dari": "KOTA JAKARTA PUSAT",
    "Masa Garansi": "12 Bulan",
    "Jenis Garansi": "Garansi Resmi Sony Indonesia",
    Koneksi: "Bluetooth 5.2 & Kabel Audio 3.5mm",
    Baterai: "Hingga 30 Jam (ANC On)",
  },
  description:
    "Headphone wireless premium dengan teknologi noise cancelling terbaik di kelasnya. Dilengkapi dengan prosesor V1 yang terintegrasi penuh, 8 mikrofon mematikan untuk meredam kebisingan secara absolut, dan daya tahan baterai hingga 30 jam pemakaian nonstop. Sangat cocok bagi audiophile maupun profesional.",
  // Mesin Ulasan
  reviews: [
    {
      id: 1,
      user: "z***y",
      date: "2026-03-10",
      rating: 5,
      comment:
        "Gila sih ini noise cancelling-nya! Dipakai di kafe yang berisik langsung hening total. Bass-nya juga nendang banget tapi ga lebay. Worth every penny!",
      hasMedia: true,
    },
    {
      id: 2,
      user: "f***k",
      date: "2026-02-28",
      rating: 5,
      comment:
        "Pengiriman super cepat, packaging aman banget pakai bubble wrap tebal. Barangnya original, gampang connect ke laptop dan HP barengan (multipoint).",
      hasMedia: false,
    },
    {
      id: 3,
      user: "a***n",
      date: "2026-01-15",
      rating: 4,
      comment:
        "Suara mantap, sayangnya case bawaannya agak bulky kalau dimasukin ke tas kecil. But overall perfect product from Sony.",
      hasMedia: true,
    },
  ],
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  // State untuk interaktivitas
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("deskripsi"); // deskripsi | spesifikasi | ulasan

  const handleAddToCart = () => {
    // Memasukkan barang ke Zustand Cart
    addItem({
      id: DUMMY_PRODUCT.id,
      name: DUMMY_PRODUCT.name,
      price: DUMMY_PRODUCT.price, // Harga yang dimasukkan adalah harga diskon!
      category: DUMMY_PRODUCT.category,
      imageUrl: DUMMY_PRODUCT.images[1], // Ambil gambar aslinya
    });
    toast.success(`${DUMMY_PRODUCT.name} masuk ke keranjang!`);
    toggleCart();
  };

  return (
    <main className="min-h-screen pb-32 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {/* 🚀 BAGIAN 1: SPLIT SCREEN HERO (MULTIMEDIA & CONVERSION) */}
        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* KIRI: The Multimedia Carousel */}
          <div className="w-full flex flex-col gap-4">
            {/* Main Image Display */}
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl group">
              <img
                src={DUMMY_PRODUCT.images[activeImageIndex]}
                alt={DUMMY_PRODUCT.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay Video jika index 0 dan ada video */}
              {DUMMY_PRODUCT.hasVideo && activeImageIndex === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:bg-black/20">
                  <PlayCircle
                    size={64}
                    className="text-white opacity-80 shadow-2xl"
                  />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              {DUMMY_PRODUCT.images.map((img, idx) => (
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
                  {DUMMY_PRODUCT.hasVideo && idx === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <PlayCircle size={20} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* KANAN: The Conversion Header */}
          <div className="flex flex-col justify-start pt-4">
            {/* Social Proof Header */}
            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-medium">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/30">
                {DUMMY_PRODUCT.category}
              </span>
              <div className="flex items-center gap-1.5 text-white">
                <Star size={16} className="fill-yellow-500 text-yellow-500" />
                <span className="font-bold border-b border-white">
                  {DUMMY_PRODUCT.rating}
                </span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <span className="text-zinc-300">
                {DUMMY_PRODUCT.reviewsCount} Penilaian
              </span>
              <div className="h-4 w-px bg-white/20"></div>
              <span className="text-zinc-300">
                {DUMMY_PRODUCT.soldCount} Terjual
              </span>
            </div>

            <h1 className="mb-6 text-3xl font-black text-white md:text-4xl leading-tight">
              {DUMMY_PRODUCT.name}
            </h1>

            {/* Price Block (Silang Diskon) */}
            <div className="mb-8 flex flex-col gap-1 rounded-2xl bg-zinc-900/50 border border-white/5 p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-zinc-500 line-through decoration-red-500/50">
                  Rp {DUMMY_PRODUCT.originalPrice.toLocaleString("id-ID")}
                </span>
                <span className="flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-black text-red-500 border border-red-500/20">
                  -{DUMMY_PRODUCT.discountPercentage}%
                </span>
              </div>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Rp {DUMMY_PRODUCT.price.toLocaleString("id-ID")}
              </p>
            </div>

            {/* AI Insights Box */}
            <div className="mb-8 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2 text-cyan-400">
                <Sparkles size={20} />
                <h3 className="font-bold">Nexia AI Insights</h3>
              </div>
              <ul className="space-y-2 text-sm text-cyan-50/80">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />{" "}
                  Kualitas audio dinilai "Audiophile-Grade" oleh 92% pengulas
                  teknologi.
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />{" "}
                  Tren harga stabil, ini adalah waktu yang tepat untuk membeli.
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-6 flex gap-3 md:gap-4">
              <button
                onClick={handleAddToCart}
                // 🔥 FIX: Padding diperkecil untuk HP (py-3.5), teks mengecil (text-xs)
                className="group flex flex-1 items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl bg-white px-2 py-3.5 md:py-4 font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                {/* 🔥 THE MAGIC: Tambahkan shrink-0 agar ikon tidak gepeng, dan atur ukurannya responsif */}
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 shrink-0 transition-transform group-hover:-rotate-12" />
                <span className="text-[11px] leading-tight sm:text-sm md:text-base">
                  Masukkan Keranjang
                </span>
              </button>

              <button
                // 🔥 FIX: Menyamakan padding dan teks dengan tombol di sebelahnya
                className="flex-1 rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-2 py-3.5 md:py-4 text-[12px] sm:text-sm md:text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 BAGIAN 2: THE DATA MATRIX & SOCIAL PROOF ENGINE */}
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-zinc-900/30 p-6 md:p-10 backdrop-blur-xl">
          {/* Tabs Navigasi */}
          <div className="mb-8 flex gap-8 border-b border-white/10 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {["deskripsi", "spesifikasi", "ulasan"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-4 text-lg font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {tab === "ulasan"
                  ? `Penilaian (${DUMMY_PRODUCT.reviewsCount})`
                  : tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Konten Tabs */}
          <div className="min-h-[300px] text-zinc-300">
            {/* TAB: DESKRIPSI */}
            {activeTab === "deskripsi" && (
              <div className="animate-in fade-in duration-500 space-y-6 text-base leading-relaxed">
                <p>{DUMMY_PRODUCT.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 rounded-xl bg-black/20 p-4">
                    <ShieldCheck className="text-purple-400" /> Garansi Resmi 1
                    Tahun
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-black/20 p-4">
                    <Truck className="text-cyan-400" /> Gratis Ongkir
                    Instan/Sameday
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SPESIFIKASI */}
            {activeTab === "spesifikasi" && (
              <div className="animate-in fade-in duration-500 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {Object.entries(DUMMY_PRODUCT.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-white/5 py-4"
                  >
                    <span className="text-zinc-500 font-medium">{key}</span>
                    <span className="text-white font-semibold text-right max-w-[60%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: ULASAN (SOCIAL PROOF) */}
            {activeTab === "ulasan" && (
              <div className="animate-in fade-in duration-500">
                {/* Header Rating Bintang */}
                <div className="mb-10 flex flex-col md:flex-row items-center gap-6 rounded-2xl bg-black/30 p-6 md:p-8 border border-white/5">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white">
                      {DUMMY_PRODUCT.rating}
                    </span>
                    <span className="text-sm text-zinc-500 mt-1">dari 5</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={32}
                        className="fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                  <div className="md:ml-auto flex gap-3 flex-wrap justify-center">
                    <button className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400 border border-cyan-500/20">
                      Semua (1.2K)
                    </button>
                    <button className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-700">
                      Dengan Media (428)
                    </button>
                    <button className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-700">
                      5 Bintang (1.1K)
                    </button>
                  </div>
                </div>

                {/* Daftar Komentar */}
                <div className="space-y-6">
                  {DUMMY_PRODUCT.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl bg-zinc-900/50 p-6 border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-purple-700 font-bold text-white shadow-lg">
                            {review.user[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white text-sm">
                              {review.user}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className="fill-yellow-500 text-yellow-500"
                                />
                              ))}
                              <span className="ml-2">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 size={14} /> Terverifikasi
                        </div>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                        {review.comment}
                      </p>
                      {review.hasMedia && (
                        <div className="flex gap-2">
                          <div className="h-16 w-16 rounded-lg bg-zinc-800 border border-white/10 animate-pulse"></div>
                          <div className="h-16 w-16 rounded-lg bg-zinc-800 border border-white/10 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
