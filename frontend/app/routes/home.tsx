import { generateMeta } from "~/utils/seo";
import ProductCard, {
  type ProductProps,
} from "~/components/ecommerce/ProductCard";
import HeroBanner from "~/components/home/HeroBanner";
import CategoryPills from "~/components/home/CategoryPills";
import TimeDrops from "~/components/home/TimeDrops";
import AiRecommendationGrid from "~/components/home/AiRecommendationGrid";

// Pabrik SEO Dinamis ✨
export const meta = () =>
  generateMeta(
    "Home",
    "Temukan produk teknologi masa depan yang dikurasi oleh AI.",
  );

// Data Dummy sementara sebelum AI Backend mengambil alih
const DUMMY_PRODUCTS: ProductProps[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max Titanium",
    price: 25000000,
    category: "Smartphone",
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Laptop Gaming AI NextGen",
    price: 35000000,
    category: "Laptop",
    imageUrl:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5 Noise Cancelling",
    price: 5500000,
    category: "Audio",
    imageUrl:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Mechanical Keyboard Keychron",
    price: 2100000,
    category: "Accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen pb-32 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {/* 🌌 ZONA 1: THE COSMIC HERO BANNER */}
        <HeroBanner />

        {/* ⚡ ZONA 3: NEXIA TIME-DROPS  */}
        {/* Nanti ini hanya akan merender data jika ada barang yang berstatus APPROVED oleh Admin */}
        <div className="mt-12">
          <TimeDrops />
        </div>

        {/* 💊 ZONA 2: NEON CATEGORY PILLS (Turun sedikit ke bawah) */}
        <div className="mt-12">
          <CategoryPills />
        </div>

        <div className="mt-12 md:mt-16">
          <AiRecommendationGrid />
        </div>
      </div>
    </main>
  );
}
