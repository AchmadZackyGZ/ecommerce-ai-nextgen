import type { Route } from "./+types/home";
import ProductCard from "~/components/ecommerce/ProductCard";

// Data dummy sementara agar kita bisa melihat bentuk desainnya
const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max Titanium",
    price: 25000000,
    category: "Smartphone",
    imageUrl:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop",
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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nexia | NextGeneration Of E-Commerce App" },
    {
      name: "description",
      content: "Belanja Kebutuhan Anda Dengan Pendamping AI Next-Generation",
    },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen pb-32 pt-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {/* Header Section */}
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-6xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Nexia
            </span>
          </h1>
          <p className="max-w-xl text-zinc-400">
            Jelajahi koleksi teknologi premium kami. Belanja lebih cerdas dengan
            bantuan kecerdasan buatan revolusioner.
          </p>
        </div>

        {/* BENTO BOX GRID */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {DUMMY_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
