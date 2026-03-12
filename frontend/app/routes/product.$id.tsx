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
  Plus,
  Minus,
} from "lucide-react";
import { useCartStore } from "~/store/cartStore";
import { toast } from "sonner";
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta(
    "Detail Produk",
    "Spesifikasi dan ulasan lengkap produk premium Nexia.",
  );

// 🔥 DATA DUMMY DENGAN SISTEM VARIAN DINAMIS
const DUMMY_PRODUCT = {
  id: 901,
  name: "Sony WH-1000XM5 Noise Cancelling",
  category: "Audio",
  // Base Price (Harga Dasar sebelum ditambah varian mahal)
  originalBasePrice: 5500000,
  basePrice: 5225000,
  discountPercentage: 5,
  rating: 4.9,
  reviewsCount: 1245,
  soldCount: "2RB+",
  stock: 35,
  hasVideo: true,
  images: [
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1200", // 0: Video Thumbnail (Anggap Hitam)
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1200", // 1: Hitam
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200", // 2: Desert Gold (Simulasi)
    "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc2?q=80&w=1200", // 3: White Smoke (Simulasi)
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1200", // 4: Angle Lain
  ],
  // 🧠 THE VARIANT MATRIX DATA
  variantGroups: [
    {
      name: "Pilihan Warna",
      options: [
        { id: "c1", label: "Midnight Black", imageIndex: 1, priceModifier: 0 },
        {
          id: "c2",
          label: "Desert Gold",
          imageIndex: 2,
          priceModifier: 250000,
        }, // Edisi Emas lebih mahal!
        { id: "c3", label: "White Smoke", imageIndex: 3, priceModifier: 0 },
      ],
    },
    {
      name: "Paket Bundling",
      options: [
        { id: "b1", label: "Headphone Saja", priceModifier: 0 },
        { id: "b2", label: "+ Premium Hardcase", priceModifier: 350000 },
      ],
    },
  ],
  specs: {
    Merek: "Sony",
    Stok: "TERSEDIA",
    "Dikirim Dari": "KOTA JAKARTA PUSAT",
    "Masa Garansi": "12 Bulan",
    "Jenis Garansi": "Garansi Resmi Sony Indonesia",
  },
  description:
    "Headphone wireless premium dengan teknologi noise cancelling terbaik di kelasnya. Dilengkapi dengan prosesor V1 yang terintegrasi penuh, 8 mikrofon mematikan untuk meredam kebisingan secara absolut, dan daya tahan baterai hingga 30 jam pemakaian nonstop.",
  reviews: [
    {
      id: 1,
      user: "z***y",
      date: "2026-03-10",
      rating: 5,
      comment:
        "Gila sih ini noise cancelling-nya! Dipakai di kafe yang berisik langsung hening total.",
      hasMedia: true,
    },
    {
      id: 2,
      user: "f***k",
      date: "2026-02-28",
      rating: 5,
      comment:
        "Pengiriman super cepat. Barangnya original, gampang connect ke laptop dan HP barengan.",
      hasMedia: false,
    },
  ],
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("deskripsi");
  const [quantity, setQuantity] = useState(1);

  // 🧠 STATE UNTUK VARIAN YANG DIPILIH (Default: Opsi pertama dari setiap grup)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>(
    {
      "Pilihan Warna": DUMMY_PRODUCT.variantGroups[0].options[0],
      "Paket Bundling": DUMMY_PRODUCT.variantGroups[1].options[0],
    },
  );

  // 🧮 KALKULATOR HARGA DINAMIS (Harga Dasar + Harga Tambahan Varian)
  const dynamicPrice =
    DUMMY_PRODUCT.basePrice +
    Object.values(selectedVariants).reduce(
      (sum, variant) => sum + (variant.priceModifier || 0),
      0,
    );
  const dynamicOriginalPrice =
    DUMMY_PRODUCT.originalBasePrice +
    Object.values(selectedVariants).reduce(
      (sum, variant) => sum + (variant.priceModifier || 0),
      0,
    );

  // Fungsi saat Varian diklik
  const handleVariantSelect = (groupName: string, option: any) => {
    setSelectedVariants((prev) => ({ ...prev, [groupName]: option }));
    // 📸 IMAGE SYNC LOGIC: Ubah gambar jika varian punya index gambar (seperti Warna)
    if (option.imageIndex !== undefined) {
      setActiveImageIndex(option.imageIndex);
    }
  };

  // Fungsi mengubah kuantitas
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () =>
    setQuantity((prev) =>
      prev < DUMMY_PRODUCT.stock ? prev + 1 : DUMMY_PRODUCT.stock,
    );

  const handleAddToCart = () => {
    // Rangkum varian terpilih menjadi string untuk keranjang
    const variantString = Object.values(selectedVariants)
      .map((v) => v.label)
      .join(", ");

    addItem({
      id: DUMMY_PRODUCT.id,
      name: `${DUMMY_PRODUCT.name} (${variantString})`, // Nama barang di keranjang otomatis menyertakan variannya!
      price: dynamicPrice,
      category: DUMMY_PRODUCT.category,
      imageUrl:
        DUMMY_PRODUCT.images[activeImageIndex] || DUMMY_PRODUCT.images[1],
      quantity: quantity,
    } as any); // Cast ke any karena kita menambahkan properti quantity yang tidak ada di tipe Product asli

    toast.success(`Berhasil menambahkan varian ${variantString} ke keranjang!`);
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

        {/* 🚀 SPLIT SCREEN HERO */}
        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* KIRI: The Multimedia Carousel */}
          <div className="w-full flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl group">
              <img
                src={DUMMY_PRODUCT.images[activeImageIndex]}
                alt={DUMMY_PRODUCT.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {DUMMY_PRODUCT.hasVideo && activeImageIndex === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:bg-black/20">
                  <PlayCircle
                    size={64}
                    className="text-white opacity-80 shadow-2xl"
                  />
                </div>
              )}
            </div>
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

          {/* KANAN: The Conversion Header & Varian */}
          <div className="flex flex-col justify-start pt-4">
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

            {/* 💸 DYNAMIC PRICE BLOCK */}
            <div className="mb-8 flex flex-col gap-1 rounded-2xl bg-zinc-900/50 border border-white/5 p-5 backdrop-blur-md transition-all duration-300">
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-zinc-500 line-through decoration-red-500/50">
                  Rp {dynamicOriginalPrice.toLocaleString("id-ID")}
                </span>
                <span className="flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-black text-red-500 border border-red-500/20">
                  -{DUMMY_PRODUCT.discountPercentage}%
                </span>
              </div>
              {/* Harga membesar dan bersinar jika ada tambahan harga varian! */}
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-in slide-in-from-bottom-2">
                Rp {dynamicPrice.toLocaleString("id-ID")}
              </p>
            </div>

            {/* 🍱 NEXIA DYNAMIC VARIANT MATRIX */}
            <div className="mb-8 flex flex-col gap-6">
              {DUMMY_PRODUCT.variantGroups.map((group) => (
                <div key={group.name} className="flex flex-col gap-3">
                  <span className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                    {group.name} <span className="text-cyan-400">*</span>
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {group.options.map((option) => {
                      const isActive =
                        selectedVariants[group.name]?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            handleVariantSelect(group.name, option)
                          }
                          className={`relative flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-all overflow-hidden ${
                            isActive
                              ? "border-cyan-400 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                              : "border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {isActive && (
                            <CheckCircle2 size={16} className="text-cyan-400" />
                          )}
                          <span>{option.label}</span>
                          {/* Tampilkan indikator harga tambahan jika ada */}
                          {option.priceModifier > 0 && (
                            <span className="text-xs font-medium text-zinc-500">
                              (+Rp{" "}
                              {option.priceModifier.toLocaleString("id-ID")})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* 🔥 NEW: QUANTITY SELECTOR */}
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
                    disabled={quantity >= DUMMY_PRODUCT.stock}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-sm text-zinc-500 font-medium">
                  Tersisa {DUMMY_PRODUCT.stock} buah
                </span>
              </div>
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
                className="group flex flex-1 items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl bg-white px-2 py-3.5 md:py-4 font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 shrink-0 transition-transform group-hover:-rotate-12" />
                <span className="text-[11px] leading-tight sm:text-sm md:text-base">
                  Masukkan Keranjang
                </span>
              </button>
              <button className="flex-1 rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-2 py-3.5 md:py-4 text-[12px] sm:text-sm md:text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
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
