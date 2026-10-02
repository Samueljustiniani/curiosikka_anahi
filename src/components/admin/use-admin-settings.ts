"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Settings } from "@/lib/types";
import { useCached } from "./use-cached";

/** Ajustes de la tienda dentro del panel (Yape, adelanto, WhatsApp…) */
export function useAdminSettings() {
  const { data } = useCached<Partial<Settings>>("admin:settings", async () => {
    const { data } = await getSupabaseBrowser().from("settings").select("*").eq("id", 1).maybeSingle();
    return (data ?? {}) as Partial<Settings>;
  });
  return {
    yape_number: data?.yape_number ?? null,
    yape_name: data?.yape_name ?? null,
    deposit_percent: data?.deposit_percent ?? 50,
  };
}
