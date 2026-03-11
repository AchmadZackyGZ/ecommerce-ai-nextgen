// app/components/home/TimeDrops.tsx
import { useState, useEffect } from "react";
import { Zap, Timer, ArrowRight } from "lucide-react";
import { Link } from "react-router";
// Impor ProductCard maha karya kita sebelumnya
import ProductCard, { type ProductProps } from "~/components/ecommerce/ProductCard";

// Data Dummy khusus untuk barang APPROVED Admin di Zona 3
const timeDropProducts: ProductProps[] = [
  { id: 901, name: "Sony WH-1000XM5 Noise Cancelling", price: 3999000, category: "Audio", imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop" },
  { id: 902, name: "Mechanical Keyboard Keychron Q1 Pro", price: 2850000, category: "Accessories", imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop" },
  { id: 903, name: "Apple Watch Ultra 2 GPS + Cellular", price: 12500000, category: "Wearables", imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=800&auto=format&fit=crop" },
  { id: 904, name: "Razer DeathAdder V3 Pro Wireless", price: 1950000, category: "Gaming", imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop" },
];

export default function TimeDrops() {
  // 🔥 Logika Timer Mundur (Countdown) - Kita set dummy 2 jam dari sekarang
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Mesin waktu berdetak setiap 1 detik
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Waktu habis! Nanti di sini kita buat logika untuk me-refresh data API
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000); 

    return () => clearInterval(timer); // Pembersihan saat komponen ditutup
  }, []);

  // Helper untuk format 2 digit (misal: 09, bukan 9)
  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] border border-red-500/20 bg-gradient-to-br from-red-950/30 via-zinc-950 to-black p-6 md:p-8 shadow-[0_0_60px_rgba(239,68,68,0.05)]">
      
      {/* 🌌 Efek Glow di Background */}
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-red-500/10 blur-[100px]"></div>

      {/* Header Section */}
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30">
            <Zap size={28} className="fill-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">Nexia Time-Drops</h2>
            <p className="text-base font-medium text-red-400">🔥 Harga Sangatlah Murah. Waktu terbatas.</p>
          </div>
        </div>

        {/* The Digital Clock UX */}
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-black/60 p-3 backdrop-blur-md shadow-inner">
          <Timer size={20} className="ml-1 text-red-500" />
          <div className="flex items-center gap-1.5 font-mono text-2xl font-bold text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-white/5">{formatTime(timeLeft.hours)}</span>
            <span className="text-red-500 animate-pulse">:</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-white/5">{formatTime(timeLeft.minutes)}</span>
            <span className="text-red-500 animate-pulse">:</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-red-500/20 text-red-400">{formatTime(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>

      {/* Grid Produk Flash Sale APPROVED */}
      <div className="flex w-full gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
        {timeDropProducts.map((product) => (
          <div key={product.id} className="min-w-[280px] md:min-w-0 md:flex-1 shrink-0 relative group">
            {/* Lencana Diskon Neon */}
            <div className="absolute -right-3 -top-3 z-10 flex h-12 w-12 rotate-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 font-black text-white shadow-lg shadow-red-500/50 transition-transform group-hover:scale-110">
              -45%
            </div>
            <ProductCard product={product} />
          </div>
        ))}
        
        {/* Tombol Lihat Semua Drop */}
        <div className="flex min-w-[160px] items-center justify-center shrink-0">
          <Link to="/katalog" className="group flex flex-col items-center gap-4 text-zinc-500 transition-colors hover:text-red-400">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-zinc-800 bg-zinc-900/50 transition-all group-hover:border-red-500/50 group-hover:bg-red-500/10">
              <ArrowRight size={28} className="transition-transform group-hover:translate-x-1.5" />
            </div>
            <span className="text-sm font-semibold tracking-wide">View All Drops</span>
          </Link>
        </div>
      </div>

    </div>
  );
}