"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight, CalendarDays, Check, ChevronDown, Copy, Gift, Home, Lightbulb, Loader, Minus, PenLine, Plus, ShoppingBag, Smartphone, Trash2, Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { useSite } from "@/components/providers/site-provider";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { Button, buttonClass } from "@/components/ui/button";
import { Heart, Sparkle } from "@/components/ui/illustrations";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { OCCASIONS, getOccasion } from "@/lib/occasions";
import { formatLong, formatShort, isValidISO, limaToday, type ISODate, ucfirst } from "@/lib/dates";
import { cn, formatPhone, formatPrice, normalizePhone, sanitizePhoneInput } from "@/lib/utils";
import { orderMessage, paymentProofLine, waLink, type OrderMessageInput } from "@/lib/whatsapp";
import { depositFor } from "@/lib/payments";
import { YapePayCard } from "./yape-pay-card";
import { clearDraft, getDraft, getMe, rememberOrder, saveDraft, saveMe } from "@/lib/device-store";

const TIME_SLOTS = ["Mañana", "Tarde", "Noche", "Coordinar por WhatsApp"];
const ANY_TIME = TIME_SLOTS[3];

type Mode = "cart" | "custom";

type Done = { code: string | null; message: string; saved: boolean; subtotal: number; hasQuote: boolean };

type Draft = {
  date: string | null;
  timeSlot: string;
  occasion: string;
  deliveryType: "recojo" | "delivery";
  district: string;
  address: string;
  recipient: string;
  dedication: string;
  notes: string;
  budget: string;
};

