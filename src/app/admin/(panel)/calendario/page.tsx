"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, ChevronLeft, ChevronRight, Loader, Unlock } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { MONTHS, WEEKDAYS_SHORT, daysInMonth, formatLong, limaToday, monthMatrix, parseISO, toISO, type ISODate, ucfirst } from "@/lib/dates";
import { occasionsByDate } from "@/lib/occasions";
import type { CalendarBlock, Order } from "@/lib/types";
import { cn, errorMessage } from "@/lib/utils";
import { statusMessage } from "@/lib/whatsapp";
import { AdminHeader, Card } from "@/components/admin/admin-shell";
import { StatusBadge, WaButton } from "@/components/admin/ui";
import { useSiteSettingsCapacity } from "@/components/admin/use-capacity";

export default function AdminCalendarPage() {
  const today = limaToday();
  const t = parseISO(today);
  const [cursor, setCursor] = useState({ y: t.y, m: t.m });
  const [orders, setOrders] = useState<Order[]>([]);
  const [blocks, setBlocks] = useState<Record<string, CalendarBlock>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ISODate>(today);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const capacity = useSiteSettingsCapacity();

  const load = useCallback(async () => {
    setLoading(true);
    const sb = getSupabaseBrowser();
    const from = toISO(cursor.y, cursor.m, 1);
    const to = toISO(cursor.y, cursor.m, daysInMonth(cursor.y, cursor.m));
    const [o, b] = await Promise.all([
      sb.from("orders").select("*").gte("delivery_date", from).lte("delivery_date", to).order("delivery_date"),
      sb.from("calendar_blocks").select("*").gte("date", from).lte("date", to),
    ]);
    if (o.error) toast.error(errorMessage(o.error));
    setOrders((o.data ?? []) as Order[]);
    setBlocks(Object.fromEntries(((b.data ?? []) as CalendarBlock[]).map((x) => [x.date, x])));
    setLoading(false);
  }, [cursor]);

  useEffect(() => {
    load();
  }, [load]);

  const byDay = useMemo(() => {
    const map: Record<string, Order[]> = {};
    orders.forEach((o) => (map[o.delivery_date] ||= []).push(o));
    return map;
  }, [orders]);

  const specials = useMemo(() => occasionsByDate(cursor.y), [cursor.y]);
  const weeks = monthMatrix(cursor.y, cursor.m);
  const move = (d: number) =>
    setCursor(({ y, m }) => {
      const n = m + d;
      return n < 1 ? { y: y - 1, m: 12 } : n > 12 ? { y: y + 1, m: 1 } : { y, m: n };
    });

  const dayOrders = byDay[selected] ?? [];
  const block = blocks[selected];

  const toggleBlock = async () => {
    setBusy(true);
    const sb = getSupabaseBrowser();
    const { error } = block
      ? await sb.from("calendar_blocks").delete().eq("date", selected)
      : await sb.from("calendar_blocks").insert({ date: selected, reason: reason.trim() || null });
    setBusy(false);
    if (error) return toast.error(errorMessage(error));
    toast.success(block ? "Día habilitado" : "Día cerrado para separaciones");
    setReason("");
    load();
  };

  return (
    <>
      <AdminHeader
        title="Calendario"
        description={`Pedidos por día de entrega. ${capacity ? `Capacidad diaria: ${capacity} pedidos.` : "Sin límite diario (configúralo en Ajustes)."}`}
      />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => move(-1)} className="grid size-10 place-items-center rounded-full bg-paper" aria-label="Mes anterior">
              <ChevronLeft className="size-4" />
            </button>
            <p className="flex items-center gap-2 font-display text-2xl capitalize">
              {MONTHS[cursor.m - 1]} {cursor.y} {loading && <Loader className="size-4 animate-spin text-ink-3" />}
            </p>
            <button type="button" onClick={() => move(1)} className="grid size-10 place-items-center rounded-full bg-paper" aria-label="Mes siguiente">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1.5 pb-2 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-3">
            {WEEKDAYS_SHORT.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid gap-1.5">
            {weeks.map((w, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1.5">
                {w.map((iso, di) => {
                  if (!iso) return <span key={di} />;
                  const list = (byDay[iso] ?? []).filter((o) => o.status !== "cancelado");
                  const special = specials[iso]?.[0];
                  const isBlocked = !!blocks[iso];
                  const full = capacity !== null && list.length >= capacity;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setSelected(iso)}
                      className={cn(
                        "relative flex min-h-[4.5rem] flex-col items-start rounded-xl p-2 text-left ring-1 transition sm:min-h-[5.5rem]",
                        selected === iso ? "bg-ink text-cream ring-ink" : isBlocked ? "bg-shell ring-ink/5" : "bg-paper/40 ring-ink/5 hover:ring-ink/20",
                        iso < today && selected !== iso && "opacity-50"
                      )}
                      style={special && selected !== iso ? { background: special.palette.from } : undefined}
                    >
                      <span className={cn("font-display text-sm font-semibold", iso === today && "rounded-full bg-pink px-1.5 text-white")}>
                        {parseISO(iso).d}
                      </span>
                      {special && <span className="mt-0.5 hidden truncate text-[0.6rem] font-semibold sm:block" style={{ color: selected === iso ? undefined : special.palette.accent }}>{special.name}</span>}
                      {list.length > 0 && (
                        <span className={cn("mt-auto rounded-full px-2 py-0.5 text-[0.65rem] font-bold", selected === iso ? "bg-white/20" : full ? "bg-pink text-white" : "bg-teal text-white")}>
                          {list.length}
                          {capacity ? `/${capacity}` : ""}
                        </span>
                      )}
                      {isBlocked && <Ban className="absolute right-1.5 top-1.5 size-3.5 text-ink-3" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:sticky xl:top-8 xl:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3">{selected === today ? "Hoy" : "Día seleccionado"}</p>
          <h2 className="mt-1 font-display text-2xl">{ucfirst(formatLong(selected, true))}</h2>
          {specials[selected]?.map((o) => (
            <p key={o.slug} className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: o.palette.from, color: o.palette.ink }}>
              {o.name}
            </p>
          ))}

          <div className="mt-5 space-y-2">
            {dayOrders.length === 0 ? (
              <p className="text-sm text-ink-3">Sin pedidos para este día.</p>
            ) : (
              dayOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-2xl bg-paper/60 p-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/pedidos?codigo=${o.code}`} className="text-sm font-semibold hover:text-pink-deep">
                      {o.code} · {o.customer_name}
                    </Link>
                    <p className="truncate text-xs text-ink-3">{o.items.length ? o.items.map((i) => `${i.qty}× ${i.name}`).join(", ") : "Personalizado"}</p>
                  </div>
                  <StatusBadge status={o.status} />
                  <WaButton phone={o.phone} text={statusMessage(o)} label="" className="w-9 justify-center px-0" />
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-ink/8 pt-5">
            {block ? (
              <p className="mb-3 text-sm">
                <strong>Día cerrado.</strong> {block.reason && <span className="text-ink-3">Motivo: {block.reason}</span>}
              </p>
            ) : (
              <input value={reason} onChange={(e) => setReason(e.target.value)} className="field mb-3" placeholder="Motivo (opcional): feriado, agenda llena…" />
            )}
            <button
              type="button"
              onClick={toggleBlock}
              disabled={busy || selected < today}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition disabled:opacity-40",
                block ? "bg-teal text-white" : "bg-ink text-cream"
              )}
            >
              {busy ? <Loader className="size-4 animate-spin" /> : block ? <Unlock className="size-4" /> : <Ban className="size-4" />}
              {block ? "Volver a abrir este día" : "Cerrar este día para separaciones"}
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
