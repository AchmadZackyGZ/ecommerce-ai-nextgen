export function generateMeta(title: string, description?: string) {
  const baseTitle = title
    ? `${title} | Nexia Premium E-Commerce`
    : "Nexia | Premium E-Commerce";
  const baseDesc =
    description ||
    "Belanja Kebutuhan Anda Dengan Pendamping AI Next-Generation";

  return [
    { title: baseTitle },
    { name: "description", content: baseDesc },
    // Anda bisa menambahkan meta tag dinamis lainnya di sini untuk SEO tingkat lanjut (OpenGraph, Twitter Card, dll)
    { property: "og:title", content: baseTitle },
  ];
}
