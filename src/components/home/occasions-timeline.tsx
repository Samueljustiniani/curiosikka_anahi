import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { UpcomingOccasion } from "@/lib/occasions";
import { MONTHS, WEEKDAYS, parseISO, relativeDays, ucfirst, weekday } from "@/lib/dates";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonClass } from "@/components/ui/button";

export function OccasionsTimeline({ upcoming }: { upcoming: UpcomingOccasion[] }) {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Calendario de fechas especiales"
          title="Cada fecha tiene"
          accent="su detalle"
          description="Las fechas más importantes del año en Perú, en orden. Sepárala con tiempo: los días grandes se llenan rápido."
          action={
            <Link href="/calendario" className={buttonClass("outline", "md")}>
              Ver calendario completo <ArrowRight className="size-4" />
            </Link>
          }
        />
      </div>

      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1rem,calc((100vw_-_80rem)_/_2_+_2rem))] scroll-px-[max(1rem,calc((100vw_-_80rem)_/_2_+_2rem))] pb-6">
        {upcoming.map(({ occasion, date, days }, i) => {
          const { d, m } = parseISO(date);
          return (
            <Link
              key={occasion.slug}
              href={`/ocasiones/${occasion.slug}`}
              className="group relative flex w-[16.5rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[2rem] p-6 ring-1 ring-ink/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift sm:w-[18rem]"
              style={{ background: `linear-gradient(160deg, ${occasion.palette.from}, ${occasion.palette.to})`, color: occasion.palette.ink }}
            >
              <div className="flex items-start justify-between">
                <div className="leading-none">
                  <span className="block font-display text-6xl font-semibold tracking-tight">{d}</span>
                  <span className="mt-1 block text-sm font-semibold uppercase tracking-[0.2em] opacity-70">{MONTHS[m - 1]}</span>
                </div>
                <span
                  className="grid size-12 place-items-center rounded-full bg-white/70 backdrop-blur transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
                  style={{ color: occasion.palette.accent }}
                >
                  <OccasionIcon icon={occasion.icon} className="size-5" />
                </span>
              </div>
              <div className="mt-14">
                <span
                  className={
                    "inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] " +
                    (i === 0 ? "bg-white text-ink shadow-soft" : "bg-white/50")
                  }
                >
                  {relativeDays(days)}
                </span>
                <h3 className="mt-3 font-display text-2xl font-medium leading-tight">{occasion.name}</h3>
                <p className="mt-1 text-sm opacity-70">
                  {occasion.rule.type === "nth" ? occasion.when : ucfirst(WEEKDAYS[weekday(date)])}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
