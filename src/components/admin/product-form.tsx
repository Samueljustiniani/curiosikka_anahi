"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Loader, Save, Trash2, Video, X } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Category, Product } from "@/lib/types";
import { OCCASIONS } from "@/lib/occasions";
import { cn, errorMessage, slugify } from "@/lib/utils";
import { AdminHeader, Card } from "./admin-shell";
import { Toggle } from "./ui";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { deleteMedia, uploadMedia, MAX_IMAGE_MB, MAX_VIDEO_MB } from "./media-upload";
import { revalidateStore } from "@/app/admin/actions";

type FormState = {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: string;
  compare_at_price: string;
  category_id: string;
  occasions: string[];
  images: string[];
  video_url: string;
  is_customizable: boolean;
  customization_hint: string;
  lead_days: string;
  stock: string;
  is_featured: boolean;
  is_active: boolean;
  sort: string;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  price: "",
  compare_at_price: "",
  category_id: "",
  occasions: [],
  images: [],
  video_url: "",
  is_customizable: true,
  customization_hint: "",
  lead_days: "",
  stock: "",
  is_featured: false,
  is_active: true,
  sort: "0",
};

function toForm(p: Product): FormState {
  return {
    name: p.name,
    slug: p.slug,
    short_description: p.short_description ?? "",
    description: p.description ?? "",
    price: p.price === null ? "" : String(p.price),
    compare_at_price: p.compare_at_price === null ? "" : String(p.compare_at_price),
    category_id: p.category_id ?? "",
    occasions: p.occasions ?? [],
    images: p.images ?? [],
    video_url: p.video_url ?? "",
    is_customizable: p.is_customizable,
    customization_hint: p.customization_hint ?? "",
    lead_days: p.lead_days === null ? "" : String(p.lead_days),
    stock: p.stock === null ? "" : String(p.stock),
    is_featured: p.is_featured,
    is_active: p.is_active,
    sort: String(p.sort ?? 0),
  };
}

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!productId);
  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);
  // Archivos quitados: se borran del storage solo al guardar
  const pendingDeletes = useRef<string[]>([]);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    sb.from("categories").select("*").order("sort").then(({ data }) => setCategories((data ?? []) as Category[]));
    if (productId) {
      sb.from("products").select("*").eq("id", productId).maybeSingle().then(({ data, error }) => {
        if (error || !data) {
          toast.error("No encontramos el producto.");
          router.replace("/admin/productos");
          return;
        }
        setForm(toForm(data as Product));
        setLoading(false);
      });
    }
  }, [productId, router]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 10);
    for (const [i, file] of list.entries()) {
      setUploading(`Subiendo foto ${i + 1} de ${list.length}…`);
      try {
        const url = await uploadMedia(file, "products");
        setForm((f) => ({ ...f, images: [...f.images, url] }));
      } catch (e) {
        toast.error(errorMessage(e, "No se pudo subir la foto."));
      }
    }
    setUploading(null);
    if (imgInput.current) imgInput.current.value = "";
  };

  const onVideo = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading("Subiendo video…");
    try {
      const url = await uploadMedia(file, "products");
      if (form.video_url) pendingDeletes.current.push(form.video_url);
      set("video_url", url);
    } catch (e) {
      toast.error(errorMessage(e, "No se pudo subir el video."));
    }
    setUploading(null);
    if (vidInput.current) vidInput.current.value = "";
  };

  const moveImage = (i: number, d: number) =>
    setForm((f) => {
      const imgs = [...f.images];
      const j = i + d;
      if (j < 0 || j >= imgs.length) return f;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...f, images: imgs };
    });

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((x) => x !== url) }));
    pendingDeletes.current.push(url);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Ponle un nombre al producto.");
    const slug = slugify(form.slug || form.name);
    if (!slug) return toast.error("El enlace (slug) no es válido.");
    const price = num(form.price);
    if (price !== null && (Number.isNaN(price) || price < 0)) return toast.error("Revisa el precio.");

    const payload = {
      name: form.name.trim(),
      slug,
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      price,
      compare_at_price: num(form.compare_at_price),
      category_id: form.category_id || null,
      occasions: form.occasions,
      images: form.images,
      video_url: form.video_url || null,
      is_customizable: form.is_customizable,
      customization_hint: form.customization_hint.trim() || null,
      lead_days: num(form.lead_days),
      stock: num(form.stock),
      is_featured: form.is_featured,
      is_active: form.is_active,
      sort: Number(form.sort) || 0,
    };

    setSaving(true);
    const sb = getSupabaseBrowser();
    const { error } = productId
      ? await sb.from("products").update(payload).eq("id", productId)
      : await sb.from("products").insert(payload);
    setSaving(false);
    if (error) {
      if (error.code === "23505") return toast.error("Ya existe un producto con ese enlace (slug). Cámbialo.");
      return toast.error(errorMessage(error));
    }
    pendingDeletes.current.forEach((url) => deleteMedia(url));
    pendingDeletes.current = [];
    await revalidateStore();
    toast.success(productId ? "Cambios guardados" : "Producto creado");
    router.push("/admin/productos");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-ink-3">
        <Loader className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={save}>
      <Link href="/admin/productos" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-3 hover:text-ink">
        <ArrowLeft className="size-4" /> Productos
      </Link>
      <AdminHeader
        title={productId ? "Editar producto" : "Nuevo producto"}
        action={
          <div className="flex gap-2">
            {productId && form.is_active && (
              <a href={`/producto/${form.slug}`} target="_blank" className="inline-flex h-12 items-center rounded-full px-5 text-sm font-semibold text-ink-3 ring-1 ring-ink/10 hover:text-ink">
                Ver en la tienda
              </a>
            )}
            <button type="submit" disabled={saving || !!uploading} className="inline-flex h-12 items-center gap-2 rounded-full bg-pink px-6 font-semibold text-white shadow-glow disabled:opacity-50">
              {saving ? <Loader className="size-4 animate-spin" /> : <Save className="size-4" />} Guardar
            </button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Nombre</span>
                <input
                  value={form.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!slugTouched) set("slug", slugify(e.target.value));
                  }}
                  className="field text-lg"
                  placeholder="Ej: Cuadro con fotos y frase"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Enlace</span>
                <div className="flex items-center rounded-2xl border border-ink/12 bg-white pl-4 text-sm focus-within:border-pink">
                  <span className="text-ink-3">/producto/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                    className="w-full rounded-r-2xl bg-transparent px-1 py-3 focus:outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Descripción corta</span>
                <input value={form.short_description} onChange={(e) => set("short_description", e.target.value)} className="field" placeholder="Una línea que enamore" maxLength={160} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Descripción completa</span>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={6} className="field" placeholder="Medidas, materiales, qué incluye, cómo se personaliza…" />
              </label>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl">Fotos y video</h2>
                <p className="text-sm text-ink-3">La primera foto es la portada. Sube fotos directo del celular (hasta {MAX_IMAGE_MB} MB): se optimizan solas. Video hasta {MAX_VIDEO_MB} MB.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {form.images.map((url, i) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/5">
                  <Image src={url} alt="" fill sizes="160px" className="object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] font-bold text-cream">Portada</span>}
                  <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <span className="flex gap-1">
                      <button type="button" onClick={() => moveImage(i, -1)} className="grid size-7 place-items-center rounded-full bg-white/90" aria-label="Mover a la izquierda">
                        <ArrowLeft className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => moveImage(i, 1)} className="grid size-7 place-items-center rounded-full bg-white/90" aria-label="Mover a la derecha">
                        <ArrowRight className="size-3.5" />
                      </button>
                    </span>
                    <button type="button" onClick={() => removeImage(url)} className="grid size-7 place-items-center rounded-full bg-white/90 text-pink-deep" aria-label="Quitar foto">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => imgInput.current?.click()}
                disabled={!!uploading}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 text-sm font-semibold text-ink-3 transition hover:border-pink hover:text-pink-deep disabled:opacity-50"
              >
                <ImagePlus className="size-6" /> Agregar fotos
              </button>
            </div>
            <input ref={imgInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => onImages(e.target.files)} />

            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-paper/60 p-3">
              <Video className="size-5 text-ink-3" />
              {form.video_url ? (
                <>
                  <video src={form.video_url} className="h-16 w-28 rounded-xl bg-ink object-cover" muted playsInline />
                  <span className="flex-1 text-sm">Video cargado</span>
                  <button type="button" onClick={() => { pendingDeletes.current.push(form.video_url); set("video_url", ""); }} className="inline-flex items-center gap-1 text-sm font-semibold text-pink-deep">
                    <X className="size-4" /> Quitar
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-ink-3">Un video corto (reel) del producto se ve espectacular.</span>
                  <button type="button" onClick={() => vidInput.current?.click()} disabled={!!uploading} className="rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-ink/10">
                    Subir video
                  </button>
                </>
              )}
              <input ref={vidInput} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => onVideo(e.target.files)} />
            </div>
            {uploading && (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-pink-deep">
                <Loader className="size-4 animate-spin" /> {uploading}
              </p>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-xl">Ocasiones</h2>
            <p className="text-sm text-ink-3">El producto aparecerá en la página de cada ocasión que marques.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {OCCASIONS.map((o) => {
                const on = form.occasions.includes(o.slug);
                return (
                  <button
                    key={o.slug}
                    type="button"
                    onClick={() => set("occasions", on ? form.occasions.filter((x) => x !== o.slug) : [...form.occasions, o.slug])}
                    className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium ring-1 transition", on ? "ring-2" : "bg-white ring-ink/10 hover:ring-ink/30")}
                    style={on ? { background: o.palette.from, color: o.palette.ink, boxShadow: `inset 0 0 0 2px ${o.palette.accent}` } : undefined}
                  >
                    <OccasionIcon icon={o.icon} className="size-3.5" style={{ color: o.palette.accent }} />
                    {o.name}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-xl">Precio</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Precio (S/)</span>
                <input value={form.price} onChange={(e) => set("price", e.target.value)} className="field" inputMode="decimal" placeholder="Vacío = a cotizar" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Precio antes</span>
                <input value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} className="field" inputMode="decimal" placeholder="Opcional" />
              </label>
            </div>
            <p className="mt-2 text-xs text-ink-3">Si dejas el precio vacío se muestra “Precio a cotizar”.</p>
          </Card>

          <Card>
            <h2 className="font-display text-xl">Organización</h2>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold">Categoría</span>
              <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className="field cursor-pointer">
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold">Días de anticipación</span>
                <input value={form.lead_days} onChange={(e) => set("lead_days", e.target.value.replace(/\D/g, ""))} className="field" inputMode="numeric" placeholder="—" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold">Stock</span>
                <input value={form.stock} onChange={(e) => set("stock", e.target.value.replace(/\D/g, ""))} className="field" inputMode="numeric" placeholder="Por pedido" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold">Orden</span>
                <input value={form.sort} onChange={(e) => set("sort", e.target.value.replace(/[^\d-]/g, ""))} className="field" inputMode="numeric" />
              </label>
            </div>
            <div className="mt-4 space-y-2">
              <Toggle checked={form.is_active} onChange={(v) => set("is_active", v)} label="Publicado en la tienda" />
              <Toggle checked={form.is_featured} onChange={(v) => set("is_featured", v)} label="Destacado en la portada" />
              <Toggle checked={form.is_customizable} onChange={(v) => set("is_customizable", v)} label="Personalizable" />
            </div>
            {form.is_customizable && (
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold">¿Qué debe enviar el cliente?</span>
                <input value={form.customization_hint} onChange={(e) => set("customization_hint", e.target.value)} className="field" placeholder="Ej: 6 fotos y una frase corta" maxLength={140} />
              </label>
            )}
          </Card>
        </div>
      </div>
    </form>
  );
}
