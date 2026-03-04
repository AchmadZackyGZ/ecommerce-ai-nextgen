import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nexia | NextGeneration Of E-Commerce App" },
    {
      name: "description",
      content: "Belanja Kebutuhan Anda Dengan Pendamping AI Next-Generation",
    },
  ];
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-4xl font-extrabold tracking-tight">
        Welcome to <span className="text-cyan-400">Nexia</span>
      </h1>
    </div>
  );
}
