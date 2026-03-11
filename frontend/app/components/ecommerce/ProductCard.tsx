import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

// Blueprint data sementara sebelum kita sambungkan ke Java Spring Boot
export interface ProductProps {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
}

export default function ProductCard({ product }: { product: ProductProps }) {
  return (
    <Card className="group relative overflow-hidden rounded-3xl border-white/5 bg-zinc-900/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-zinc-800/80 hover:shadow-[0_10px_40px_-15px_rgba(6,182,212,0.3)]">
      <CardContent className="p-4">
        {/* Wadah Gambar dengan efek Zoom saat di-hover */}
        <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-950">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
          />
          {/* Label Kategori Melayang */}
          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {product.category}
          </div>
        </div>

        {/* Informasi Produk */}
        <div className="flex flex-col gap-1 px-1">
          <h3 className="line-clamp-1 text-lg font-semibold text-zinc-100">
            {product.name}
          </h3>
          <p className="text-sm font-medium text-zinc-400">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-5 flex items-center justify-between px-1">
          <Link
            to={`/product/${product.id}`}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-bold text-black transition-transform hover:bg-zinc-200 active:scale-95"
          >
            Lihat Detail
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
