"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/** Capacidad diaria configurada en Ajustes (null = sin límite) */
export function useSiteSettingsCapacity() {
  const [capacity, setCapacity] = useState<number | null>(null);
  useEffect(() => {
    getSupabaseBrowser()
      .from("settings")
      .select("daily_capacity")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => setCapacity(data?.daily_capacity ?? null));
  }, []);
  return capacity;
}
