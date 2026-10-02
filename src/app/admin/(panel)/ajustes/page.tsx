"use client";

import { useEffect, useRef, useState } from "react";
import { Film, ImagePlus, Loader, Save, X } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Settings } from "@/lib/types";
import { cn, errorMessage } from "@/lib/utils";
import { AdminHeader, Card } from "@/components/admin/admin-shell";
import { LoadingBlock } from "@/components/admin/ui";
import { deleteMedia, uploadMedia } from "@/components/admin/media-upload";
import { revalidateStore } from "../../actions";

type Form = {
  whatsapp: string;
  daily_capacity: string;
  min_lead_days: string;
  announcement: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  hero_video_url: string;
  hero_poster_url: string;
  yape_number: string;
  yape_name: string;
  yape_qr_url: string;
  deposit_percent: string;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

export default function AjustesPage() {
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  // URLs guardadas: si cambian, el archivo anterior se borra del storage al guardar
  const savedMedia = useRef({ video: "", poster: "", qr: "" });
  const qrInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSupabaseBrowser()
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(errorMessage(error));
        const s = (data ?? {}) as Partial<Settings>;
        savedMedia.current = { video: s.hero_video_url ?? "", poster: s.hero_poster_url ?? "", qr: s.yape_qr_url ?? "" };
        setForm({
          whatsapp: s.whatsapp ?? "51912470219",
          daily_capacity: s.daily_capacity === null || s.daily_capacity === undefined ? "" : String(s.daily_capacity),
          min_lead_days: String(s.min_lead_days ?? 1),
          announcement: s.announcement ?? "",
          address: s.address ?? "",
          facebook_url: s.facebook_url ?? "",
          instagram_url: s.instagram_url ?? "",
          tiktok_url: s.tiktok_url ?? "",
          hero_video_url: s.hero_video_url ?? "",
          hero_poster_url: s.hero_poster_url ?? "",
          yape_number: s.yape_number ?? "",
          yape_name: s.yape_name ?? "",
          yape_qr_url: s.yape_qr_url ?? "",
          deposit_percent: String(s.deposit_percent ?? 50),
        });
      });
  }, []);

  if (!form) return <LoadingBlock />;
  const set = (k: keyof Form, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const upload = async (file: File | undefined, key: "hero_video_url" | "hero_poster_url" | "yape_qr_url") => {
    if (!file) return;
    setUploading(key === "hero_video_url" ? "Subiendo video…" : "Subiendo imagen…");
    try {
      const url = await uploadMedia(file, "site");
      set(key, url);
      toast.success("Archivo subido. No olvides guardar.");
    } catch (e) {
      toast.error(errorMessage(e, "No se pudo subir el archivo."));
    }
    setUploading(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const wa = form.whatsapp.replace(/\D/g, "");
    const waFull = /^9\d{8}$/.test(wa) ? `51${wa}` : wa;
    if (!/^519\d{8}$/.test(waFull)) return toast.error("El WhatsApp debe ser un celular peruano de 9 dígitos.");
    const yape = form.yape_number.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, "");
    if (yape && !/^9\d{8}$/.test(yape)) return toast.error("El número de Yape debe tener 9 dígitos y empezar con 9.");
    const deposit = Number(form.deposit_percent);
    if (!Number.isInteger(deposit) || deposit < 0 || deposit > 100) return toast.error("El adelanto debe ser un porcentaje entre 0 y 100.");
    setSaving(true);
    const { error } = await getSupabaseBrowser()
      .from("settings")
      .update({
        whatsapp: waFull,
        daily_capacity: form.daily_capacity.trim() === "" ? null : Number(form.daily_capacity),
        min_lead_days: Number(form.min_lead_days) || 0,
        announcement: form.announcement.trim() || null,
        address: form.address.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
        hero_video_url: form.hero_video_url || null,
        hero_poster_url: form.hero_poster_url || null,
        yape_number: yape || null,
        yape_name: form.yape_name.trim() || null,
        yape_qr_url: form.yape_qr_url || null,
        deposit_percent: deposit,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) return toast.error(errorMessage(error));
    const prev = savedMedia.current;
    if (prev.video && prev.video !== form.hero_video_url) deleteMedia(prev.video);
    if (prev.poster && prev.poster !== form.hero_poster_url) deleteMedia(prev.poster);
    if (prev.qr && prev.qr !== form.yape_qr_url) deleteMedia(prev.qr);
    savedMedia.current = { video: form.hero_video_url, poster: form.hero_poster_url, qr: form.yape_qr_url };
    await revalidateStore();
    toast.success("Ajustes guardados");
  };

  return (
    <form onSubmit={save}>
      <AdminHeader
        title="Ajustes"
        description="Pagos con Yape, contacto, reglas del calendario y video de portada."
        action={
          <button type="submit" disabled={saving || !!uploading} className="inline-flex h-12 items-center gap-2 rounded-full bg-pink px-6 font-semibold text-white shadow-glow disabled:opacity-50">
            {saving ? <Loader className="size-4 animate-spin" /> : <Save className="size-4" />} Guardar
          </button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">Pagos con Yape</h2>
              <p className="mt-1 text-sm text-ink-3">
                Al separar, el cliente ve tu QR, tu número y cuánto pagar. Luego te envía el comprobante por WhatsApp.
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                form.yape_number || form.yape_qr_url ? "bg-teal-soft text-teal-deep" : "bg-butter-soft text-[#7a5600]"
              )}
            >
              {form.yape_number || form.yape_qr_url ? "Activo en la tienda" : "Aún no configurado"}
            </span>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_auto]">
            <div className="grid gap-4">
              <Field label="Número de Yape" hint="9 dígitos. Los clientes lo pueden copiar con un toque.">
                <input value={form.yape_number} onChange={(e) => set("yape_number", e.target.value)} className="field" inputMode="tel" placeholder="9XX XXX XXX" />
              </Field>
              <Field label="Nombre del titular" hint="El que aparece en Yape al pagar, para que el cliente confirme que es tu cuenta.">
                <input value={form.yape_name} onChange={(e) => set("yape_name", e.target.value)} className="field" placeholder="Nombre y apellido" />
              </Field>
            </div>
            <Field
              label="Adelanto para separar (%)"
              hint="100 = pago completo · 50 = la mitad · 0 = sin adelanto. En pedidos “a cotizar” primero confirmas el precio."
            >
              <div className="flex items-center gap-2">
                <input
                  value={form.deposit_percent}
                  onChange={(e) => set("deposit_percent", e.target.value.replace(/\D/g, "").slice(0, 3))}
                  className="field max-w-28"
                  inputMode="numeric"
                />
                <span className="text-lg font-semibold text-ink-3">%</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["30", "50", "100"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("deposit_percent", v)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1",
                      form.deposit_percent === v ? "bg-ink text-cream ring-ink" : "bg-white ring-ink/10"
                    )}
                  >
                    {v === "100" ? "Pago completo" : `${v}%`}
                  </button>
                ))}
              </div>
            </Field>
            <div className="w-44">
              <span className="mb-2 block text-sm font-semibold">QR de Yape</span>
              {form.yape_qr_url ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.yape_qr_url} alt="QR de Yape" className="w-full rounded-2xl bg-white p-2 ring-1 ring-ink/10" />
                  <button type="button" onClick={() => set("yape_qr_url", "")} className="inline-flex items-center gap-1 text-sm font-semibold text-pink-deep">
                    <X className="size-4" /> Quitar QR
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => qrInput.current?.click()}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 p-3 text-center text-xs font-semibold text-ink-3 hover:border-pink hover:text-pink-deep"
                >
                  <ImagePlus className="size-7" /> Subir captura de tu QR
                </button>
              )}
              <input ref={qrInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0], "yape_qr_url")} />
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-3">Tip: en Yape abre “Mi QR”, haz una captura de pantalla y súbela aquí.</p>
        </Card>

        <Card>
          <h2 className="font-display text-xl">Contacto</h2>
          <div className="mt-5 grid gap-4">
            <Field label="WhatsApp de la tienda" hint="Todos los pedidos y consultas llegan a este número.">
              <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="field" inputMode="tel" />
            </Field>
            <Field label="Ubicación">
              <input value={form.address} onChange={(e) => set("address", e.target.value)} className="field" />
            </Field>
            <Field label="Facebook">
              <input value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} className="field" placeholder="https://facebook.com/…" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram">
                <input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} className="field" placeholder="https://instagram.com/…" />
              </Field>
              <Field label="TikTok">
                <input value={form.tiktok_url} onChange={(e) => set("tiktok_url", e.target.value)} className="field" placeholder="https://tiktok.com/@…" />
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl">Calendario y separaciones</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Pedidos máximos por día" hint="Vacío = sin límite. Al llenarse, el día aparece como “Completo”.">
              <input value={form.daily_capacity} onChange={(e) => set("daily_capacity", e.target.value.replace(/\D/g, ""))} className="field" inputMode="numeric" placeholder="Sin límite" />
            </Field>
            <Field label="Días mínimos de anticipación" hint="Cada producto puede pedir más días.">
              <input value={form.min_lead_days} onChange={(e) => set("min_lead_days", e.target.value.replace(/\D/g, ""))} className="field" inputMode="numeric" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Anuncio superior" hint="Si lo dejas vacío, se muestra automáticamente la próxima fecha especial.">
              <input value={form.announcement} onChange={(e) => set("announcement", e.target.value)} className="field" placeholder="Ej: ¡Separa tu detalle del Día de la Madre!" maxLength={140} />
            </Field>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <h2 className="font-display text-xl">Video de portada</h2>
          <p className="mt-1 text-sm text-ink-3">
            Sube un video vertical u horizontal de tus detalles (MP4, máx. 50 MB). Se reproduce dentro del cuadro animado de la portada. Si no hay video, se muestra la animación ilustrada.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-paper/60 p-4">
              {form.hero_video_url ? (
                <div className="space-y-3">
                  <video src={form.hero_video_url} className="aspect-video w-full rounded-xl bg-ink object-cover" muted autoPlay loop playsInline />
                  <button type="button" onClick={() => set("hero_video_url", "")} className="inline-flex items-center gap-1 text-sm font-semibold text-pink-deep">
                    <X className="size-4" /> Quitar video
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => videoInput.current?.click()} className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 text-sm font-semibold text-ink-3 hover:border-pink hover:text-pink-deep">
                  <Film className="size-7" /> Subir video
                </button>
              )}
              <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => upload(e.target.files?.[0], "hero_video_url")} />
            </div>
            <div className="rounded-2xl bg-paper/60 p-4">
              {form.hero_poster_url ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.hero_poster_url} alt="" className="aspect-video w-full rounded-xl object-cover" />
                  <button type="button" onClick={() => set("hero_poster_url", "")} className="inline-flex items-center gap-1 text-sm font-semibold text-pink-deep">
                    <X className="size-4" /> Quitar imagen
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => posterInput.current?.click()} className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 text-sm font-semibold text-ink-3 hover:border-pink hover:text-pink-deep">
                  <ImagePlus className="size-7" /> Imagen de carga (opcional)
                </button>
              )}
              <input ref={posterInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0], "hero_poster_url")} />
            </div>
          </div>
          {uploading && (
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-pink-deep">
              <Loader className="size-4 animate-spin" /> {uploading}
            </p>
          )}
        </Card>
      </div>
    </form>
  );
}