function Step({ n, title, icon: Icon, children, hint }: { n: number; title: string; icon: typeof Gift; children: React.ReactNode; hint?: string }) {
  return (
    <section className="rounded-[2rem] bg-white/85 p-5 shadow-soft ring-1 ring-ink/5 backdrop-blur sm:p-8">
      <header className="mb-6 flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blush text-pink-deep">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink-3">Paso {n} de 3</p>
          <h2 className="font-display text-2xl font-medium leading-tight">{title}</h2>
          {hint && <p className="mt-1 text-sm text-ink-3">{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <span className="mb-2 block text-sm font-semibold text-ink">
      {children} {optional && <span className="font-normal text-ink-3">(opcional)</span>}
    </span>
  );
}

export function SepararForm({ mode = "cart" }: { mode?: Mode }) {
  const params = useSearchParams();
  const cart = useCart();
  const { whatsapp, min_lead_days } = useSite();

  const paramDate = params.get("fecha");
  const paramOccasion = params.get("ocasion");

  const [date, setDate] = useState<ISODate | null>(isValidISO(paramDate) ? paramDate : null);
  const [timeSlot, setTimeSlot] = useState(ANY_TIME);
  const [occasion, setOccasion] = useState(getOccasion(paramOccasion) ? paramOccasion! : "");
  const [deliveryType, setDeliveryType] = useState<"recojo" | "delivery">("recojo");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [dedication, setDedication] = useState("");
  const [notes, setNotes] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savedMe, setSavedMe] = useState<{ name: string; phone: string } | null>(null);
  const [editMe, setEditMe] = useState(true);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recupera lo que el cliente ya escribió antes en este dispositivo
  useEffect(() => {
    const me = getMe();
    if (me.name) setName(me.name);
    if (me.phone) setPhone(me.phone);
    if (me.name && me.phone && normalizePhone(me.phone)) {
      setSavedMe({ name: me.name, phone: me.phone });
      setEditMe(false);
    }

    const d = getDraft<Draft>(mode);
    if (d) {
      if (!isValidISO(paramDate) && isValidISO(d.date) && d.date >= limaToday()) setDate(d.date);
      if (!getOccasion(paramOccasion) && d.occasion && getOccasion(d.occasion)) setOccasion(d.occasion);
      if (d.timeSlot && TIME_SLOTS.includes(d.timeSlot)) setTimeSlot(d.timeSlot);
      if (d.deliveryType === "delivery") setDeliveryType("delivery");
      setDistrict(d.district ?? "");
      setAddress(d.address ?? "");
      setRecipient(d.recipient ?? "");
      setDedication(d.dedication ?? "");
      setNotes(d.notes ?? "");
      setBudget(d.budget ?? "");
      if (d.deliveryType === "delivery" || d.recipient || d.dedication || (d.timeSlot && d.timeSlot !== ANY_TIME)) setExtrasOpen(true);
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guarda el borrador mientras escribe (si recarga la página no pierde nada)
  useEffect(() => {
    if (!ready || done) return;
    const draft: Draft = { date, timeSlot, occasion, deliveryType, district, address, recipient, dedication, notes, budget };
    saveDraft(mode, draft);
  }, [ready, done, mode, date, timeSlot, occasion, deliveryType, district, address, recipient, dedication, notes, budget]);

  useEffect(() => {
    if (done) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [done]);

  const items = mode === "cart" ? cart.items : [];
  const useItems = mode === "cart" && items.length > 0;
  const isCustom = !useItems;
  const subtotal = useItems ? cart.subtotal : 0;
  const hasQuote = useItems ? cart.hasQuote : true;

  const validate = () => {
    const e: Record<string, string> = {};
    if (isCustom && !notes.trim()) e.notes = "Cuéntanos tu idea para poder ayudarte.";
    if (!date) e.date = "Elige la fecha en el calendario.";
    if (!name.trim()) e.name = "Cuéntanos tu nombre.";
    if (!normalizePhone(phone)) e.phone = "Ingresa un celular válido de 9 dígitos (empieza con 9).";
    if (deliveryType === "delivery" && !district.trim()) e.district = "Indica el distrito para el delivery.";
    setErrors(e);
    if (e.name || e.phone) setEditMe(true);
    if (e.district) setExtrasOpen(true);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      setTimeout(() => document.getElementById(`f-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      toast.error(Object.values(e)[0]);
      return false;
    }
    return true;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting || !validate() || !date) return;
    const cleanPhone = normalizePhone(phone)!;
    const fullNotes = [notes.trim(), budget.trim() ? `Presupuesto aproximado: ${budget.trim()}` : ""].filter(Boolean).join("\n");
    saveMe({ name: name.trim(), phone: cleanPhone });

    const msgBase: Omit<OrderMessageInput, "code"> = {
      name: name.trim(),
      phone: cleanPhone,
      date,
      timeSlot: timeSlot === ANY_TIME ? undefined : timeSlot,
      occasion: occasion || undefined,
      deliveryType,
      district: district.trim() || undefined,
      address: address.trim() || undefined,
      recipient: recipient.trim() || undefined,
      dedication: dedication.trim() || undefined,
      notes: fullNotes ? (isCustom ? `Mi idea: ${fullNotes}` : fullNotes) : undefined,
      items: useItems ? items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, note: i.note })) : [],
      subtotal,
      hasQuote: useItems ? hasQuote : false,
    };

    const finish = (result: Done) => {
      clearDraft(mode);
      if (result.code) rememberOrder(result.code, cleanPhone);
      if (useItems && result.saved) cart.clear();
      setDone(result);
    };

    setSubmitting(true);
    if (!isSupabaseConfigured) {
      setSubmitting(false);
      finish({ code: null, message: orderMessage({ ...msgBase, code: null }), saved: false, subtotal, hasQuote: msgBase.hasQuote || isCustom });
      return;
    }

    const { data, error } = await getSupabaseBrowser().rpc("create_order", {
      p_name: name.trim(),
      p_phone: cleanPhone,
      p_delivery_date: date,
      p_time_slot: msgBase.timeSlot ?? null,
      p_occasion: occasion || null,
      p_delivery_type: deliveryType,
      p_district: district.trim() || null,
      p_address: address.trim() || null,
      p_recipient: recipient.trim() || null,
      p_dedication: dedication.trim() || null,
      p_notes: fullNotes || null,
      p_items: useItems ? items.map((i) => ({ product_id: i.productId, qty: i.qty, note: i.note })) : [],
    });
    setSubmitting(false);

    if (error) {
      // Error de validación del servidor → mostrar y dejar corregir
      if (error.code === "22023" || error.code === "P0001") {
        toast.error(error.message);
        return;
      }
      // BD no lista o sin conexión: nunca perder el pedido, se envía directo por WhatsApp
      console.warn("No se pudo registrar el pedido; se enviará directo por WhatsApp.", error.message);
      finish({ code: null, message: orderMessage({ ...msgBase, code: null }), saved: false, subtotal, hasQuote: msgBase.hasQuote || isCustom });
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    const code: string | null = row?.order_code ?? null;
    const serverSubtotal = row?.order_subtotal !== undefined ? Number(row.order_subtotal) : subtotal;
    finish({ code, message: orderMessage({ ...msgBase, subtotal: serverSubtotal, code }), saved: true, subtotal: serverSubtotal, hasQuote: msgBase.hasQuote || isCustom });
  };

  if (done) return <Success done={done} />;

  const extrasSummary = [
    deliveryType === "delivery" ? `Delivery${district ? ` a ${district}` : ""}` : "Recojo",
    timeSlot === ANY_TIME ? "horario por WhatsApp" : `por la ${timeSlot.toLowerCase()}`,
    dedication.trim() ? "con dedicatoria" : "sin dedicatoria",
  ].join(" · ");

  const submitLabel = submitting ? "Separando…" : isCustom ? "Enviar mi idea" : "Separar mi pedido";

  return (
    <form id="separar-form" onSubmit={submit} noValidate className="grid grid-cols-1 gap-6 pb-28 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8 lg:pb-0">
      <div className="min-w-0 space-y-6">
        {/* 1. Pedido */}
        {mode === "cart" && useItems ? (
          <Step n={1} title="Tu pedido" icon={ShoppingBag} hint="Revisa cantidades y, si quieres, el nombre o frase para personalizar.">
            <ul className="divide-y divide-ink/8">
              {items.map((it) => (
                <li key={it.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-paper">
                    {it.image ? <Image src={it.image} alt={it.name} fill sizes="80px" className="object-cover" /> : <Gift className="m-auto mt-7 size-6 text-ink-3" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/producto/${it.slug}`} className="font-medium hover:text-pink-deep">{it.name}</Link>
                      <button type="button" onClick={() => cart.remove(it.productId)} className="rounded-full p-1 text-ink-3 hover:bg-blush hover:text-pink-deep" aria-label="Quitar">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <input
                      value={it.note}
                      onChange={(e) => cart.update(it.productId, { note: e.target.value.slice(0, 300) })}
                      placeholder="Nombre, fecha o frase (opcional)"
                      className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm focus:border-pink focus:outline-none"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full ring-1 ring-ink/10">
                        <button type="button" onClick={() => cart.update(it.productId, { qty: it.qty - 1 })} disabled={it.qty <= 1} className="grid size-8 place-items-center rounded-full disabled:opacity-40" aria-label="Menos">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                        <button type="button" onClick={() => cart.update(it.productId, { qty: it.qty + 1 })} className="grid size-8 place-items-center rounded-full" aria-label="Más">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-display font-semibold">{it.price === null ? "A cotizar" : formatPrice(it.price * it.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Step>
        ) : (
          <Step n={1} title="Cuéntanos tu idea" icon={Lightbulb} hint="Las fotos las envías luego por WhatsApp.">
            {mode === "cart" && (
              <p className="-mt-2 mb-5 rounded-2xl bg-paper px-4 py-3 text-sm text-ink-2">
                Tu lista está vacía.{" "}
                <Link href="/tienda" className="font-semibold text-pink-deep underline underline-offset-2">Elige productos de la tienda</Link>{" "}
                o pide un detalle 100% personalizado aquí.
              </p>
            )}
            <label className="block" id="f-notes">
              <Label>¿Qué te gustaría regalar?</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 900))}
                rows={3}
                className={cn("field resize-none", errors.notes && "border-pink")}
                placeholder="Ej: un cuadro con 6 fotos de nosotros, en tonos azules, con la frase de nuestra canción…"
              />
              {errors.notes && <span className="mt-1.5 block text-xs text-pink-deep">{errors.notes}</span>}
            </label>
            <label className="mt-4 block">
              <Label optional>Presupuesto aproximado</Label>
              <input value={budget} onChange={(e) => setBudget(e.target.value.slice(0, 40))} className="field" placeholder="Ej: S/ 80" />
            </label>
          </Step>
        )}

        {/* 2. Fecha */}
        <Step n={2} title="¿Para cuándo?" icon={CalendarDays} hint={min_lead_days > 0 ? `Con al menos ${min_lead_days} día${min_lead_days === 1 ? "" : "s"} de anticipación.` : undefined}>
          <div id="f-date" className={cn("rounded-[1.5rem] bg-paper/60 p-3 sm:p-5", errors.date && "ring-2 ring-pink")}>
            <MonthCalendar
              key={ready ? "ready" : "init"}
              value={date}
              minLeadDays={min_lead_days}
              onSelect={(iso) => {
                setDate(iso);
                setErrors((e) => ({ ...e, date: "" }));
              }}
              initialMonth={date}
            />
          </div>
          <AnimatePresence>
            {date && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 flex items-center gap-2 text-sm font-semibold text-teal-deep">
                <Check className="size-4" /> <span>{ucfirst(formatLong(date, true))}</span>
              </motion.p>
            )}
          </AnimatePresence>
          <label className="mt-5 block max-w-sm">
            <Label optional>Ocasión</Label>
            <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="field cursor-pointer">
              <option value="">Elige una ocasión</option>
              {OCCASIONS.map((o) => (
                <option key={o.slug} value={o.slug}>{o.name}</option>
              ))}
            </select>
          </label>
        </Step>

        {/* 3. Datos */}
        <Step n={3} title="Tus datos" icon={Smartphone} hint={editMe ? "Tu celular es tu identificación: sin cuentas ni contraseñas." : undefined}>
          {!editMe ? (
            <div className="flex items-center gap-4 rounded-2xl bg-paper/70 p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pink font-display text-xl font-semibold text-white">
                {name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-3">¡Hola de nuevo! Separas como</p>
                <p className="truncate font-semibold">{name}</p>
                <p className="text-sm text-ink-3">+51 {formatPhone(phone)}</p>
              </div>
              <button type="button" onClick={() => setEditMe(true)} className="shrink-0 text-sm font-semibold text-pink-deep underline underline-offset-4">
                Cambiar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedMe && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper/60 px-3.5 py-2 text-xs">
                  <span className="text-ink-3">
                    Datos guardados: <strong className="font-semibold text-ink">{savedMe.name}</strong> (+51 {formatPhone(savedMe.phone)})
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setName("");
                        setPhone("");
                      }}
                      className="text-ink-3 hover:text-ink hover:underline"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setName(savedMe.name);
                        setPhone(savedMe.phone);
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.name;
                          delete next.phone;
                          return next;
                        });
                        setEditMe(false);
                      }}
                      className="font-semibold text-pink-deep hover:underline"
                    >
                      Volver a mis datos
                    </button>
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block" id="f-name">
                  <Label>Tu nombre</Label>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value.slice(0, 80));
                      if (errors.name) setErrors((prev) => { const n = { ...prev }; delete n.name; return n; });
                    }}
                    className={cn("field", errors.name && "border-pink")}
                    placeholder="Nombre y apellido"
                    autoComplete="name"
                  />
                  {errors.name && <span className="mt-1.5 block text-xs text-pink-deep">{errors.name}</span>}
                </label>
                <label className="block" id="f-phone">
                  <Label>Celular (WhatsApp)</Label>
                  <div className={cn("flex items-center rounded-2xl border bg-white transition focus-within:border-pink focus-within:ring-4 focus-within:ring-pink/10", errors.phone ? "border-pink" : "border-ink/12")}>
                    <span className="border-r border-ink/10 px-3.5 text-sm font-semibold text-ink-3">🇵🇪 +51</span>
                    <input
                      value={phone}
                      onChange={(e) => {
                        setPhone(sanitizePhoneInput(e.target.value));
                        if (errors.phone) setErrors((prev) => { const n = { ...prev }; delete n.phone; return n; });
                      }}
                      maxLength={9}
                      className="w-full rounded-r-2xl bg-transparent px-3.5 py-3 text-[0.95rem] tracking-wide focus:outline-none"
                      placeholder="9XX XXX XXX"
                      inputMode="tel"
                      autoComplete="tel-national"
                    />
                  </div>
                  {errors.phone && <span className="mt-1.5 block text-xs text-pink-deep">{errors.phone}</span>}
                </label>
              </div>
            </div>
          )}
        </Step>

        {/* Opcional: entrega, horario y dedicatoria (plegado para no alargar la compra) */}
        <section className="overflow-hidden rounded-[2rem] bg-white/85 shadow-soft ring-1 ring-ink/5 backdrop-blur">
          <button type="button" onClick={() => setExtrasOpen((o) => !o)} className="flex w-full items-center gap-4 p-5 text-left sm:px-8 sm:py-6" aria-expanded={extrasOpen}>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lilac-soft text-[#5b3fa8]">
              <PenLine className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink-3">Opcional</span>
              <span className="block font-display text-xl font-medium leading-tight">Entrega, horario y dedicatoria</span>
              <span className="block truncate text-sm text-ink-3">{extrasSummary}</span>
            </span>
            <ChevronDown className={cn("size-5 shrink-0 text-ink-3 transition-transform duration-300", extrasOpen && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {extrasOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <div className="space-y-6 border-t border-ink/8 p-5 sm:p-8">
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { v: "recojo", label: "Recojo", text: "Lo recoges tú", Icon: Home },
                      { v: "delivery", label: "Delivery", text: "Lo coordinamos", Icon: Truck },
                    ] as const).map(({ v, label, text, Icon }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setDeliveryType(v)}
                        className={cn("flex items-center gap-3 rounded-2xl p-4 text-left transition", deliveryType === v ? "bg-ink text-cream shadow-lift" : "bg-white ring-1 ring-ink/10 hover:ring-ink/30")}
                      >
                        <Icon className="size-5 shrink-0" />
                        <span>
                          <span className="block font-semibold">{label}</span>
                          <span className={cn("text-xs", deliveryType === v ? "text-cream/70" : "text-ink-3")}>{text}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  {deliveryType === "delivery" && (
                    <div>
                      <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
                        <label className="block" id="f-district">
                          <Label>Distrito</Label>
                          <input value={district} onChange={(e) => setDistrict(e.target.value.slice(0, 80))} className={cn("field", errors.district && "border-pink")} placeholder="Ej: San Vicente" />
                        </label>
                        <label className="block">
                          <Label optional>Dirección o referencia</Label>
                          <input value={address} onChange={(e) => setAddress(e.target.value.slice(0, 200))} className="field" placeholder="Calle, número, referencia" />
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-ink-3">El costo y la hora del delivery se confirman por WhatsApp.</p>
                    </div>
                  )}
                  <div>
                    <Label>Horario</Label>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map((t) => (
                        <button key={t} type="button" onClick={() => setTimeSlot(t)} className={cn("rounded-full px-3.5 py-2 text-sm font-medium transition", timeSlot === t ? "bg-ink text-cream" : "bg-white ring-1 ring-ink/10 hover:ring-ink/30")}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="block">
                    <Label optional>¿Para quién es?</Label>
                    <input value={recipient} onChange={(e) => setRecipient(e.target.value.slice(0, 80))} className="field" placeholder="Ej: Para mi amor, Luis" />
                  </label>
                  <label className="block">
                    <Label optional>Dedicatoria para la tarjeta</Label>
                    <textarea value={dedication} onChange={(e) => setDedication(e.target.value.slice(0, 400))} rows={3} className="field resize-none font-hand text-xl leading-snug" placeholder="Escribe aquí tu mensaje…" />
                    <span className="mt-1 block text-right text-xs text-ink-3">{dedication.length}/400</span>
                  </label>
                  {useItems && (
                    <label className="block">
                      <Label optional>¿Algo más que debamos saber?</Label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 800))} rows={2} className="field resize-none" placeholder="Colores, estilo, detalles extra…" />
                    </label>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Resumen (escritorio) */}
      <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-cream shadow-lift">
          <Sparkle className="absolute right-6 top-6 size-5 animate-twinkle" />
          <Heart className="absolute bottom-24 right-8 size-4 animate-float opacity-70" />
          <p className="eyebrow text-pink-soft">Resumen</p>
          <h3 className="mt-2 font-display text-3xl">{isCustom ? "Pedido personalizado" : "Tu pedido"}</h3>
          <dl className="mt-6 space-y-3 text-sm">
            {useItems && (
              <div className="flex justify-between gap-4">
                <dt className="text-cream/60">Productos</dt>
                <dd>{cart.count}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-cream/60">Fecha</dt>
              <dd className="text-right">{date ? ucfirst(formatLong(date)) : "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cream/60">Ocasión</dt>
              <dd>{getOccasion(occasion)?.name ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cream/60">Entrega</dt>
              <dd>{deliveryType === "delivery" ? `Delivery${district ? ` · ${district}` : ""}` : "Recojo"}</dd>
            </div>
          </dl>
          <div className="my-6 h-px bg-white/10" />
          <div className="flex items-baseline justify-between">
            <span className="text-cream/60">{isCustom ? "Precio" : "Subtotal"}</span>
            <span className="font-display text-3xl font-semibold tabular-nums">{isCustom ? "A cotizar" : formatPrice(subtotal)}</span>
          </div>
          {useItems && hasQuote && <p className="mt-1 text-right text-xs text-cream/50">+ productos a cotizar</p>}
          <Button type="submit" variant="pink" size="lg" className="mt-7 w-full" disabled={submitting}>
            {submitting ? <Loader className="size-4 animate-spin" /> : <WhatsAppIcon size={18} />}
            {submitLabel}
          </Button>
          <p className="mt-4 text-center text-xs leading-relaxed text-cream/50">
            Te damos un código y se abre WhatsApp con tu pedido listo. El pago se coordina por ahí.
          </p>
        </div>
      </aside>

      {/* Barra fija (celular): el botón siempre a la mano */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-3">{date ? ucfirst(formatShort(date)) : "Elige una fecha"}</p>
            <p className="font-display text-lg font-semibold leading-tight tabular-nums">{isCustom ? "A cotizar" : formatPrice(subtotal)}</p>
          </div>
          <Button type="submit" variant="pink" className="ml-auto h-12 flex-1" disabled={submitting}>
            {submitting ? <Loader className="size-4 animate-spin" /> : <WhatsAppIcon size={17} />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Success({ done }: { done: Done }) {
  const { whatsapp, yape_number, yape_qr_url, deposit_percent } = useSite();
  const [copied, setCopied] = useState(false);
  const hasYape = Boolean(yape_number || yape_qr_url);
  const amount = done.hasQuote ? null : depositFor(done.subtotal, deposit_percent);
  const url = waLink(done.message, whatsapp);
  const paidUrl = waLink(`${done.message}

${paymentProofLine(amount)}`, whatsapp);
  const caption = done.hasQuote
    ? "Primero te confirmamos el precio por WhatsApp."
    : deposit_percent < 100
      ? `${deposit_percent}% de adelanto para separar · Total ${formatPrice(done.subtotal)}`
      : "Pago total del pedido";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] bg-white p-8 text-center shadow-lift ring-1 ring-ink/5 sm:p-14"
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-24"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: Math.cos((i / 14) * Math.PI * 2) * 220, y: Math.sin((i / 14) * Math.PI * 2) * 140, opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
        >
          <Heart className="size-4" color={["#ec4f8f", "#17a8a0", "#b49be3", "#f6c744"][i % 4]} />
        </motion.span>
      ))}
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10, delay: 0.1 }}
        className="mx-auto grid size-20 place-items-center rounded-full bg-teal text-white shadow-lift"
      >
        <Check className="size-9" strokeWidth={3} />
      </motion.span>
      <h2 className="mt-7 font-display text-4xl font-medium sm:text-5xl">
        {done.saved ? <>¡Pedido <em className="text-pink italic">separado!</em></> : <>¡Ya casi <em className="text-pink italic">está!</em></>}
      </h2>
      {done.code && (
        <div className="mx-auto mt-6 max-w-md">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-paper px-5 py-3 shadow-soft ring-1 ring-ink/5">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">Código</span>
            <span className="font-display text-2xl font-semibold tracking-wider">{done.code}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(done.code!).then(() => {
                  setCopied(true);
                  toast.success("Código copiado al portapapeles");
                  setTimeout(() => setCopied(false), 2000);
                }, () => {});
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-soft ring-1 ring-ink/10 transition hover:bg-paper"
              aria-label="Copiar código"
            >
              {copied ? <Check className="size-3.5 text-teal" /> : <Copy className="size-3.5" />}
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-3">
            Guardado en este navegador. También podrás revisarlo en <strong className="text-ink">Mi pedido</strong> con tu celular.
          </p>
        </div>
      )}
      {hasYape && !done.hasQuote ? (
        <>
          <p className="mx-auto mt-6 max-w-md leading-relaxed text-ink-3">
            Último paso: paga con Yape para asegurar tu fecha y envíanos el comprobante por WhatsApp.
          </p>
          <YapePayCard amount={amount} caption={caption} className="mx-auto mt-6 max-w-lg" />
          <a href={paidUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("wa", "lg", "mt-6 w-full sm:w-auto")}>
            <WhatsAppIcon size={20} /> Ya pagué · Enviar comprobante <ArrowRight className="size-4" />
          </a>
          <div className="mt-3">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-ink-3 underline underline-offset-4 hover:text-ink">
              Prefiero coordinar el pago por WhatsApp
            </a>
          </div>
        </>
      ) : (
        <>
          <p className="mx-auto mt-6 max-w-md leading-relaxed text-ink-3">
            {done.hasQuote
              ? "Último paso: envíanos tu pedido por WhatsApp. Te confirmamos el precio y cómo pagar."
              : "Último paso: envíanos tu pedido por WhatsApp para confirmarlo y coordinar el pago y la entrega."}
          </p>
          <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass("wa", "lg", "mt-8 w-full sm:w-auto")}>
            <WhatsAppIcon size={20} /> Enviar por WhatsApp <ArrowRight className="size-4" />
          </a>
        </>
      )}
      <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-6">
        {done.code && (
          <Link href={`/seguimiento?codigo=${done.code}`} className="font-semibold text-ink underline decoration-pink decoration-2 underline-offset-4">
            Ver estado de mi pedido
          </Link>
        )}
        <Link href="/mis-fechas" className="font-semibold text-ink-3 hover:text-ink">
          Guardar mis fechas importantes
        </Link>
      </div>
    </motion.div>
  );
}
