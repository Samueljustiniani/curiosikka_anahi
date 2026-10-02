"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Gift, Home, Loader, MapPin, Phone, Trash2, Truck, User, X } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { ORDER_STATUSES, type Order, type OrderItem, type OrderStatus } from "@/lib/types";
import { formatLong } from "@/lib/dates";
import { getOccasion } from "@/lib/occasions";
import { cn, errorMessage, formatPhone, formatPrice } from "@/lib/utils";
import { paymentReceivedMessage, priceQuoteMessage, statusMessage } from "@/lib/whatsapp";
import { PAYMENT_LABEL, depositFor, paymentState, round2, totalsFromItems } from "@/lib/payments";
import { useAdminSettings } from "./use-admin-settings";
import { StatusBadge, WaButton } from "./ui";

export function OrderDrawer({
  order,
  onClose,
  onChange,
  onDelete,
}: {
  order: Order | null;
  onClose: () => void;
  onChange: (o: Order) => void;
  onDelete: (id: string) => void;
}) {
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => setAdminNotes(order?.admin_notes ?? ""), [order]);

  const patch = async (values: Partial<Order>, key: string) => {
    if (!order) return;
    setSaving(key);
    const { data, error } = await getSupabaseBrowser().from("orders").update(values).eq("id", order.id).select().single();
    setSaving(null);
    if (error) return toast.error(errorMessage(error));
    onChange(data as Order);
    toast.success("Pedido actualizado");
  };

  const remove = async () => {
    if (!order || !window.confirm(`¿Eliminar el pedido ${order.code}? Esta acción no se puede deshacer.`)) return;
    const { error } = await getSupabaseBrowser().from("orders").delete().eq("id", order.id);
    if (error) return toast.error(errorMessage(error));
    onDelete(order.id);
    toast.success("Pedido eliminado");
  };

  return (
    <AnimatePresence>
      {order && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto bg-cream shadow-lift"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/8 bg-cream/90 px-6 py-4 backdrop-blur">
              <div>
                <p className="font-display text-2xl font-semibold tracking-wide">{order.code}</p>
                <p className="text-xs text-ink-3">Creado el {new Date(order.created_at).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-white shadow-soft" aria-label="Cerrar">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Estado</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      disabled={saving !== null}
                      onClick={() => order.status !== s.value && patch({ status: s.value as OrderStatus }, "status")}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition",
                        order.status === s.value ? s.tone + " ring-2" : "bg-white text-ink-3 ring-ink/10 hover:ring-ink/30"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                  {saving === "status" && <Loader className="size-4 animate-spin self-center" />}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-ink/5">
                  <p className="flex-1 text-xs text-ink-3">Avisar al cliente del estado actual:</p>
                  <WaButton phone={order.phone} text={statusMessage(order)} label={`Enviar "${ORDER_STATUSES.find((s) => s.value === order.status)?.label}"`} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Info icon={<User className="size-4" />} label="Cliente" value={order.customer_name} />
                <Info icon={<Phone className="size-4" />} label="Celular" value={formatPhone(order.phone)} />
                <Info icon={<CalendarDays className="size-4" />} label="Entrega" value={`${formatLong(order.delivery_date, true)}${order.time_slot ? ` · ${order.time_slot}` : ""}`} />
                <Info
                  icon={order.delivery_type === "delivery" ? <Truck className="size-4" /> : <Home className="size-4" />}
                  label="Modalidad"
                  value={order.delivery_type === "delivery" ? `Delivery${order.district ? ` · ${order.district}` : ""}` : "Recojo"}
                />
                {order.address && <Info icon={<MapPin className="size-4" />} label="Dirección" value={order.address} wide />}
                {order.occasion && <Info icon={<Gift className="size-4" />} label="Ocasión" value={getOccasion(order.occasion)?.name ?? order.occasion} />}
                {order.recipient_name && <Info icon={<Gift className="size-4" />} label="Para" value={order.recipient_name} />}
              </div>

              {order.dedication && (
                <div className="rounded-2xl bg-blush/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-deep">Dedicatoria</p>
                  <p className="mt-2 whitespace-pre-line font-hand text-2xl leading-snug">{order.dedication}</p>
                </div>
              )}
              {order.notes && (
                <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Notas del cliente</p>
                  <p className="mt-2 whitespace-pre-line text-sm">{order.notes}</p>
                </div>
              )}

              <PriceEditor order={order} saving={saving === "prices"} onSave={(values) => patch(values, "prices")} />

              <PaymentBox order={order} saving={saving === "payment"} onSave={(paid) => patch({ paid_amount: paid }, "payment")} />

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Notas internas</span>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="field resize-none" placeholder="Adelanto recibido, detalles acordados…" />
                <button
                  type="button"
                  onClick={() => patch({ admin_notes: adminNotes.trim() || null }, "notes")}
                  disabled={saving !== null || adminNotes === (order.admin_notes ?? "")}
                  className="mt-2 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-cream disabled:opacity-40"
                >
                  {saving === "notes" && <Loader className="size-4 animate-spin" />} Guardar notas
                </button>
              </label>

              <div className="flex items-center justify-between border-t border-ink/8 pt-5">
                <StatusBadge status={order.status} />
                <button type="button" onClick={remove} className="inline-flex items-center gap-2 text-sm font-semibold text-pink-deep hover:underline">
                  <Trash2 className="size-4" /> Eliminar pedido
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Info({ icon, label, value, wide }: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-ink/5", wide && "sm:col-span-2")}>
      <span className="mt-0.5 text-pink">{icon}</span>
      <span className="min-w-0 text-sm">
        <span className="block text-xs text-ink-3">{label}</span>
        <span className="font-semibold first-letter:uppercase">{value}</span>
      </span>
    </div>
  );
}

const CUSTOM_ITEM: OrderItem = { product_id: "", slug: "", name: "Pedido personalizado", price: null, qty: 1, image: null, note: "" };

/** Productos del pedido con precio editable (para los "a cotizar" o ajustes) */
function PriceEditor({ order, saving, onSave }: { order: Order; saving: boolean; onSave: (v: Partial<Order>) => void }) {
  const base = order.items.length ? order.items : [CUSTOM_ITEM];
  const [prices, setPrices] = useState<string[]>([]);

  useEffect(() => {
    setPrices((order.items.length ? order.items : [CUSTOM_ITEM]).map((i) => (i.price === null ? "" : String(i.price))));
  }, [order]);

  const parsed = base.map((it, i) => {
    const raw = (prices[i] ?? "").replace(",", ".").trim();
    const n = raw === "" ? null : Number(raw);
    return { ...it, price: n === null || Number.isNaN(n) || n < 0 ? null : round2(n) };
  });
  const { subtotal, hasQuote } = totalsFromItems(parsed);
  const changed = prices.length === base.length && parsed.some((it, i) => it.price !== (base[i].price ?? null));

  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink/5">
      <div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Productos y precios</p>
        {order.has_quote_items && (
          <span className="rounded-full bg-butter-soft px-2.5 py-0.5 text-[0.68rem] font-bold text-[#7a5600]">Falta cotizar</span>
        )}
      </div>
      <ul className="divide-y divide-ink/8">
        {base.map((it, i) => (
          <li key={i} className="flex items-center gap-3 p-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-paper">
              {it.image && <Image src={it.image} alt="" fill sizes="48px" className="object-cover" />}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="font-semibold">
                {it.qty} × {it.name}
              </span>
              {it.note && <span className="block text-xs text-ink-3">✎ {it.note}</span>}
              {!order.items.length && <span className="block text-xs text-ink-3">Pon el precio que acordaste por WhatsApp.</span>}
            </span>
            <label className="flex shrink-0 items-center gap-1 rounded-xl bg-paper/70 px-2.5 ring-1 ring-ink/10 focus-within:ring-pink">
              <span className="text-xs font-semibold text-ink-3">S/</span>
              <input
                value={prices[i] ?? ""}
                onChange={(e) => setPrices((p) => p.map((v, j) => (j === i ? e.target.value.replace(/[^\d.,]/g, "").slice(0, 9) : v)))}
                inputMode="decimal"
                placeholder="Precio"
                className="w-20 bg-transparent py-2 text-right text-sm font-semibold focus:outline-none"
                aria-label={`Precio unitario de ${it.name}`}
              />
            </label>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 px-4 py-3">
        <span className="font-semibold">
          Total {formatPrice(subtotal)}
          {hasQuote && <span className="ml-1 text-xs font-normal text-ink-3">+ a cotizar</span>}
        </span>
        <button
          type="button"
          disabled={!changed || saving}
          onClick={() => onSave({ items: parsed, subtotal, has_quote_items: hasQuote })}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-cream disabled:opacity-40"
        >
          {saving && <Loader className="size-4 animate-spin" />} Guardar precios
        </button>
      </div>
    </div>
  );
}

/** Lo que pagó el cliente + mensajes de WhatsApp listos */
function PaymentBox({ order, saving, onSave }: { order: Order; saving: boolean; onSave: (paid: number) => void }) {
  const settings = useAdminSettings();
  const total = Number(order.subtotal) || 0;
  const paid = Number(order.paid_amount ?? 0);
  const pending = Math.max(0, round2(total - paid));
  const deposit = depositFor(total, settings.deposit_percent);
  const state = paymentState(total, paid, order.has_quote_items);
  const [custom, setCustom] = useState("");

  useEffect(() => setCustom(""), [order]);

  const msgOrder = { ...order, subtotal: total, paid_amount: paid };
  const customValue = Number(custom.replace(",", "."));

  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink/5">
      <div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Pago</p>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold ring-1", PAYMENT_LABEL[state].tone)}>{PAYMENT_LABEL[state].label}</span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-ink/8 text-center">
        {[
          ["Total", order.has_quote_items ? "A cotizar" : formatPrice(total)],
          ["Pagado", formatPrice(paid)],
          ["Falta", order.has_quote_items ? "—" : formatPrice(pending)],
        ].map(([label, value]) => (
          <div key={label} className="px-2 py-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-3">{label}</p>
            <p className="mt-1 font-display text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t border-ink/8 p-4">
        <div className="flex flex-wrap gap-2">
          {deposit !== null && settings.deposit_percent < 100 && (
            <button
              type="button"
              disabled={saving}
              onClick={() => onSave(deposit)}
              className="rounded-full bg-butter-soft px-3.5 py-2 text-xs font-semibold text-[#7a5600] ring-1 ring-butter/40 disabled:opacity-50"
            >
              Recibí el adelanto ({formatPrice(deposit)})
            </button>
          )}
          {total > 0 && (
            <button
              type="button"
              disabled={saving}
              onClick={() => onSave(total)}
              className="rounded-full bg-teal-soft px-3.5 py-2 text-xs font-semibold text-teal-deep ring-1 ring-teal/30 disabled:opacity-50"
            >
              Pagado completo ({formatPrice(total)})
            </button>
          )}
          {paid > 0 && (
            <button type="button" disabled={saving} onClick={() => onSave(0)} className="rounded-full px-3 py-2 text-xs font-semibold text-ink-3 ring-1 ring-ink/10 disabled:opacity-50">
              Poner en 0
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <label className="flex flex-1 items-center gap-1 rounded-xl bg-paper/70 px-3 ring-1 ring-ink/10 focus-within:ring-pink">
            <span className="text-xs font-semibold text-ink-3">S/</span>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^\d.,]/g, "").slice(0, 9))}
              inputMode="decimal"
              placeholder="Otro monto (total pagado)"
              className="w-full bg-transparent py-2 text-sm focus:outline-none"
            />
          </label>
          <button
            type="button"
            disabled={saving || custom.trim() === "" || Number.isNaN(customValue) || customValue < 0}
            onClick={() => onSave(round2(customValue))}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-cream disabled:opacity-40"
          >
            {saving && <Loader className="size-4 animate-spin" />} Guardar
          </button>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {!order.has_quote_items && total > 0 && (
            <WaButton phone={order.phone} text={priceQuoteMessage(msgOrder, settings)} label="Enviar precio y Yape" />
          )}
          {paid > 0 && <WaButton phone={order.phone} text={paymentReceivedMessage(msgOrder)} label="Confirmar pago recibido" />}
        </div>
        {order.has_quote_items && (
          <p className="text-xs text-ink-3">Primero pon el precio arriba y guarda: luego podrás enviarle el monto por WhatsApp.</p>
        )}
      </div>
    </div>
  );
}
