import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  PackageSearch,
  Tag,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "~/services/apiClient";
import { useAuthStore } from "~/store/authStore";
import { toast } from "sonner";
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta("Produk Saya", "Manajemen katalog produk toko Anda.");

export default function SellerProducts() {
  const user = useAuthStore((state: any) => state.user);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 🚀 FETCH DATA: Ambil produk HANYA milik toko ini
  const fetchMyProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/products");

      // Filter produk berdasarkan ID User (Penjual) yang sedang login
      const myProducts = res.data.data.filter(
        (p: any) => String(p.shopOwnerId) === String(user?.id),
      );

      // Urutkan dari yang terbaru
      myProducts.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setProducts(myProducts);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
      toast.error("Gagal memuat daftar produk dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchMyProducts();
  }, [user?.id]);

  // 🗑️ FUNGSI DELETE PRODUK
  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(
        `⚠️ PERINGATAN!\n\nYakin ingin menghapus permanen produk "${name}"? Data yang dihapus tidak bisa dikembalikan.`,
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/products/${id}`);
      toast.success(`Produk "${name}" berhasil dihapus dari katalog!`);
      // Refresh tabel setelah hapus
      fetchMyProducts();
    } catch (error: any) {
      console.error("Gagal menghapus:", error);
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menghapus produk.",
      );
    }
  };

  // 🔍 MESIN PENCARIAN LOKAL
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Produk Saya
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Kelola katalog, harga, dan stok barang jualan Anda.
          </p>
        </div>

        <Link
          to="/seller/products/new"
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} /> Tambah Produk Baru
        </Link>
      </div>

      {/* 2. SEARCH BAR & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-6 text-sm font-medium w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Total:</span>
            <span className="text-white bg-zinc-800 px-3 py-1 rounded-lg">
              {products.length} Produk
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN TABLE AREA */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden flex-1 flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-zinc-400 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="p-4 font-bold w-16">Foto</th>
                <th className="p-4 font-bold">Info Produk</th>
                <th className="p-4 font-bold text-right w-32">Harga</th>
                <th className="p-4 font-bold text-center w-24">Stok</th>
                <th className="p-4 font-bold w-32">Kategori</th>
                <th className="p-4 font-bold text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-zinc-500">
                    <PackageSearch
                      size={48}
                      className="mx-auto mb-4 opacity-20"
                    />
                    <p className="text-lg font-bold text-zinc-400">
                      Tidak ada produk ditemukan
                    </p>
                    <p className="text-sm mt-1">
                      Coba gunakan kata kunci lain atau tambah produk baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden border border-white/10">
                        <img
                          src={
                            product.imageUrls && product.imageUrls.length > 0
                              ? product.imageUrls[0]
                              : "/placeholder.jpg"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-1">
                        ID: {product.id}
                        {product.variants && product.variants.length > 1 && (
                          <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">
                            {product.variants.length} Varian
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-cyan-400">
                      Rp {product.price.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                          product.stock > 10
                            ? "bg-emerald-500/10 text-emerald-400"
                            : product.stock > 0
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {product.stock === 0 ? "Habis" : product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-lg w-max border border-white/5">
                        <Tag size={12} className="text-zinc-500" />
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/seller/products/${product.id}/edit`}
                          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                          title="Edit Produk"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
