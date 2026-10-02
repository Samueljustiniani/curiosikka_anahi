"use client";

import Link from "next/link";
import { ArrowRight, CalendarHeart } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { addDays, diffDays, formatLong, formatShort, limaToday, nextMonthDay, relativeDays, ucfirst } from "@/lib/dates";
import { upcomingOccasions } from "@/lib/occasions";
import type { Order, Reminder } from "@/lib/types";
import { formatPhone, formatPrice } from "@/lib/utils";
import { reminderMessage, statusMessage } from "@/lib/whatsapp";
import { AdminHeader, Card } from "@/components/admin/admin-shell";
import { EmptyBlock, LoadingBlock, Stat, StatusBadge, WaButton } from "@/components/admin/ui";
import { Countdown } from "@/components/ui/countdown";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { useCached } from "@/components/admin/use-cached";
import { QuickReplyCard } from "@/components/admin/quick-reply";
import { REMINDER_DAYS_BEFORE, contactedForNext } from "@/lib/reminders";

type Data = {
  pending: number;
  customers: number;
  upcoming: Order[];
  reminders: (Reminder & { next: string; days: number; customer_name: string | null })[];
};

export default function DashboardPage() {
  const today = limaToday();
  const next = upcomingOccasions(today)[0];

  const { data, setData } = useCached<Data>(`admin:dashboard:${today}`, async () => {
    const sb = getSupabaseBrowser();
    const [pending, customers, upcoming, reminders, names] = await Promise.all([
      sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "pendiente"),
      sb.from("customers").select("id", { count: "exact", head: true }),
      sb
        .from("orders")
        .select("*")
        .gte("delivery_date", today)
        .not("status", "in", "(cancelado,entregado)")
        .order("delivery_date")
        .limit(30),
      sb.from("reminders").select("*"),
      sb.from("customers").select("phone,name"),
    ]);
    const nameByPhone = new Map((names.data ?? []).map((c) => [c.phone as string, c.name as string | null]));
    const rem = ((reminders.data ?? []) as Reminder[])
      .map((r) => {
        const n = nextMonthDay(r.month, r.day, today);
        return { ...r, next: n, days: diffDays(today, n), customer_name: nameByPhone.get(r.phone) ?? null };
      })
      .filter((r) => r.days <= REMINDER_DAYS_BEFORE && !contactedForNext(r.last_contacted_at, r.next))
      .sort((a, b) => a.days - b.days);
    return {
      pending: pending.count ?? 0,
      customers: customers.count ?? 0,
      upcoming: (upcoming.data ?? []) as Order[],
      reminders: rem,
    };
  });

  if (!data) return <LoadingBlock />;

  const todayCount = data.upcoming.filter((o) => o.delivery_date === today).length;
  const weekCount = data.upcoming.filter((o) => o.delivery_date <= addDays(today, 7)).length;
  const nextDateOrders = data.upcoming.filter((o) => o.delivery_date === next.date).length;

  return (
    <>
      <AdminHeader title="Resumen" description={`Hoy es ${formatLong(today, true)}.`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Por confirmar" value={data.pending} hint="Pedidos pendientes" tone="bg-butter-soft" />
        <Stat label="Entregas hoy" value={todayCount} />
        <Stat label="Próximos 7 días" value={weekCount} hint="Entregas activas" />
        <Stat label="Clientes" value={data.customers} hint="Números únicos" tone="bg-lilac-soft" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl">Próximas entregas</h2>
            <Link href="/admin/pedidos" className="inline-flex items-center gap-1 text-sm font-semibold text-pink-deep">
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <EmptyBlock title="Sin entregas próximas" text="Cuando alguien separe un pedido aparecerá aquí." />
          ) : (
            <ul className="divide-y divide-ink/8">
              {data.upcoming.slice(0, 10).map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <span className="grid w-14 shrink-0 place-items-center rounded-xl bg-paper py-1.5 text-center leading-tight">
                    <span className="font-display text-lg font-semibold">{o.delivery_date.slice(8)}</span>
                    <span className="text-[0.6rem] font-bold uppercase text-ink-3">{formatShort(o.delivery_date).split(" ")[1]}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/pedidos?codigo=${o.code}`} className="font-semibold hover:text-pink-deep">
                      {o.code} · {o.customer_name}
                    </Link>
                    <p className="truncate text-sm text-ink-3">
                      {o.items.length ? o.items.map((i) => `${i.qty}× ${i.name}`).join(", ") : "Pedido personalizado"}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                  <WaButton phone={o.phone} text={statusMessage(o)} label="" className="w-9 justify-center px-0" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden p-0 sm:p-0">
            <div className="p-6" style={{ background: `linear-gradient(150deg, ${next.occasion.palette.from}, ${next.occasion.palette.to})`, color: next.occasion.palette.ink }}>
              <p className="eyebrow flex items-center gap-2 opacity-75">
                <CalendarHeart className="size-3.5" /> Próxima fecha especial
              </p>
              <div className="mt-3 flex items-center gap-3">
                <OccasionIcon icon={next.occasion.icon} className="size-6" style={{ color: next.occasion.palette.accent }} />
                <p className="font-display text-3xl">{next.occasion.name}</p>
              </div>
              <p className="mt-1 text-sm opacity-75">
                {ucfirst(formatLong(next.date))} · {relativeDays(next.days)}
              </p>
              <Countdown date={next.date} compact className="mt-4" />
              <p className="mt-4 text-sm font-semibold">{nextDateOrders} pedido{nextDateOrders === 1 ? "" : "s"} para ese día</p>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl">Por escribir</h2>
              <Link href="/admin/recordatorios" className="text-sm font-semibold text-pink-deep">
                Ver todos
              </Link>
            </div>
            {data.reminders.length === 0 ? (
              <p className="text-sm text-ink-3">Estás al día: no hay clientes por escribir esta semana. 💚</p>
            ) : (
              <ul className="space-y-3">
                {data.reminders.slice(0, 6).map((r) => (
                  <li key={r.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {r.label}
                        {r.person_name && ` · ${r.person_name}`}
                      </p>
                      <p className="text-xs text-ink-3">
                        {r.customer_name ?? formatPhone(r.phone)} · {formatShort(r.next)} ({relativeDays(r.days).toLowerCase()})
                      </p>
                    </div>
                    <span
                      onClick={() => {
                        // Al escribirle queda marcado y sale de la lista
                        getSupabaseBrowser().from("reminders").update({ last_contacted_at: new Date().toISOString() }).eq("id", r.id).then(() => {});
                        setData((prev) => (prev ? { ...prev, reminders: prev.reminders.filter((x) => x.id !== r.id) } : prev!));
                      }}
                    >
                      <WaButton phone={r.phone} text={reminderMessage(r, r.customer_name, formatLong(r.next))} label="Escribir" />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <p className="text-sm text-ink-3">Ventas estimadas (próximas entregas)</p>
            <p className="mt-1 font-display text-3xl font-semibold">
              {formatPrice(data.upcoming.filter((o) => o.status !== "pendiente").reduce((s, o) => s + Number(o.subtotal), 0))}
            </p>
            <p className="mt-1 text-xs text-ink-3">Suma de pedidos confirmados en adelante (sin productos a cotizar).</p>
            <p className="mt-4 text-sm text-ink-3">Cobrado de esas entregas</p>
            <p className="mt-1 font-display text-2xl font-semibold text-teal-deep">
              {formatPrice(data.upcoming.reduce((s, o) => s + Number(o.paid_amount ?? 0), 0))}
            </p>
          </Card>

          <QuickReplyCard />
        </div>
      </div>
    </>
  );
}
