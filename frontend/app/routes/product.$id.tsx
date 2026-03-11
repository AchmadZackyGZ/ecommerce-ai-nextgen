import { useParams, useNavigate } from "react-router";
import {
  Sparkles,
  ShoppingCart,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Star,
} from "lucide-react";
import { userCartStore } from "~/store/cartStore";
import { toast } from "sonner";
import { generateMeta } from "~/utils/seo";

// SEO Dinamis
export const meta = () =>
  generateMeta(
    "Detail Produk",
    "Spesifikasi lengkap dari produk pilihan Anda.",
  );

// Data Dummy Sempurna untuk simulasi visual
const DUMMY_PRODUCT = {
  id: 1, // Akan diabaikan sementara karena kita pakai data statis ini untuk semua ID
  name: "Sony WH-1000XM5 Noise Cancelling",
  price: 5500000,
  category: "Audio",
  imageUrl:
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1200&auto=format&fit=crop",
  description:
    "Headphone wireless premium dengan teknologi noise cancelling terbaik di kelasnya. Dilengkapi dengan prosesor V1 yang terintegrasi, 8 mikrofon untuk meredam kebisingan, dan daya tahan baterai hingga 30 jam pemakaian nonstop.",
  rating: 4.9,
  reviews: 1245,
};

export default function ProductDetail() {
  const { id } = useParams(); // Mengambil ID dari URL (misal: /product/1)
  const navigate = useNavigate();

  // Memanggil fungsi dari brankas Cart kita
  const addItem = userCartStore((state) => state.addItem);
  const toggleCart = userCartStore((state) => state.toggleCart);

  // Fungsi ketika tombol ditekan
  const handleAddToCart = () => {
    addItem(DUMMY_PRODUCT); // Masukkan barang ke Zustand
    toast.success(`${DUMMY_PRODUCT.name} masuk ke keranjang!`);
    toggleCart(); // Otomatis membuka laci keranjang
  };

  return (
    <main className="min-h-screen pb-32 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {/* Tombol Kembali */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Kembali ke Katalog
        </button>

        {/* Layout Utama Split-Screen */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* KIRI: Galeri Gambar Kosmik */}
          <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 blur-[100px]" />
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
              <img
                src={DUMMY_PRODUCT.imageUrl}
                alt={DUMMY_PRODUCT.name}
                className="h-full w-full object-cover mix-blend-overlay opacity-90 transition-transform duration-700 hover:scale-105 hover:opacity-100"
              />
            </div>
          </div>

          {/* KANAN: Informasi Produk */}
          <div className="flex flex-col justify-center">
            {/* Badge & Rating */}
            <div className="mb-4 flex items-center gap-4">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/30">
                {DUMMY_PRODUCT.category}
              </span>
              <div className="flex items-center gap-1 text-sm font-medium text-zinc-300">
                <Star size={16} className="fill-yellow-500 text-yellow-500" />
                <span>{DUMMY_PRODUCT.rating}</span>
                <span className="text-zinc-500">
                  ({DUMMY_PRODUCT.reviews} ulasan)
                </span>
              </div>
            </div>

            {/* Judul & Harga */}
            <h1 className="mb-4 text-3xl font-black text-white md:text-5xl leading-tight">
              {DUMMY_PRODUCT.name}
            </h1>
            <p className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Rp {DUMMY_PRODUCT.price.toLocaleString("id-ID")}
            </p>

            {/* 🤖 THE AI INSIGHTS BOX (Keunggulan Utama UX Kita) */}
            <div className="mb-8 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2 text-cyan-400">
                <Sparkles size={20} />
                <h3 className="font-bold">Nexia AI Insights</h3>
              </div>
              <ul className="space-y-2 text-sm text-cyan-50/80">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                  Sangat cocok untuk Anda yang sering bekerja di lingkungan
                  bising (kantor/kafe).
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                  Kualitas audio dinilai "Audiophile-Grade" oleh 92% pengulas
                  teknologi.
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                  Tren harga stabil, ini adalah waktu yang tepat untuk membeli.
                </li>
              </ul>
            </div>

            {/* Deskripsi Standar */}
            <p className="mb-8 text-base leading-relaxed text-zinc-400">
              {DUMMY_PRODUCT.description}
            </p>

            {/* Benefit Features */}
            <div className="mb-10 grid grid-cols-2 gap-4 border-y border-white/10 py-6 text-sm font-medium text-zinc-300">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-purple-400" /> Garansi
                Resmi 1 Tahun
              </div>
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-cyan-400" /> Gratis Ongkir
                Premium
              </div>
            </div>

            {/* 🔥 ACTION BUTTONS */}
            <button
              onClick={handleAddToCart}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-5 font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
            >
              <ShoppingCart
                size={20}
                className="transition-transform group-hover:-rotate-12"
              />
              <span>
                Add to Cart — Rp {DUMMY_PRODUCT.price.toLocaleString("id-ID")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
