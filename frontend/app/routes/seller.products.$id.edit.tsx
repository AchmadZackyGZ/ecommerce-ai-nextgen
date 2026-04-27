import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  UploadCloud,
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
  generateMeta("Edit Produk", "Perbarui informasi produk Anda di Nexia.");

export default function SellerEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 📦 STATE: Data Utama
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Smartphone");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  // 🖼️ STATE: Gambar Lama & Baru
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // 🗂️ STATE: Varian
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

  // 🚀 FETCH DATA PRODUK SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiClient.get(`/products/${id}`);
        const p = res.data.data;

        setName(p.name);
        setCategory(p.category);
        setDescription(p.description);
        setPrice(p.price.toString());
        setStock(p.stock.toString());
        setExistingImages(p.imageUrls || []);

        // Mapping varian dari database ke format form UI kita
        if (p.variants && p.variants.length > 0) {
          // Jika varian hanya 1 dan namanya "Original", kosongkan saja (itu varian default)
          if (
            p.variants.length === 1 &&
            p.variants[0].variantName === "Original"
          ) {
            setVariants([]);
          } else {
            setVariants(
              p.variants.map((v: any) => ({
                name: v.variantName,
                priceModifier: v.priceModifier.toString(),
                stock: v.stock.toString(),
              })),
            );
          }
        }
      } catch (error) {
        toast.error("Gagal mengambil data produk.");
        navigate("/seller/products");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  //  HANDLER GAMBAR BARU
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImageFiles((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          setNewImagePreviews((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  //  HANDLER VARIAN
  const addVariant = () =>
    setVariants([...variants, { name: "", priceModifier: "0", stock: "0" }]);
  const removeVariant = (index: number) =>
    setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // 🚀 SUBMIT DATA (PUT REQUEST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock)
      return toast.error("Nama, Harga, dan Stok Dasar wajib diisi!");

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("description", description);

      // 🔥 FIX BUG HARGA: Buang titik/koma sebelum kirim ke Backend
      formData.append("price", price.replace(/\D/g, ""));
      formData.append("stock", stock);

      // Append gambar baru (Backend akan menambahkannya ke list gambar lama)
      if (newImageFiles.length > 0) {
        newImageFiles.forEach((file) => formData.append("images", file));
      }

      // Append varian
      if (variants.length > 0) {
        formData.append("variantsJson", JSON.stringify(variants));
      }

      await apiClient.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Produk berhasil diperbarui!");
      navigate("/seller/products");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan pembaruan produk.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-20 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/seller/products"
          className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Package className="text-cyan-400" /> Edit Produk
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Perbarui informasi dan gambar produk Anda.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* KIRI: Info Dasar & Gambar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <AlignLeft className="text-cyan-400" size={20} /> Informasi Dasar
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                >
                  {KATEGORI_PILIHAN.map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Deskripsi Produk
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="text-cyan-400" size={20} /> Foto Produk
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Foto Lama (Dari Database) */}
              {existingImages.map((src, index) => (
                <div
                  key={`old-${index}`}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-black/50"
                >
                  <img
                    src={src}
                    alt="Old"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <span className="absolute bottom-0 w-full bg-black/80 text-zinc-400 text-[10px] font-bold text-center py-1">
                    FOTO LAMA
                  </span>
                </div>
              ))}

              {/* Foto Baru (Preview) */}
              {newImagePreviews.map((src, index) => (
                <div
                  key={`new-${index}`}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-cyan-500 group shadow-lg shadow-cyan-500/20"
                >
                  <img
                    src={src}
                    alt="New"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  <span className="absolute bottom-0 w-full bg-cyan-500/90 text-black text-[10px] font-bold text-center py-1">
                    FOTO BARU
                  </span>
                </div>
              ))}

              {/* Tombol Tambah Foto Baru */}
              <div className="relative aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-black/30 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <UploadCloud className="text-zinc-500 mb-2" size={24} />
                <span className="text-[10px] font-bold text-zinc-500 text-center px-2">
                  Tambah Foto Baru
                </span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-4">
              *Foto baru akan ditambahkan ke koleksi foto produk Anda.
            </p>
          </div>
        </div>

        {/* KANAN: Harga, Stok, Varian */}
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={20} /> Penjualan
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Harga Dasar (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                    Rp
                  </span>
                  {/* BUG FIX HARGA: Input sekarang aman untuk desimal buatan */}
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Stok Dasar
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 border-t-4 border-t-purple-500/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="text-purple-400" size={20} /> Varian Produk
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-bold bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/30 flex items-center gap-1"
              >
                <Plus size={14} /> Tambah Varian
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <p className="text-sm text-zinc-500">
                  Tidak ada varian tambahan.
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
                      <input
                        type="text"
                        placeholder="Nama Varian"
                        value={v.name}
                        onChange={(e) =>
                          updateVariant(index, "name", e.target.value)
                        }
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-500 font-bold uppercase">
                            Harga Ekstra
                          </label>
                          <input
                            type="text"
                            placeholder="+ Harga"
                            value={v.priceModifier}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "priceModifier",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-emerald-400 font-bold focus:border-purple-500 outline-none"
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
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-black text-lg py-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
            ) : (
              <>
                <Save size={24} /> Perbarui Produk
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
