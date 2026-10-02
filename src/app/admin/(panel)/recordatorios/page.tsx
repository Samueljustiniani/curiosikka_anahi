"use client";

import { useMemo, useState } from "react";
import { Check, Megaphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Customer, Reminder } from "@/lib/types";
import { diffDays, formatLong, limaToday, nextMonthDay, relativeDays, ucfirst } from "@/lib/dates";
import { upcomingOccasions } from "@/lib/occasions";
import { cn, errorMessage, formatPhone } from "@/lib/utils";
import { reminderMessage } from "@/lib/whatsapp";
import { BRAND } from "@/lib/config";
import { REMINDER_DAYS_BEFORE, contactedForNext } from "@/lib/reminders";
import { AdminHeader, Card } from "@/components/admin/admin-shell";
import { EmptyBlock, LoadingBlock, WaButton } from "@/components/admin/ui";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { useCached } from "@/components/admin/use-cached";

type Item = Reminder & { next: string; days: number; customer_name: string | null };
type Window = 7 | 15 | 30 | 366;

export default function RecordatoriosPage() {
  const today = limaToday();
  const { data, setData } = useCached(`admin:reminders:${today}`, async () => {
    const sb = getSupabaseBrowser();
    const [r, c] = await Promise.all([sb.from("reminders").select("*"), sb.from("customers").select("*").order("name")]);
    if (r.error) toast.error(errorMessage(r.error));
    const cs = (c.data ?? []) as Customer[];
    const names = new Map(cs.map((x) => [x.phone, x.name]));
    const list: Item[] = ((r.data ?? []) as Reminder[])
      .map((x) => {
        const next = nextMonthDay(x.month, x.day, today);
        return { ...x, next, days: diffDays(today, next), customer_name: names.get(x.phone) ?? null };
      })
      .sort((a, b) => a.days - b.days);
    return { items: list, customers: cs };
  });
  const items = data?.items ?? null;
  const customers = data?.customers ?? [];
  const setItems = (fn: (list: Item[] | null) => Item[]) =>
    setData((prev) => ({ customers: prev?.customers ?? [], items: fn(prev?.items ?? null) }));
  const [win, setWin] = useState<Window>(REMINDER_DAYS_BEFORE);
  const [tab, setTab] = useState<"clientes" | "campana">("clientes");
  const [contacted, setContacted] = useState<Set<string>>(new Set());
  const nextOcc = upcomingOccasions(today)[0];

  const visible = useMemo(() => (items ?? []).filter((i) => i.days <= win), [items, win]);

  const markContacted = async (it: Item) => {
    const { error } = await getSupabaseBrowser().from("reminders").update({ last_contacted_at: new Date().toISOString() }).eq("id", it.id);
    if (error) return toast.error(errorMessage(error));
    setItems((list) => (list ?? []).map((x) => (x.id === it.id ? { ...x, last_contacted_at: new Date().toISOString() } : x)));
  };

  const remove = async (it: Item) => {
    if (!window.confirm("¿Eliminar esta fecha?")) return;
    const { error } = await getSupabaseBrowser().from("reminders").delete().eq("id", it.id);
    if (error) return toast.error(errorMessage(error));
    setItems((list) => (list ?? []).filter((x) => x.id !== it.id));
  };

  const unmark = async (it: Item) => {
    const { error } = await getSupabaseBrowser().from("reminders").update({ last_contacted_at: null }).eq("id", it.id);
    if (error) return toast.error(errorMessage(error));
    setContacted((s) => {
      const n = new Set(s);
      n.delete(it.id);
      return n;
    });
    setItems((list) => (list ?? []).map((x) => (x.id === it.id ? { ...x, last_contacted_at: null } : x)));
  };

  const isDone = (it: Item) => contactedForNext(it.last_contacted_at, it.next) || contacted.has(it.id);
  const pending = visible.filter((it) => !isDone(it));
  const doneList = visible.filter(isDone);

  const renderRow = (it: Item, done: boolean) => (
    <div key={it.id} className={cn("flex flex-wrap items-center gap-3 p-4 sm:px-6", done && "bg-paper/40")}>
      <span
        className={cn(
          "grid w-20 shrink-0 place-items-center rounded-xl py-2 text-center",
          done ? "bg-teal-soft text-teal-deep" : it.days <= 3 ? "bg-pink text-white" : "bg-butter-soft text-[#7a5600]"
        )}
      >
        <span className="text-[0.62rem] font-bold uppercase leading-tight">{relativeDays(it.days)}</span>
      </span>
      <div className={cn("min-w-0 flex-1", done && "opacity-70")}>
        <p className="font-semibold">
          {it.label}
          {it.person_name && <span className="font-normal text-ink-3"> · {it.person_name}</span>}
        </p>
        <p className="text-sm text-ink-3">
          <span>{ucfirst(formatLong(it.next))}</span> · {it.customer_name ?? "Cliente"} ({formatPhone(it.phone)})
        </p>
      </div>
      {done ? (
        <>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-teal-deep">
            <Check className="size-3.5" /> Ya le escribiste
          </span>
          <button type="button" onClick={() => unmark(it)} className="text-xs font-semibold text-ink-3 underline underline-offset-2 hover:text-ink">
            Desmarcar
          </button>
        </>
      ) : (
        <span
          onClick={() => {
            setContacted((s) => new Set(s).add(it.id));
            markContacted(it);
          }}
        >
          <WaButton phone={it.phone} text={reminderMessage(it, it.customer_name, formatLong(it.next))} label="Escribir" />
        </span>
      )}
      <button type="button" onClick={() => remove(it)} className="grid size-9 place-items-center rounded-full text-ink-3 hover:bg-blush hover:text-pink-deep" aria-label="Eliminar">
        <Trash2 className="size-4" />
      </button>
    </div>
  );

  const campaignText = (name: string | null) =>
    `¡Hola${name ? ` ${name.split(" ")[0]}` : ""}! 💝 Se acerca el *${nextOcc.occasion.name}* (${formatLong(nextOcc.date)}). En ${BRAND.name} te ayudamos con un detalle especial. ¿Separamos el tuyo?`;

  return (
    <>
      <AdminHeader title="Recordatorios" description="Fechas que tus clientes guardaron. Escríbeles con 5 a 7 días de anticipación: el mensaje ya va listo y queda marcado al enviarlo." />

      <div className="mb-6 inline-flex rounded-full bg-white p-1 ring-1 ring-ink/10">
        <button type="button" onClick={() => setTab("clientes")} className={cn("rounded-full px-5 py-2 text-sm font-semibold", tab === "clientes" ? "bg-ink text-cream" : "text-ink-3")}>
          Fechas de clientes
        </button>
        <button type="button" onClick={() => setTab("campana")} className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold", tab === "campana" ? "bg-ink text-cream" : "text-ink-3")}>
          <Megaphone className="size-4" /> Campaña {nextOcc.occasion.name}
        </button>
      </div>

      {!items ? (
        <LoadingBlock />
      ) : tab === "clientes" ? (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {([7, 15, 30, 366] as Window[]).map((w) => (
              <button key={w} type="button" onClick={() => setWin(w)} className={cn("rounded-full px-4 py-2 text-sm font-medium ring-1", win === w ? "bg-ink text-cream ring-ink" : "bg-white ring-ink/10")}>
                {w === 366 ? "Todas" : `Próximos ${w} días`}{w === REMINDER_DAYS_BEFORE && " ★"}
              </button>
            ))}
          </div>
          {visible.length === 0 ? (
            <EmptyBlock
              title="Nada por escribir"
              text={win === REMINDER_DAYS_BEFORE ? "Ningún cliente tiene una fecha en los próximos 7 días." : "No hay fechas de clientes en este rango."}
            />
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
                  Por escribir
                  <span className="rounded-full bg-pink px-2.5 py-0.5 text-xs font-bold text-white">{pending.length}</span>
                </h2>
                {pending.length === 0 ? (
                  <p className="rounded-[1.5rem] bg-teal-soft/60 p-5 text-sm font-medium text-teal-deep">
                    ¡Al día! Ya les escribiste a todos en este rango. 💚
                  </p>
                ) : (
                  <div className="divide-y divide-ink/8 overflow-hidden rounded-[1.5rem] bg-white shadow-soft ring-1 ring-ink/5">
                    {pending.map((it) => renderRow(it, false))}
                  </div>
                )}
              </div>
              {doneList.length > 0 && (
                <div>
                  <h2 className="mb-3 flex items-center gap-2 font-display text-xl text-ink-3">
                    Ya les escribiste <span className="text-sm font-sans font-semibold">({doneList.length})</span>
                  </h2>
                  <div className="divide-y divide-ink/8 overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-ink/5">
                    {doneList.map((it) => renderRow(it, true))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl p-5" style={{ background: nextOcc.occasion.palette.from, color: nextOcc.occasion.palette.ink }}>
            <OccasionIcon icon={nextOcc.occasion.icon} className="size-8" style={{ color: nextOcc.occasion.palette.accent }} />
            <div className="flex-1">
              <p className="font-display text-2xl">{nextOcc.occasion.name}</p>
              <p className="text-sm opacity-75">
                {ucfirst(formatLong(nextOcc.date))} · {relativeDays(nextOcc.days)}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-ink-3">
            Mensaje listo para cada cliente (WhatsApp no permite envíos masivos desde la web, así que se abre uno por uno):
          </p>
          <p className="mt-2 rounded-2xl bg-[#d9fdd3] p-4 text-sm">{campaignText("Nombre")}</p>
          {customers.length === 0 ? (
            <p className="mt-6 text-sm text-ink-3">Aún no tienes clientes registrados.</p>
          ) : (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {customers.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-paper/50 p-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{c.name || "Sin nombre"}</span>
                    <span className="text-xs text-ink-3">{formatPhone(c.phone)}</span>
                  </span>
                  <WaButton phone={c.phone} text={campaignText(c.name)} label="Enviar" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}
