"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { MONTHS, WEEKDAYS_SHORT, diffDays, limaToday, monthMatrix, parseISO, type ISODate } from "@/lib/dates";
import { occasionsByDate } from "@/lib/occasions";
import { cn } from "@/lib/utils";
import { dayStatus, useAvailability, type DayStatus } from "./use-availability";

export type CalendarDayInfo = { iso: ISODate; status: DayStatus; selectable: boolean; reason?: string | null };

export function MonthCalendar({
  value,
  onSelect,
  minLeadDays = 0,
  maxDaysAhead = 365,
  size = "md",
  initialMonth,
}: {
  value?: ISODate | null;
  onSelect?: (iso: ISODate, info: CalendarDayInfo) => void;
  minLeadDays?: number;
  maxDaysAhead?: number;
  size?: "md" | "lg";
  initialMonth?: ISODate | null;
}) {
  const today = limaToday();
  const start = parseISO(initialMonth || value || today);
  const [cursor, setCursor] = useState({ y: start.y, m: start.m });
  const [direction, setDirection] = useState(0);
  const { data: availability, loading } = useAvailability(cursor.y, cursor.m);
  const weeks = useMemo(() => monthMatrix(cursor.y, cursor.m), [cursor]);
  const specials = useMemo(() => occasionsByDate(cursor.y), [cursor.y]);

  const todayParts = parseISO(today);
  const canPrev = cursor.y > todayParts.y || (cursor.y === todayParts.y && cursor.m > todayParts.m);
  const monthsAhead = (cursor.y - todayParts.y) * 12 + (cursor.m - todayParts.m);
  const canNext = monthsAhead < 12;

  const move = (delta: number) => {
    setDirection(delta);
    setCursor(({ y, m }) => {
      const n = m + delta;
      return n < 1 ? { y: y - 1, m: 12 } : n > 12 ? { y: y + 1, m: 1 } : { y, m: n };
    });
  };

  const big = size === "lg";

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!canPrev}
          className="grid size-10 place-items-center rounded-full bg-white shadow-soft ring-1 ring-ink/5 transition hover:-translate-x-0.5 disabled:opacity-30"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="flex items-center gap-2 font-display text-xl font-medium capitalize">
          {MONTHS[cursor.m - 1]} <span className="text-ink-3">{cursor.y}</span>
          {loading && <Loader className="size-3.5 animate-spin text-ink-3" />}
        </p>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!canNext}
          className="grid size-10 place-items-center rounded-full bg-white shadow-soft ring-1 ring-ink/5 transition hover:translate-x-0.5 disabled:opacity-30"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-3">
        {WEEKDAYS_SHORT.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={`${cursor.y}-${cursor.m}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-1"
          >
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((iso, di) => {
                  if (!iso) return <span key={di} />;
                  const offset = diffDays(today, iso);
                  const a = availability[iso];
                  const tooSoon = offset < minLeadDays;
                  const tooFar = offset > maxDaysAhead;
                  const status: DayStatus = tooSoon || tooFar ? "unavailable" : dayStatus(a);
                  const selectable = status === "available" || status === "few";
                  const special = specials[iso]?.[0];
                  const selected = value === iso;
                  const isToday = offset === 0;
                  const { d } = parseISO(iso);

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!selectable || !onSelect}
                      onClick={() => onSelect?.(iso, { iso, status, selectable, reason: a?.reason })}
                      title={
                        [special?.name, status === "blocked" ? a?.reason || "Cerrado" : null, status === "full" ? "Completo" : null, status === "few" ? "Pocos cupos" : null]
                          .filter(Boolean)
                          .join(" · ") || undefined
                      }
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300",
                        big ? "aspect-square sm:aspect-[1/0.9]" : "aspect-square",
                        selected
                          ? "bg-ink text-cream shadow-lift"
                          : selectable && onSelect
                            ? "bg-white text-ink ring-1 ring-ink/5 hover:-translate-y-0.5 hover:shadow-soft hover:ring-pink/40"
                            : selectable
                              ? "bg-white text-ink ring-1 ring-ink/5"
                              : status === "full" || status === "blocked"
                                ? "bg-shell/60 text-ink-3/70"
                                : "text-ink-3/40",
                        special && !selected && selectable && "ring-2"
                      )}
                      style={special && !selected && selectable ? { boxShadow: `inset 0 0 0 2px ${special.palette.to}`, background: special.palette.from } : undefined}
                    >
                      <span className={cn("font-display tabular-nums leading-none", big ? "text-lg sm:text-xl" : "text-[0.95rem]", (status === "full" || status === "blocked") && "line-through decoration-1")}>
                        {d}
                      </span>
                      {isToday && !selected && <span className="absolute top-1.5 size-1 rounded-full bg-pink" />}
                      {special && (
                        <span
                          className={cn("mt-1 max-w-full truncate px-1 font-semibold leading-none", big ? "hidden text-[0.6rem] sm:block" : "hidden")}
                          style={{ color: selected ? undefined : special.palette.accent }}
                        >
                          {special.name.replace("Día de la ", "").replace("Día del ", "")}
                        </span>
                      )}
                      {special && <span className={cn("absolute bottom-1.5 size-1.5 rounded-full", big && "sm:hidden")} style={{ background: special.palette.accent }} />}
                      {status === "few" && !selected && (
                        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-butter ring-2 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-md bg-white ring-1 ring-ink/10" /> Disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-butter" /> Pocos cupos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-md bg-shell" /> Completo / cerrado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-pink" /> Fecha especial
        </span>
      </div>
    </div>
  );
}
