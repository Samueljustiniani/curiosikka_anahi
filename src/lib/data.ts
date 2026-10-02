import "server-only";
import { cache } from "react";
import { getSupabasePublic } from "./supabase/public";
import { isSupabaseConfigured } from "./supabase/env";
import type { Category, Product, Settings } from "./types";
import { BRAND } from "./config";

const PRODUCT_SELECT = "*, category:categories(id, slug, name)";

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  whatsapp: BRAND.whatsapp,
  daily_capacity: null,
  min_lead_days: 1,
  announcement: null,
  hero_video_url: null,
  hero_poster_url: null,
  address: BRAND.location,
  facebook_url: BRAND.facebook,
  instagram_url: null,
  tiktok_url: null,
  yape_number: null,
  yape_name: null,
  yape_qr_url: null,
  deposit_percent: 50,
};

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    price: p.price === null ? null : Number(p.price),
    compare_at_price: p.compare_at_price === null ? null : Number(p.compare_at_price),
    images: p.images ?? [],
    occasions: p.occasions ?? [],
  };
}

export const getSettings = cache(async (): Promise<Settings> => {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  try {
    const { data, error } = await getSupabasePublic().from("settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...data, whatsapp: data.whatsapp || BRAND.whatsapp, deposit_percent: data.deposit_percent ?? 50 };
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await getSupabasePublic().from("categories").select("*").order("sort");
    return error ? [] : (data as Category[]);
  } catch {
    return [];
  }
});

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await getSupabasePublic()
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort")
      .order("created_at", { ascending: false });
    return error ? [] : (data as Product[]).map(normalizeProduct);
  } catch {
    return [];
  }
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await getSupabasePublic()
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return error || !data ? null : normalizeProduct(data as Product);
  } catch {
    return null;
  }
});

export async function getFeaturedProducts(limit = 8) {
  const all = await getProducts();
  const featured = all.filter((p) => p.is_featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getProductsForOccasion(slug: string, limit?: number) {
  const all = await getProducts();
  const list = all.filter((p) => p.occasions.includes(slug));
  return limit ? list.slice(0, limit) : list;
}
