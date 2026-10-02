import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/config";
import { OCCASIONS } from "@/lib/occasions";
import { getProducts } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = BRAND.siteUrl.replace(/\/$/, "");
  const products = await getProducts();
  const staticPages = ["", "/tienda", "/ocasiones", "/calendario", "/personalizado", "/mis-fechas"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...OCCASIONS.map((o) => ({ url: `${base}/ocasiones/${o.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${base}/producto/${p.slug}`, lastModified: p.updated_at, priority: 0.6 })),
  ];
}
