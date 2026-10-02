"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";

let cached: Promise<boolean> | null = null;

async function check() {
  const sb = getSupabaseBrowser();
  // getSession lee la cookie local: los visitantes sin sesión no hacen ninguna petición extra
  const { data } = await sb.auth.getSession();
  if (!data.session) return false;
  const { data: isAdmin } = await sb.rpc("is_admin");
  return isAdmin === true;
}

/** true si quien navega la tienda es el dueño con sesión iniciada */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    cached ??= check().catch(() => false);
    cached.then(setIsAdmin);
  }, []);
  return isAdmin;
}
