// app/components/home/TimeDrops.tsx
import { useState, useEffect } from "react";
import { Zap, Timer, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import ProductCard, {
  type ProductProps,
} from "~/components/ecommerce/ProductCard";

interface TimeDropProps {
  products: any[];
}

export default function TimeDrops({ products }: TimeDropProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
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
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    // 🔥 FIX: Padding diperkecil untuk mobile (p-4), rounded disesuaikan
    <div className="relative w-full overflow-hidden rounded-3xl md:rounded-[2.5rem] border border-red-500/20 bg-gradient-to-br from-red-950/40 via-zinc-950 to-black p-4 md:p-8 shadow-lg">
      <div className="absolute -right-20 -top-20 h-64 w-64 md:h-80 md:w-80 rounded-full bg-red-500/10 blur-[80px] md:blur-[100px]"></div>

      {/* 🔥 FIX: Header Section disusun ulang agar tidak melipat di HP */}
      <div className="mb-5 md:mb-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between relative z-10">
        {/* Kiri: Ikon & Teks */}
        <div className="flex items-center gap-3">
          {/* shrink-0 agar ikon tidak gepeng */}
          <div className="flex h-11 w-11 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg">
            <Zap className="h-5 w-5 md:h-7 md:w-7 fill-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Time-Drops
            </h2>
            <p className="text-xs md:text-base font-medium text-red-400">
              Flash Sale Super Murah
            </p>
          </div>
        </div>

        {/* Kanan: Timer Clock Super Ramping untuk Mobile */}
        <div className="flex w-max items-center gap-1.5 md:gap-3 rounded-xl border border-red-500/30 bg-black/60 p-2 md:p-3 backdrop-blur-md shadow-inner">
          <Timer className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
          <div className="flex items-center gap-1 font-mono text-sm md:text-2xl font-bold text-white">
            <span className="flex h-7 w-7 md:h-11 md:w-11 items-center justify-center rounded-lg bg-zinc-900 border border-white/5">
              {formatTime(timeLeft.hours)}
            </span>
            <span className="text-red-500 animate-pulse">:</span>
            <span className="flex h-7 w-7 md:h-11 md:w-11 items-center justify-center rounded-lg bg-zinc-900 border border-white/5">
              {formatTime(timeLeft.minutes)}
            </span>
            <span className="text-red-500 animate-pulse">:</span>
            <span className="flex h-7 w-7 md:h-11 md:w-11 items-center justify-center rounded-lg bg-zinc-900 border border-red-500/20 text-red-400">
              {formatTime(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* 🔥 FIX: Ditambah snap-x untuk efek scroll mulus HP */}
      <div className="flex w-full gap-4 md:gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10 snap-x snap-mandatory">
        {products.map((product) => (
          // 🔥 THE MAGIC FIX: Pakai w-[200px] dan flex-none! Memaksa ukuran kartu agar tidak meledak
          <div
            key={product.id}
            className="w-[200px] sm:w-[240px] md:w-[280px] flex-none snap-start relative group"
          >
            <div className="absolute -right-2 -top-2 md:-right-3 md:-top-3 z-10 flex h-10 w-10 md:h-12 md:w-12 rotate-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-[10px] md:text-sm font-black text-white shadow-lg shadow-red-500/50">
              -45%
            </div>
            <ProductCard product={product} />
          </div>
        ))}

        {/* Tombol Lihat Semua Drop */}
        <div className="flex w-[120px] md:w-[160px] flex-none snap-start items-center justify-center">
          <Link
            to="/katalog"
            className="group flex flex-col items-center gap-3 md:gap-4 text-zinc-500 transition-colors hover:text-red-400"
          >
            <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-dashed border-zinc-800 bg-zinc-900/50 transition-all group-hover:border-red-500/50 group-hover:bg-red-500/10">
              <ArrowRight className="h-5 w-5 md:h-7 md:w-7 transition-transform group-hover:translate-x-1.5" />
            </div>
            <span className="text-xs md:text-sm font-semibold tracking-wide text-center">
              View All
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
