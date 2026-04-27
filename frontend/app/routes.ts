import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

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

  // Route untuk Seller Center
  layout("routes/seller.tsx", [
    // Halaman Produk masuk ke dalam layout seller
    route("seller/products", "routes/seller.products.tsx"),
    route("seller/products/new", "routes/seller.products.new.tsx"),
    route("seller/products/:id/edit", "routes/seller.products.$id.edit.tsx"),
  ]),
] satisfies RouteConfig;
