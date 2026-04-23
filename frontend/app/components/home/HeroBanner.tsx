import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router";

export default function HeroBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-white/10 p-1">
      {/* Background Kosmik (Gradients & Glow) */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-black to-purple-900/40"></div>
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/30 blur-[80px]"></div>
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/30 blur-[80px]"></div>

      {/* Grid Pattern transparan */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

      <div className="relative flex flex-col items-start justify-center px-8 py-16 md:px-16 md:py-24 max-w-3xl">
        <div className="mb-4 flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-md">
          <Sparkles className="text-cyan-400" size={16} />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Nexia AI Powered{" "}
          </span>
        </div>

        <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
          The Future of{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Tech
          </span>{" "}
          <br /> Curated by AI.
        </h1>

        <p className="mb-8 text-lg font-medium text-zinc-400 md:text-xl max-w-xl">
          GADGET PREMIUM, DIPILIH OLEH AI! Harga Murah, Spesifikasi Keren,
          Diskon Gila!
        </p>

        <Link
          to="/katalog"
          className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 font-bold text-black transition-transform hover:scale-105"
        >
          <span>Explore Collection</span>
          <ArrowRight
            size={20}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}
