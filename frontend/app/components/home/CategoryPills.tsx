import {
  Smartphone,
  Laptop,
  Headphones,
  Keyboard,
  Watch,
  Camera,
  Gamepad2,
} from "lucide-react";

const categories = [
  { id: 1, name: "Smartphone", icon: Smartphone, color: "text-blue-400" },
  { id: 2, name: "Laptop", icon: Laptop, color: "text-purple-400" },
  { id: 3, name: "Audio", icon: Headphones, color: "text-cyan-400" },
  { id: 4, name: "Accessories", icon: Keyboard, color: "text-emerald-400" },
  { id: 5, name: "Wearables", icon: Watch, color: "text-rose-400" },
  { id: 6, name: "Camera", icon: Camera, color: "text-amber-400" },
  { id: 7, name: "Gaming", icon: Gamepad2, color: "text-red-400" },
];

export default function CategoryPills() {
  return (
    <div className="w-full pt-8 pb-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-lg font-bold text-white">Categories</h3>
        <button className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
          View All
        </button>
      </div>

      {/* Hide Scrollbar UX */}
      <div className="flex w-full gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              className="group flex min-w-max items-center gap-2.5 rounded-full border border-white/10 bg-zinc-900/50 px-4 py-2.5 md:px-5 md:py-3 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/10"
            >
              <div
                className={`flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}
              >
                <Icon size={18} className="md:w-5 md:h-5" />
              </div>
              <span className="text-sm font-medium text-zinc-300 transition-colors group-hover:text-white">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
