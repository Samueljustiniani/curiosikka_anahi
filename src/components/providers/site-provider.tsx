"use client";

import { createContext, useContext } from "react";
import type { Settings } from "@/lib/types";
import { BRAND } from "@/lib/config";

type SiteContextValue = Pick<
  Settings,
  "whatsapp" | "daily_capacity" | "min_lead_days" | "announcement" | "facebook_url" | "instagram_url" | "tiktok_url" | "address" | "yape_number" | "yape_name" | "yape_qr_url" | "deposit_percent"
>;

const SiteContext = createContext<SiteContextValue>({
  whatsapp: BRAND.whatsapp,
  daily_capacity: null,
  min_lead_days: 1,
  announcement: null,
  facebook_url: BRAND.facebook,
  instagram_url: null,
  tiktok_url: null,
  address: BRAND.location,
  yape_number: null,
  yape_name: null,
  yape_qr_url: null,
  deposit_percent: 50,
});

export function SiteProvider({ value, children }: { value: SiteContextValue; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
