"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CalendarCheck, CalendarHeart, Lightbulb } from "lucide-react";
import { MonthCalendar, type CalendarDayInfo } from "./month-calendar";
import { addDays, diffDays, formatLong, limaToday, parseISO, relativeDays, type ISODate, ucfirst } from "@/lib/dates";
import { occasionsByDate, upcomingOccasions } from "@/lib/occasions";
import { useSite } from "@/components/providers/site-provider";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { buttonClass } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { GiftBox } from "@/components/ui/illustrations";

export function CalendarPlanner() {
  const { min_lead_days } = useSite();
  const [selected, setSelected] = useState<CalendarDayInfo | null>(null);
  const [today, setToday] = useState<ISODate | null>(null);

  useEffect(() => setToday(limaToday()), []);

  const iso = selected?.iso;
  const specials = iso ? occasionsByDate(parseISO(iso).y)[iso] ?? [] : [];
  const next = today ? upcomingOccasions(today)[0] : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="rounded-[2rem] bg-white/80 p-4 shadow-soft ring-1 ring-ink/5 backdrop-blur sm:p-7">
        <MonthCalendar
          size="lg"
          value={iso}
          minLeadDays={min_lead_days}
          onSelect={(_, info) => setSelected(info)}
        />
        {today && min_lead_days > 0 && (
          <p className="mt-4 text-xs text-ink-3">
            Puedes separar desde el <strong className="text-ink">{formatLong(addDays(today, min_lead_days))}</strong>{" "}
            ({min_lead_days} día{min_lead_days === 1 ? "" : "s"} de anticipación como mínimo).
          </p>
        )}
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <AnimatePresence mode="wait">
          {selected && iso ? (
            <motion.div
              key={iso}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-[2rem] bg-ink p-7 text-cream shadow-lift sm:p-9"
            >
              <p className="eyebrow text-pink-soft">{today ? relativeDays(diffDays(today, iso)) : "Fecha elegida"}</p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight">{ucfirst(formatLong(iso, true))}</h2>
              {specials.length > 0 && (
                <div className="mt-5 space-y-2">
                  {specials.map((o) => (
                    <Link
                      key={o.slug}
                      href={`/ocasiones/${o.slug}`}
                      className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 transition hover:bg-white/15"
                    >
                      <span className="grid size-10 place-items-center rounded-xl" style={{ background: o.palette.from, color: o.palette.accent }}>
                        <OccasionIcon icon={o.icon} className="size-5" />
                      </span>
                      <span className="font-semibold">{o.name}</span>
                      <ArrowRight className="ml-auto size-4 opacity-60" />
                    </Link>
                  ))}
                </div>
              )}
              {selected.status === "few" && (
                <p className="mt-5 rounded-2xl bg-butter/15 px-4 py-3 text-sm text-butter-soft">
                  Quedan pocos cupos para este día. ¡Sepáralo pronto!
                </p>
              )}
              <div className="mt-7 grid gap-3">
                <Link
                  href={`/separar?fecha=${iso}${specials[0] ? `&ocasion=${specials[0].slug}` : ""}`}
                  className={buttonClass("pink", "lg", "w-full")}
                >
                  <CalendarCheck className="size-4" /> Separar para este día
                </Link>
                <Link
                  href={`/personalizado?fecha=${iso}${specials[0] ? `&ocasion=${specials[0].slug}` : ""}`}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white/10 font-semibold transition hover:bg-white/15"
                >
                  <Lightbulb className="size-4" /> Pedir un personalizado
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[2rem] bg-white/80 p-7 text-center shadow-soft ring-1 ring-ink/5 sm:p-9"
            >
              <GiftBox className="mx-auto w-24 animate-float" />
              <h2 className="mt-6 font-display text-3xl font-medium">Elige un día</h2>
              <p className="mt-2 text-ink-3">Toca una fecha disponible en el calendario para separar tu detalle.</p>
              {next && (
                <div className="mt-8 rounded-2xl p-5 text-left" style={{ background: next.occasion.palette.from, color: next.occasion.palette.ink }}>
                  <p className="eyebrow flex items-center gap-2 opacity-75">
                    <CalendarHeart className="size-3.5" /> Próxima fecha especial
                  </p>
                  <p className="mt-2 font-display text-2xl">{next.occasion.name}</p>
                  <p className="text-sm opacity-75">{ucfirst(formatLong(next.date))}</p>
                  <Countdown date={next.date} compact className="mt-4" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
