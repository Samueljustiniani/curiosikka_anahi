"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, Pencil, Plus } from "lucide-react";
import { useIsAdmin } from "@/components/admin/use-is-admin";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/** Barra flotante que solo ve el dueño con sesión iniciada */
export function AdminBar() {
  const isAdmin = useIsAdmin();
  const pathname = usePathname();
  const [productId, setProductId] = useState<string | null>(null);
  const slug = pathname.startsWith("/producto/") ? decodeURIComponent(pathname.split("/")[2] ?? "") : null;

  useEffect(() => {
    setProductId(null);
    if (!isAdmin || !slug) return;
    getSupabaseBrowser()
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => setProductId(data?.id ?? null));
  }, [isAdmin, slug]);

  return (
    <AnimatePresence>
      {isAdmin && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 260 }}
          className={`fixed bottom-5 left-1/2 z-50 ${pathname === "/separar" || pathname === "/personalizado" ? "max-lg:hidden" : ""} flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink p-1.5 pl-4 text-sm text-cream shadow-lift ring-1 ring-white/10 sm:bottom-7`}
        >
          <span className="mr-1 flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-cream/70">
            <span className="size-2 animate-pulse rounded-full bg-[#25d366]" /> Modo dueño
          </span>
          {productId ? (
            <Link
              href={`/admin/productos/${productId}`}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-pink px-4 font-semibold text-white transition hover:bg-pink-deep"
            >
              <Pencil className="size-3.5" /> Editar
            </Link>
          ) : (
            <Link
              href="/admin/productos/nuevo"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/10"
              title="Nuevo producto"
            >
              <Plus className="size-4" /> <span className="hidden sm:inline">Producto</span>
            </Link>
          )}
          <Link
            href="/admin"
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-cream px-4 font-semibold text-ink transition hover:bg-white"
          >
            <LayoutDashboard className="size-3.5" /> Panel
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
