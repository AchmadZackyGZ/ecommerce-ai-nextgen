import { generateMeta } from "~/utils/seo";
import ProductCard, {
  type ProductProps,
} from "~/components/ecommerce/ProductCard";
import HeroBanner from "~/components/home/HeroBanner";
import CategoryPills from "~/components/home/CategoryPills";
import TimeDrops from "~/components/home/TimeDrops";
import AiRecommendationGrid from "~/components/home/AiRecommendationGrid";
import { useEffect, useState } from "react";
import { apiClient } from "~/services/apiClient";

// Pabrik SEO Dinamis ✨
export const meta = () =>
  generateMeta(
    "Home",
    "Temukan produk teknologi masa depan yang dikurasi oleh AI.",
  );

export default function Home() {
  const [products, setProducts] = useState<any>([]);
  const [isloading, setLoading] = useState(false);

  // State untuk Flash Sale (Time-Drops)
  // Saat ini kita biarkan kosong [] karena fitur Admin/Approval belum kita buat.
  // TODO: Buat fitur Admin/Approval
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get("/products");
        setProducts(response.data.data); // Spring Boot kita membungkus data di dalam object "data" (ApiResponse)
      } catch (error) {
        console.error("Gagal memuat katalog Nexia:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  return (
    <main className="min-h-screen pb-32 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {/* 🌌 ZONA 1: THE COSMIC HERO BANNER */}
        <HeroBanner />

        {/* ⚡ ZONA 3: NEXIA TIME-DROPS */}
        {/* LOGIKA SAKTI: Komponen ini HANYA akan dirender JIKA ada minimal 1 barang flash sale */}
        {flashSaleProducts.length > 0 && (
          <div className="mt-12">
            <TimeDrops products={flashSaleProducts} />
          </div>
        )}

        {/* 💊 ZONA 2: NEON CATEGORY PILLS */}
        <div className="mt-12">
          <CategoryPills />
        </div>

        {/* 🤖 ZONA 4: AI RECOMMENDATION GRID */}
        <div className="mt-12 md:mt-16">
          {isloading ? (
            // Efek loading sementara saat React menunggu balasan dari Spring Boot
            <div className="flex justify-center items-center h-40">
              <span className="text-cyan-400 font-bold animate-pulse tracking-widest uppercase">
                Menginisialisasi Nexia AI Engine...
              </span>
            </div>
          ) : (
            // Kita oper data 'products' dari backend ke komponen Grid Anda
            <AiRecommendationGrid products={products} />
          )}
        </div>
      </div>
    </main>
  );
}
