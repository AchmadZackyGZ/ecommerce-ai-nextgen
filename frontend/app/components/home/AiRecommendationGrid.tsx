import { useState, useEffect } from "react";
import { Sparkles, Cpu } from "lucide-react";
import ProductCard, {
  type ProductProps,
} from "~/components/ecommerce/ProductCard";
import { useAuthStore } from "~/store/authStore";

interface AiRecommendationGridGrup {
  products: any[];
}

export default function AiRecommendationGrid({
  products,
}: AiRecommendationGridGrup) {
  // State untuk mengontrol efek "AI sedang berpikir"
  const [isCurating, setIsCurating] = useState(true);

  // Ambil data user dari Zustand
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulasi delay API & AI Engine selama 1.5 detik
    const timer = setTimeout(() => {
      setIsCurating(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      {/* Header AI Recommendation */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-cyan-400">
            <Sparkles size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">
              Powered by Nexia Neural Engine
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Curated for You
          </h2>
          <p className="mt-1 text-sm md:text-base text-zinc-400">
            {user
              ? `Rekomendasi hasil analisis profil dan gaya belanja ${user.name}.`
              : "Rekomendasi cerdas berdasarkan tren teknologi global saat ini."}
          </p>
        </div>
      </div>

      {/* Efek Loading AI (Muncul selama 1.5 detik pertama) */}
      {isCurating ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-cyan-500/20 bg-cyan-950/10 py-20 backdrop-blur-sm">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/50 bg-black/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Cpu size={32} className="animate-pulse text-cyan-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white">
            Nexia AI is analyzing...
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-zinc-500">
            Mencocokkan jutaan titik data untuk menemukan perangkat keras yang
            sempurna untuk Anda.
          </p>
        </div>
      ) : (
        /* Grid Produk yang muncul setelah AI selesai "berpikir" */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 animate-in fade-in zoom-in-95 duration-700">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
