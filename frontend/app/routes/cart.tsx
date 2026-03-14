import { Link } from "react-router";
import {
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  CheckSquare,
  Square,
  ShoppingCart,
} from "lucide-react";
import { useCartStore } from "~/store/cartStore";
import { generateMeta } from "~/utils/seo";

export const meta = () =>
  generateMeta(
    "Keranjang Belanja",
    "Selesaikan pembelian produk premium Anda.",
  );

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleSelectItem = useCartStore((state) => state.toggleSelectItem);
  const toggleSelectAll = useCartStore((state) => state.toggleSelectAll);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  // Cek apakah semua barang sudah tercentang
  const isAllSelected =
    items.length > 0 && items.every((item) => item.selected);

  return (
    <main className="min-h-screen pb-40 pt-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <h1 className="mb-8 text-3xl font-black text-white md:text-4xl">
          Keranjang Belanja
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-zinc-900/30 py-20 backdrop-blur-xl">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800">
              <ShoppingCart size={40} className="text-zinc-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">
              Keranjang Anda masih kosong
            </h2>
            <p className="mb-8 text-zinc-400">
              Penuhi dengan teknologi masa depan sekarang juga!
            </p>
            <Link
              to="/katalog"
              className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-3.5 font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 📝 AREA KIRI: LIST PRODUK & TABEL */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Header Tabel (Mirip Shopee) */}
              <div className="hidden md:flex items-center rounded-2xl border border-white/10 bg-zinc-900/50 px-6 py-4 backdrop-blur-md">
                <button
                  onClick={() => toggleSelectAll(!isAllSelected)}
                  className="flex items-center gap-3 w-1/2"
                >
                  {isAllSelected ? (
                    <CheckSquare className="text-cyan-400" />
                  ) : (
                    <Square className="text-zinc-500" />
                  )}
                  <span className="font-bold text-white tracking-wider text-sm uppercase">
                    Produk
                  </span>
                </button>
                <div className="flex w-1/2 justify-between text-sm font-bold text-zinc-400 uppercase tracking-wider">
                  <span className="w-1/3 text-center">Harga Satuan</span>
                  <span className="w-1/3 text-center">Kuantitas</span>
                  <span className="w-1/3 text-right">Total Harga</span>
                </div>
              </div>

              {/* Looping Barang Berdasarkan Toko */}
              <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-zinc-900/30 p-2 md:p-6 backdrop-blur-xl">
                {/* Simulasi Header Toko */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 px-4 pt-2">
                  <ShieldCheck size={20} className="text-cyan-400" />
                  <span className="font-bold text-white">
                    Nexia Official Store
                  </span>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col md:flex-row items-start md:items-center gap-4 rounded-2xl border border-transparent p-4 transition-all hover:border-white/10 hover:bg-white/5"
                  >
                    {/* Kiri: Checkbox & Info Produk */}
                    <div className="flex w-full md:w-1/2 items-center gap-4">
                      <button
                        onClick={() => toggleSelectItem(item.id)}
                        className="transition-transform active:scale-90"
                      >
                        {item.selected ? (
                          <CheckSquare
                            className="text-cyan-400 fill-cyan-400/20"
                            size={24}
                          />
                        ) : (
                          <Square className="text-zinc-500" size={24} />
                        )}
                      </button>
                      <div className="h-20 w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-800">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="line-clamp-2 text-sm md:text-base font-bold text-white leading-tight">
                          {item.name}
                        </h3>
                        <span className="mt-1 inline-flex w-max items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 border border-white/5">
                          Varian Tersimpan
                        </span>
                        {/* Harga Satuan versi Mobile (tersembunyi di Desktop) */}
                        <span className="mt-2 text-sm font-bold text-cyan-400 md:hidden">
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Kanan: Harga, Qty, Total (Desktop Layout) */}
                    <div className="flex w-full md:w-1/2 items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pl-12 md:pl-0">
                      {/* Harga Satuan (Desktop) */}
                      <div className="hidden md:flex w-1/3 justify-center">
                        <span className="text-sm font-bold text-zinc-400">
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Kontrol Kuantitas */}
                      <div className="flex w-max md:w-1/3 justify-center items-center rounded-lg border border-white/10 bg-black/50 p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1.5 text-zinc-400 hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Total Harga Item */}
                      <div className="flex w-max md:w-1/3 justify-end items-center gap-4">
                        <span className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                          Rp{" "}
                          {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-500 transition-colors hover:text-red-500"
                          title="Hapus Barang"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 💸 AREA KANAN: ORDER SUMMARY (Sticky Ringkasan Belanja) */}
            <div className="w-full lg:w-1/3 xl:w-1/4">
              <div className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-2xl shadow-2xl">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">
                  Ringkasan Belanja
                </h3>

                <div className="flex flex-col gap-3 text-sm text-zinc-400">
                  <div className="flex justify-between">
                    <span>Total Harga ({getTotalItems()} Produk)</span>
                    <span className="font-semibold text-white">
                      Rp {getTotalPrice().toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Diskon Barang</span>
                    <span className="font-semibold text-emerald-400">
                      - Rp 0
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col gap-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Total Pembayaran
                  </span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    Rp {getTotalPrice().toLocaleString("id-ID")}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="mt-4 flex items-center justify-center w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  Checkout Sekarang ({getTotalItems()})
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
