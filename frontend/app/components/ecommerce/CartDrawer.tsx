import { ShoppingBag, X, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { userCartStore } from "~/store/cartStore";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export default function CartDrawer() {
  const { isOpen, toggleCart, items, removeItem, getTotalPrice, clearCart } =
    userCartStore();

  const handleCheckout = () => {
    if (items.length === 0) return;
    toast.success("Mengarahkan ke pembayaran Midtrans...");
    // Nanti kita hubungkan ini ke halaman /checkout sesungguhnya
  };

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="flex w-full flex-col border-l border-white/10 bg-zinc-950/80 p-0 backdrop-blur-2xl sm:max-w-lg">
        {/* Header */}
        <SheetHeader className="border-b border-white/10 p-6">
          <SheetTitle className="flex items-center gap-2 text-white">
            <ShoppingBag className="text-cyan-400" /> Keranjang Belanja
          </SheetTitle>
        </SheetHeader>

        {/* List Barang */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-zinc-500">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>Keranjang Anda masih kosong</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  {/* Gambar Produk */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info Produk */}
                  <div className="flex flex-1 flex-col">
                    <h4 className="line-clamp-1 text-sm font-semibold text-white">
                      {item.name}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Rp {item.price.toLocaleString("id-ID")} x {item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-bold text-cyan-400">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Tombol Hapus */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-full bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-white/10 bg-zinc-900/50 p-6">
            <div className="mb-4 flex items-center justify-between text-lg font-bold text-white">
              <span>Total:</span>
              <span className="text-cyan-400">
                Rp {getTotalPrice().toLocaleString("id-ID")}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 py-6 font-bold text-white transition-transform hover:scale-[1.02]"
            >
              Checkout Sekarang
            </Button>
            <button
              onClick={clearCart}
              className="mt-4 w-full text-xs text-zinc-500 hover:text-white"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
