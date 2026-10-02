"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Refresca el sitio público después de cambios en el panel (solo admins) */
export async function revalidateStore() {
  const supabase = await getSupabaseServer();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}
