import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { NotAuthorized, SetupNeeded } from "@/components/admin/setup-states";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer();
  // Verificación local del JWT (sin viaje extra al servidor de Auth)
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/admin/login");
  const email = typeof claims.email === "string" ? claims.email : "";

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) {
    // La función no existe → todavía no se ejecutó supabase/schema.sql
    return <SetupNeeded email={email} />;
  }
  if (!isAdmin) return <NotAuthorized email={email} />;

  return <AdminShell email={email}>{children}</AdminShell>;
}
