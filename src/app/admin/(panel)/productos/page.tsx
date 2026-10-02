"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Link2, Loader, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Category, Product } from "@/lib/types";
import { cn, errorMessage, formatPrice, slugify } from "@/lib/utils";
import { AdminHeader, Card } from "@/components/admin/admin-shell";
import { EmptyBlock, LoadingBlock } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { ProductPlaceholder } from "@/components/product/product-card";
import { revalidateStore } from "../../actions";
import { useCached } from "@/components/admin/use-cached";
import { copyText, useStoreOrigin } from "@/components/admin/quick-reply";
import { storeLinkReply } from "@/lib/whatsapp";

export default function AdminProductsPage() {
  const { data, setData, reload: load } = useCached("admin:products", async () => {
    const sb = getSupabaseBrowser();
    const [p, c] = await Promise.all([
      sb.from("products").select("*, category:categories(id, slug, name)").order("sort").order("created_at", { ascending: false }),
      sb.from("categories").select("*").order("sort"),
    ]);
    if (p.error) toast.error(errorMessage(p.error));
    return { products: (p.data ?? []) as Product[], categories: (c.data ?? []) as Category[] };
  });
  const products = data?.products ?? null;
  const categories = data?.categories ?? [];
  const setProducts = (fn: (list: Product[] | null) => Product[]) =>
    setData((prev) => ({ categories: prev?.categories ?? [], products: fn(prev?.products ?? null) }));
  const [q, setQ] = useState("");
  const origin = useStoreOrigin();

  const filtered = useMemo(
    () => (products ?? []).filter((p) => !q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase())),
    [products, q]
  );

  const quickPatch = async (p: Product, values: Partial<Product>) => {
    const { error } = await getSupabaseBrowser().from("products").update(values).eq("id", p.id);
    if (error) return toast.error(errorMessage(error));
    setProducts((list) => (list ?? []).map((x) => (x.id === p.id ? { ...x, ...values } : x)));
    revalidateStore();
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`¿Eliminar "${p.name}"? Los pedidos anteriores se conservan.`)) return;
    const { error } = await getSupabaseBrowser().from("products").delete().eq("id", p.id);
    if (error) return toast.error(errorMessage(error));
    setProducts((list) => (list ?? []).filter((x) => x.id !== p.id));
    toast.success("Producto eliminado");
    revalidateStore();
  };

  return (
    <>
      <AdminHeader
        title="Productos"
        description="Tu catálogo. Lo que publiques aquí aparece en la tienda en menos de un minuto."
        action={
          <Link href="/admin/productos/nuevo" className={buttonClass("pink", "md")}>
            <Plus className="size-4" /> Nuevo producto
          </Link>
        }
      />

      <label className="relative mb-6 block max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="field rounded-full pl-11" placeholder="Buscar producto" />
      </label>

      {!products ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyBlock
          title="Aún no hay productos"
          text="Crea el primero: sube fotos reales, ponle precio (o déjalo a cotizar) y elige para qué ocasiones es."
          action={
            <Link href="/admin/productos/nuevo" className={buttonClass("primary", "md")}>
              <Plus className="size-4" /> Crear producto
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className={cn("overflow-hidden rounded-[1.5rem] bg-white shadow-soft ring-1 ring-ink/5", !p.is_active && "opacity-60")}>
              <div className="relative aspect-[16/10] bg-paper">
                {p.images[0] ? <Image src={p.images[0]} alt={p.name} fill sizes="400px" className="object-cover" /> : <ProductPlaceholder />}
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {!p.is_active && <span className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold text-cream">Oculto</span>}
                  {p.is_featured && <span className="rounded-full bg-butter px-2.5 py-1 text-[0.65rem] font-bold text-ink">Destacado</span>}
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">{p.category?.name ?? "Sin categoría"}</p>
                <p className="mt-1 font-display text-lg font-medium leading-snug">{p.name}</p>
                <p className="mt-1 text-sm">{formatPrice(p.price)}</p>
                <div className="mt-4 flex items-center gap-1.5">
                  <Link href={`/admin/productos/${p.id}`} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink text-xs font-semibold text-cream">
                    <Pencil className="size-3.5" /> Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => copyText(storeLinkReply(`${origin}/producto/${p.slug}`, p.name), "Mensaje con el link copiado")}
                    disabled={!p.is_active || !origin}
                    className="grid size-9 place-items-center rounded-full ring-1 ring-ink/10 hover:bg-paper disabled:opacity-30"
                    title={p.is_active ? "Copiar link para Facebook / WhatsApp" : "Publícalo para poder compartirlo"}
                  >
                    <Link2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => quickPatch(p, { is_featured: !p.is_featured })}
                    className={cn("grid size-9 place-items-center rounded-full ring-1 ring-ink/10", p.is_featured && "bg-butter-soft text-[#7a5600]")}
                    title={p.is_featured ? "Quitar de destacados" : "Destacar"}
                  >
                    <Star className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => quickPatch(p, { is_active: !p.is_active })}
                    className="grid size-9 place-items-center rounded-full ring-1 ring-ink/10"
                    title={p.is_active ? "Ocultar de la tienda" : "Publicar"}
                  >
                    {p.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button type="button" onClick={() => remove(p)} className="grid size-9 place-items-center rounded-full text-pink-deep ring-1 ring-ink/10 hover:bg-blush" title="Eliminar">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoriesManager categories={categories} onChange={load} />
    </>
  );
}

function CategoriesManager({ categories, onChange }: { categories: Category[]; onChange: () => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!name.trim()) return;
    setBusy(true);
    const { error } = await getSupabaseBrowser()
      .from("categories")
      .insert({ name: name.trim(), slug: slugify(name), sort: categories.length + 1 });
    setBusy(false);
    if (error) return toast.error(errorMessage(error));
    setName("");
    onChange();
    revalidateStore();
  };

  const rename = async (c: Category) => {
    const next = window.prompt("Nuevo nombre de la categoría", c.name);
    if (!next?.trim() || next.trim() === c.name) return;
    const { error } = await getSupabaseBrowser().from("categories").update({ name: next.trim() }).eq("id", c.id);
    if (error) return toast.error(errorMessage(error));
    onChange();
    revalidateStore();
  };

  const remove = async (c: Category) => {
    if (!window.confirm(`¿Eliminar la categoría "${c.name}"? Los productos quedarán sin categoría.`)) return;
    const { error } = await getSupabaseBrowser().from("categories").delete().eq("id", c.id);
    if (error) return toast.error(errorMessage(error));
    onChange();
    revalidateStore();
  };

  return (
    <Card className="mt-10">
      <h2 className="font-display text-2xl">Categorías</h2>
      <p className="mt-1 text-sm text-ink-3">Se muestran como filtros en la tienda y en la portada.</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.id} className="inline-flex items-center gap-1 rounded-full bg-paper py-1.5 pl-4 pr-1.5 text-sm font-medium">
            {c.name}
            <button type="button" onClick={() => rename(c)} className="grid size-7 place-items-center rounded-full hover:bg-white" aria-label="Renombrar">
              <Pencil className="size-3.5" />
            </button>
            <button type="button" onClick={() => remove(c)} className="grid size-7 place-items-center rounded-full text-pink-deep hover:bg-white" aria-label="Eliminar">
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex max-w-md gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Nueva categoría" onKeyDown={(e) => e.key === "Enter" && add()} />
        <button type="button" onClick={add} disabled={busy || !name.trim()} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-cream disabled:opacity-40">
          {busy ? <Loader className="size-4 animate-spin" /> : <Plus className="size-4" />} Agregar
        </button>
      </div>
    </Card>
  );
}
