"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { OCCASIONS, getOccasion } from "@/lib/occasions";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { EmptyCatalog } from "@/components/ui/empty-catalog";

type Sort = "destacados" | "nuevos" | "precio-asc" | "precio-desc";

const SORTS: { value: Sort; label: string }[] = [
  { value: "destacados", label: "Destacados" },
  { value: "nuevos", label: "Más nuevos" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function Catalog({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const category = params.get("categoria") ?? "";
  const occasion = params.get("ocasion") ?? "";
  const sort = (params.get("orden") as Sort) || "destacados";
  const [query, setQuery] = useState(params.get("q") ?? "");

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const usedOccasions = useMemo(() => {
    const set = new Set(products.flatMap((p) => p.occasions));
    return OCCASIONS.filter((o) => set.has(o.slug));
  }, [products]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    let list = products.filter((p) => {
      if (category && p.category?.slug !== category) return false;
      if (occasion && !p.occasions.includes(occasion)) return false;
      if (q) {
        const hay = normalize(`${p.name} ${p.short_description ?? ""} ${p.description ?? ""} ${p.category?.name ?? ""}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const priceOf = (p: Product) => p.price ?? Number.POSITIVE_INFINITY;
    if (sort === "nuevos") list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sort === "precio-asc") list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "precio-desc") list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return list;
  }, [products, category, occasion, sort, query]);

  const activeFilters = [
    category && { key: "categoria", label: categories.find((c) => c.slug === category)?.name ?? category },
    occasion && { key: "ocasion", label: getOccasion(occasion)?.name ?? occasion },
  ].filter(Boolean) as { key: string; label: string }[];

  if (products.length === 0) return <EmptyCatalog />;

  return (
    <div>
      {/* Barra de filtros */}
      <div className="sticky top-[4.25rem] z-30 -mx-4 mb-10 border-y border-ink/5 bg-cream/85 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-3xl sm:border sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cuadros, detalles, frases…"
              className="field rounded-full pl-11"
              aria-label="Buscar productos"
            />
          </label>
          <div className="grid min-w-0 grid-cols-[1fr_1fr] items-center gap-2 sm:flex">
            
            {usedOccasions.length > 0 && (
              <select
                value={occasion}
                onChange={(e) => setParam("ocasion", e.target.value)}
                className="field w-auto min-w-0 flex-1 cursor-pointer rounded-full py-2.5 sm:flex-none"
                aria-label="Filtrar por ocasión"
              >
                <option value="">Ocasión</option>
                {usedOccasions.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
            <select
              value={sort}
              onChange={(e) => setParam("orden", e.target.value === "destacados" ? "" : e.target.value)}
              className="field w-auto min-w-0 flex-1 cursor-pointer rounded-full py-2.5 sm:flex-none"
              aria-label="Ordenar"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {categories.length > 0 && (
          <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1">
            <button
              type="button"
              onClick={() => setParam("categoria", "")}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                !category ? "bg-ink text-cream" : "bg-white text-ink-2 ring-1 ring-ink/10 hover:ring-ink/30"
              )}
            >
              Todo
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setParam("categoria", category === c.slug ? "" : c.slug)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  category === c.slug ? "bg-ink text-cream" : "bg-white text-ink-2 ring-1 ring-ink/10 hover:ring-ink/30"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-3">
        <span>
          {filtered.length} {filtered.length === 1 ? "detalle" : "detalles"}
        </span>
        {activeFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setParam(f.key, "")}
            className="inline-flex items-center gap-1 rounded-full bg-blush px-3 py-1 font-medium text-pink-deep"
          >
            {f.label} <X className="size-3.5" />
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 gap-x-4 gap-y-10 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} priority={i < 4} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[2rem] bg-white/70 p-12 text-center ring-1 ring-ink/5"
          >
            <p className="font-display text-2xl">No encontramos detalles con esos filtros</p>
            <p className="mt-2 text-ink-3">Prueba con otra búsqueda o pídelo personalizado.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                router.replace(pathname, { scroll: false });
              }}
              className="mt-6 font-semibold text-pink-deep underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
