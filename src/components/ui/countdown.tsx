"use client";

import { useEffect, useState } from "react";
import { limaMidnight, type ISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

function parts(ms: number) {
  const clamp = Math.max(0, ms);
  return {
    days: Math.floor(clamp / 86_400_000),
    hours: Math.floor((clamp / 3_600_000) % 24),
    minutes: Math.floor((clamp / 60_000) % 60),
    seconds: Math.floor((clamp / 1000) % 60),
  };
}

/** Cuenta regresiva hasta la medianoche (hora de Lima) de la fecha */
export function Countdown({
  date,
  className,
  tone = "light",
  compact = false,
}: {
  date: ISODate;
  className?: string;
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  const target = limaMidnight(date);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const p = parts(now === null ? 0 : target - now);
  const units = [
    { v: p.days, l: "días" },
    { v: p.hours, l: "horas" },
    { v: p.minutes, l: "min" },
    { v: p.seconds, l: "seg" },
  ];
  const isToday = now !== null && target - now <= 0 && target - now > -86_400_000;

  if (isToday) {
    return (
      <p className={cn("font-display text-2xl italic", tone === "dark" ? "text-cream" : "text-ink", className)}>
        ¡Es hoy! 🎉
      </p>
    );
  }

  return (
    <div className={cn("flex items-stretch gap-2", className)} aria-label={`Faltan ${p.days} días y ${p.hours} horas`}>
      {units.map((u) => (
        <div
          key={u.l}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl",
            compact ? "min-w-12 px-2 py-1.5" : "min-w-[3.9rem] px-3 py-2.5",
            tone === "dark" ? "bg-white/10 text-cream ring-1 ring-white/15" : "bg-white/70 text-ink ring-1 ring-ink/5 shadow-soft"
          )}
        >
          <span
            className={cn("font-display font-semibold tabular-nums leading-none", compact ? "text-lg" : "text-[1.7rem]")}
            suppressHydrationWarning
          >
            {now === null ? "–" : String(u.v).padStart(2, "0")}
          </span>
          <span className={cn("mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em]", tone === "dark" ? "text-cream/60" : "text-ink-3")}>
            {u.l}
          </span>
        </div>
      ))}
    </div>
  );
}
