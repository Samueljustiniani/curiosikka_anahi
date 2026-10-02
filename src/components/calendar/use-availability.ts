"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { daysInMonth, toISO } from "@/lib/dates";
import type { DayAvailability } from "@/lib/types";

const cache = new Map<string, Record<string, DayAvailability>>();

/** Disponibilidad (cupos / días cerrados) de un mes, vía RPC pública */
export function useAvailability(year: number, month: number) {
  const key = `${year}-${month}`;
  const [data, setData] = useState<Record<string, DayAvailability>>(() => cache.get(key) ?? {});
  const [loading, setLoading] = useState(!cache.has(key));

  useEffect(() => {
    let cancelled = false;
    if (cache.has(key)) {
      setData(cache.get(key)!);
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getSupabaseBrowser()
      .rpc("get_availability", { p_from: toISO(year, month, 1), p_to: toISO(year, month, daysInMonth(year, month)) })
      .then(({ data: rows, error }) => {
        if (cancelled) return;
        const map: Record<string, DayAvailability> = {};
        if (!error && Array.isArray(rows)) {
          for (const r of rows as DayAvailability[]) map[r.day] = r;
          cache.set(key, map);
        }
        setData(map);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, year, month]);

  return { data, loading };
}

export type DayStatus = "available" | "few" | "full" | "blocked" | "unavailable";

export function dayStatus(a: DayAvailability | undefined): DayStatus {
  if (!a) return "available";
  if (a.blocked) return "blocked";
  if (a.capacity !== null && a.capacity !== undefined) {
    const left = a.capacity - a.booked;
    if (left <= 0) return "full";
    if (left <= Math.max(2, Math.ceil(a.capacity * 0.25))) return "few";
  }
  return "available";
}
