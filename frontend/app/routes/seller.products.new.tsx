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
  const [imageFile, setImageFile] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

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
    const files = Array.from(e.target.files || []); // Ubah FileList menjadi Array
    if (files.length > 0) {
      setImageFile((prev) => [...prev, ...files]); // Tambahkan ke state imageFile

      // buat preview untuk setiap file yang diupload
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          setImagePreview((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const RemoveImage = (indexToRemove: number) => {
    setImageFile((prev) => prev.filter((_, i) => i !== indexToRemove));
    setImagePreview((prev) => prev.filter((_, i) => i !== indexToRemove));
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

      // looping untuk multi-upload file imageUrls
      if (imageFile.length > 0) {
        imageFile.forEach((file) => formData.append("images", file));
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

          {/* Card: Upload Gambar (MULTI-UPLOAD UI) */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="text-cyan-400" size={20} /> Foto Produk
            </h2>

            {/* GRID PREVIEW & TOMBOL TAMBAH */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 1. Looping untuk menampilkan semua foto yang sudah dipilih */}
              {imagePreview.map((src, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group shadow-lg bg-black/50"
                >
                  <img
                    src={src}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />

                  {/* 🔥 TOMBOL HAPUS (Panggil removeImage) */}
                  <button
                    type="button"
                    onClick={() => RemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-lg"
                    title="Hapus foto ini"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Label Foto Utama untuk indeks 0 */}
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-cyan-500/90 text-black text-[10px] font-black uppercase tracking-widest text-center py-1">
                      Foto Utama
                    </span>
                  )}
                </div>
              ))}

              {/* 2. Tombol +Tambah Foto (Akan selalu ada di samping/bawah foto) */}
              <div className="relative aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-black/30 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  multiple // 🔥 Fitur pilih banyak file sekaligus!
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <UploadCloud
                  className="text-zinc-500 group-hover:text-cyan-400 mb-2 transition-colors"
                  size={28}
                />
                <span className="text-xs text-zinc-500 group-hover:text-cyan-400 font-bold text-center px-2">
                  {imagePreview.length > 0 ? "Tambah Lagi" : "Pilih Foto"}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4 flex items-center gap-1.5">
              <span className="text-cyan-400">*</span> Anda bisa memilih lebih
              dari 1 foto sekaligus. Format: JPG, PNG.
            </p>
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
