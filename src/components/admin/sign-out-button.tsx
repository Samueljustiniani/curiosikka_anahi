"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { clearCache } from "./use-cached";

export function SignOutButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await getSupabaseBrowser().auth.signOut();
        clearCache();
        router.replace("/admin/login");
        router.refresh();
      }}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-cream transition hover:bg-ink-2",
        compact && "h-10 bg-transparent px-3 text-ink-3 hover:bg-ink/5 hover:text-ink",
        className
      )}
    >
      <LogOut className="size-4" /> Cerrar sesión
    </button>
  );
}
