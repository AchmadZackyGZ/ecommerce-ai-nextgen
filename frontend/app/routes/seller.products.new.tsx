import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  UploadCloud,
  Plus,
  Trash2,
  Save,
  Package,
  DollarSign,
  Tag,
  AlignLeft,
  Image as ImageIcon,
} from "lucide-react";
import { apiClient } from "~/services/apiClient";
import { toast } from "sonner";
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta(
    "Tambah Produk Baru",
    "Masukkan produk baru ke etalase toko Anda.",
  );

export default function SellerNewProduct() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 📦 STATE: Data Utama Produk
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Smartphone"); // Default
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  // 🖼️ STATE: Upload Gambar
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 🗂️ STATE: Varian Dinamis (Sesuai dengan ObjectMapper di Backend)
  const [variants, setVariants] = useState<
    { name: string; priceModifier: string; stock: string }[]
  >([]);

  const KATEGORI_PILIHAN = [
    "Smartphone",
    "Laptop",
    "Audio",
    "Camera",
    "Wearables",
    "Lainnya",
  ];

  //  FUNGSI HANDLER UNTUK GAMBAR
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  //  FUNGSI HANDLER UNTUK VARIAN
  const addVariant = () => {
    setVariants([...variants, { name: "", priceModifier: "0", stock: "0" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // 🚀 FUNGSI SAKTI: SUBMIT DATA KE SPRING BOOT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !stock) {
      return toast.error("Nama, Harga, dan Stok Dasar wajib diisi!");
    }

    try {
      setIsLoading(true);

      // 🔥 WAJIB MENGGUNAKAN FORMDATA KARENA ADA FILE GAMBAR
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);

      if (imageFile) {
        formData.append("image", imageFile); // 'image' sesuai @RequestParam di Controller
      }

      // Format array Varian menjadi JSON String agar bisa dibaca ObjectMapper Backend
      if (variants.length > 0) {
        formData.append("variantsJson", JSON.stringify(variants));
      }

      // Tembak API!
      await apiClient.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Header khusus untuk upload
        },
      });

      toast.success("Produk berhasil ditambahkan ke Etalase!");
      navigate("/seller/products"); // Lempar kembali ke tabel produk
    } catch (error: any) {
      console.error("Gagal menambah produk:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan produk.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full pb-20 animate-in fade-in duration-500">
      {/* 1. HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/seller/products"
          className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Package className="text-cyan-400" /> Tambah Produk
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Lengkapi informasi detail untuk produk baru Anda.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* 👈 KOLOM KIRI: Informasi Dasar & Gambar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Info Dasar */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <AlignLeft className="text-cyan-400" size={20} /> Informasi Dasar
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Nama Produk <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: ASUS ROG Zephyrus G14"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Kategori <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    size={18}
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                  >
                    {KATEGORI_PILIHAN.map((cat) => (
                      <option key={cat} value={cat} className="bg-zinc-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Deskripsi Produk
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan keunggulan dan spesifikasi produk Anda..."
                  rows={6}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card: Upload Gambar */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="text-cyan-400" size={20} /> Foto Utama
              Produk
            </h2>

            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 transition-colors ${imagePreview ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/10 bg-black/50 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5"}`}
              >
                {imagePreview ? (
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="text-cyan-400" size={32} />
                    </div>
                    <p className="text-white font-bold mb-1">
                      Klik atau Drag foto ke sini
                    </p>
                    <p className="text-xs text-zinc-500">
                      PNG, JPG, JPEG (Maks. 2MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 👉 KOLOM KANAN: Harga, Stok & Varian */}
        <div className="space-y-6">
          {/* Card: Harga & Stok Dasar */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={20} /> Penjualan
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Harga Dasar (Rp) <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Stok Dasar <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card: Varian Produk Dinamis */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl border-t-4 border-t-purple-500/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="text-purple-400" size={20} /> Varian Produk
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-bold bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Tambah Varian
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <p className="text-sm text-zinc-500">
                  Tidak ada varian tambahan.
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">
                  Produk akan otomatis dibuat sebagai "Original".
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((v, index) => (
                  <div
                    key={index}
                    className="bg-black/40 border border-white/5 rounded-xl p-4 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Nama Varian (Cth: Merah / 256GB)"
                          value={v.name}
                          onChange={(e) =>
                            updateVariant(index, "name", e.target.value)
                          }
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">
                            Harga Ekstra (Rp)
                          </label>
                          <input
                            type="number"
                            placeholder="+ Harga"
                            value={v.priceModifier}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "priceModifier",
                                e.target.value,
                              )
                            }
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-emerald-400 font-bold focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">
                            Stok Khusus
                          </label>
                          <input
                            type="number"
                            placeholder="Stok"
                            value={v.stock}
                            onChange={(e) =>
                              updateVariant(index, "stock", e.target.value)
                            }
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTION BUTTON SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-lg py-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
            ) : (
              <>
                <Save size={24} /> Simpan & Jual Sekarang
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
