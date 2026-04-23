import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  Store,
  Star,
  MessageCircle,
  Clock,
  Package,
  Ticket,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "~/services/apiClient";
import ProductCard from "~/components/ecommerce/ProductCard"; // Sesuaikan path ini jika perlu
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta(
    "Kunjungi Toko",
    "Jelajahi produk dan promo terbaik dari Seller Nexia.",
  );

export default function SellerProfile() {
  const { id } = useParams();
  const [shopData, setShopData] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter Produk
  const availableProducts = allProducts.filter((p) => p.stock > 0);
  const outOfStockProducts = allProducts.filter((p) => p.stock === 0);

  //  State untuk Filter, Sort & Pagination
  const [selectedCategory, setSelectedCategory] = useState("Semua Produk");
  const [sortBy, setSortBy] = useState("Populer");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // Shopee style: 12 produk per halaman

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setIsLoading(true);
        // 1. Tembak API Mega Profil Toko
        const profileRes = await apiClient.get(`/shops/${id}/profile`);
        setShopData(profileRes.data.data);

        // 2. Tembak API Semua Produk Toko Ini
        const productsRes = await apiClient.get(`/products/shop/${id}`);
        setAllProducts(productsRes.data.data || []);
      } catch (error) {
        console.error("Gagal memuat data toko:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchShopData();
  }, [id]);

  //  Ekstrak Kategori Unik dari Data Produk
  const uniqueCategories = [
    "Semua Produk",
    ...new Set(availableProducts.map((p) => p.category)),
  ];

  // 🔥 MESIN KATALOG: Eksekusi Filter & Sort
  let processedCatalog = [...availableProducts];

  if (selectedCategory !== "Semua Produk") {
    processedCatalog = processedCatalog.filter(
      (p) => p.category === selectedCategory,
    );
  }

  if (sortBy === "Terbaru") {
    processedCatalog.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (sortBy === "Harga Termurah") {
    processedCatalog.sort((a, b) => a.price - b.price);
  } else if (sortBy === "Harga Termahal") {
    processedCatalog.sort((a, b) => b.price - a.price);
  } // Untuk "Populer", biarkan default atau sort by soldCount jika ada

  //  Pagination
  const totalPages = Math.ceil(processedCatalog.length / ITEMS_PER_PAGE);
  const paginatedProducts = processedCatalog.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400"></div>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-zinc-500">
        <Store size={64} className="mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white mb-2">
          Toko Tidak Ditemukan
        </h2>
        <p>Toko yang Anda cari mungkin telah ditutup atau dihapus.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 pt-28">
      {/* 🌟 1. SECTION HEADER TOKO */}
      <div className="bg-zinc-900/50 border-y border-white/5 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            {/* Identitas Toko */}
            <div className="flex items-center gap-6 bg-black/40 p-6 rounded-3xl border border-white/5 shadow-2xl md:w-1/3">
              <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden border-2 border-cyan-500/30 shrink-0">
                <img
                  src={shopData.avatarUrl}
                  alt={shopData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  {shopData.name}
                  <CheckCircle2 className="text-cyan-400" size={18} />
                </h1>
                <span
                  className={`text-xs font-bold mt-1 ${shopData.lastActive === "Offline" ? "text-zinc-500" : "text-emerald-400"}`}
                >
                  {shopData.lastActive}
                </span>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-colors">
                    + Ikuti
                  </button>
                  <button className="px-4 py-1.5 rounded-lg bg-zinc-800 text-white text-sm font-bold hover:bg-zinc-700 transition-colors border border-white/10 flex items-center gap-2">
                    <MessageCircle size={16} /> Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Statistik Toko (Shopee Style) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 w-full text-sm">
              <div className="flex items-center gap-3">
                <Package className="text-zinc-400" size={20} />
                <div className="flex flex-col">
                  <span className="text-zinc-500 font-medium">Produk</span>
                  <span className="text-cyan-400 font-bold">
                    {shopData.totalProducts}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="text-zinc-400" size={20} />
                <div className="flex flex-col">
                  <span className="text-zinc-500 font-medium">Penilaian</span>
                  <span className="text-cyan-400 font-bold">
                    {shopData.averageRating}{" "}
                    <span className="text-zinc-600 text-xs">/ 5.0</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="text-zinc-400" size={20} />
                <div className="flex flex-col">
                  <span className="text-zinc-500 font-medium">
                    Performa Chat
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {shopData.responseRate}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-zinc-400" size={20} />
                <div className="flex flex-col">
                  <span className="text-zinc-500 font-medium">Bergabung</span>
                  <span className="text-cyan-400 font-bold">
                    {shopData.joinDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8 space-y-12">
        {/* 🎬 2. SECTION HERO BANNER (VIDEO / GAMBAR) */}
        {(shopData.videoBannerUrl || shopData.imageBannerUrl) && (
          <section className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900">
            {shopData.videoBannerUrl ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full max-h-[500px] object-cover"
              >
                <source src={shopData.videoBannerUrl} type="video/mp4" />
              </video>
            ) : (
              <img
                src={shopData.imageBannerUrl}
                alt="Banner Toko"
                className="w-full max-h-[500px] object-cover"
              />
            )}
          </section>
        )}

        {/* 🎟️ 3. SECTION VOUCHER TOKO */}
        {shopData.activeVouchers && shopData.activeVouchers.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Ticket className="text-orange-400" /> Voucher Toko Spesial
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4 [&::-webkit-scrollbar]:hidden">
              {shopData.activeVouchers.map((v: any) => (
                <div
                  key={v.id}
                  className="min-w-[280px] bg-gradient-to-r from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-2xl p-4 flex gap-4 items-center shrink-0"
                >
                  <div className="bg-orange-500 text-black font-black text-xl w-16 h-16 flex items-center justify-center rounded-xl shrink-0">
                    {v.discountPercentage}%
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold">
                      Diskon {v.discountPercentage}%
                    </span>
                    <span className="text-xs text-orange-200/70">
                      S/D Rp {v.maxDiscountAmount.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-1 border-t border-orange-500/10 pt-1">
                      Berakhir:{" "}
                      {new Date(v.expiredAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 🏆 4. SECTION PRODUK UNGGULAN (TOP PICKS) */}
        {shopData.featuredProducts && shopData.featuredProducts.length > 0 && (
          <section className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
              <Star className="text-yellow-400 fill-yellow-400" size={24} />{" "}
              Produk Terlaris
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {shopData.featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 🛍️ 5. SECTION KATALOG UTAMA (SEMUA PRODUK) */}
        <section className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 👈 ASIDE KIRI: KATEGORI TOKO */}
            <aside className="w-full md:w-64 shrink-0">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
                <Store className="text-cyan-400" size={20} /> Kategori
              </h2>
              <div className="flex flex-col gap-1 border-l-2 border-white/5 pl-4">
                {uniqueCategories.map((category: any) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1); // Reset page saat ganti kategori
                    }}
                    className={`text-left py-2 font-medium transition-all ${
                      selectedCategory === category
                        ? "text-cyan-400 font-bold translate-x-2"
                        : "text-zinc-400 hover:text-white hover:translate-x-1"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </aside>

            {/* 👉 MAIN KANAN: KONTEN KATALOG */}
            <div className="flex-1 flex flex-col">
              {/* TOP BAR: Urutkan & Pagination Mini */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-white/5 mb-6 gap-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-zinc-500 mr-2">Urutkan</span>
                  {["Populer", "Terbaru", "Terlaris"].map((sortOption) => (
                    <button
                      key={sortOption}
                      onClick={() => setSortBy(sortOption)}
                      className={`px-5 py-2 rounded-lg font-bold transition-all ${
                        sortBy === sortOption
                          ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                          : "bg-black/40 text-zinc-400 hover:bg-white/5 border border-white/5"
                      }`}
                    >
                      {sortOption}
                    </button>
                  ))}

                  {/* Select Harga */}
                  <select
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-black/40 text-zinc-200 border-white/5 outline-none focus:border-cyan-500 cursor-pointer font-bold"
                  >
                    <option value="Harga">Harga</option>
                    <option value="Harga Termurah">Termurah ke Termahal</option>
                    <option value="Harga Termahal">Termahal ke Termurah</option>
                  </select>
                </div>

                {/* Pagination Mini di Kanan Atas */}
                <div className="flex items-center gap-4 text-sm font-bold">
                  <span className="text-cyan-400">
                    {currentPage}{" "}
                    <span className="text-zinc-600">/ {totalPages || 1}</span>
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-black/40 text-white disabled:opacity-30 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      &lt;
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 rounded-lg bg-black/40 text-white disabled:opacity-30 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>

              {/* GRID PRODUK */}
              {paginatedProducts.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 bg-zinc-900/20 rounded-3xl border border-white/5 flex-1 flex items-center justify-center">
                  Tidak ada produk dalam kategori ini.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                  {paginatedProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* BOTTOM PAGINATION BESAR */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-auto">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                        currentPage === i + 1
                          ? "bg-cyan-500 text-black text-lg"
                          : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-white/5"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ❌ 6. SECTION PRODUK HABIS (SOLD OUT) */}
        {outOfStockProducts.length > 0 && (
          <section className="opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <h2 className="text-lg font-bold text-zinc-500 mb-6 flex items-center gap-2">
              <AlertCircle size={20} /> Stok Habis (Segera Restock)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {outOfStockProducts.map((product: any) => (
                <div key={product.id} className="relative">
                  {/* Overlay Sold Out */}
                  <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center rounded-3xl pointer-events-none">
                    <span className="bg-red-500 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest rotate-[-12deg] border-2 border-black shadow-xl">
                      Habis Terjual
                    </span>
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
