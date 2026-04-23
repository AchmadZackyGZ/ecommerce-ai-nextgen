import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("product/:id", "routes/product.$id.tsx"),
  route("katalog", "routes/katalog.tsx"),
  route("cart", "routes/cart.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("pesanan", "routes/pesanan.tsx"),
  route("voucher", "routes/voucher.tsx"),
  route("pengaturan", "routes/pengaturan.tsx"),
  route("toko/:id", "routes/toko.$id.tsx"), // Tambahkan route untuk halaman kunjungi toko
] satisfies RouteConfig;
