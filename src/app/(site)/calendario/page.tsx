import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlanner } from "@/components/calendar/calendar-planner";
import { PageHero } from "@/components/ui/page-hero";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { Reveal } from "@/components/ui/reveal";
import { upcomingOccasions } from "@/lib/occasions";
import { MONTHS, formatLong, limaToday, parseISO, relativeDays, ucfirst } from "@/lib/dates";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Calendario",
  description: "Elige el día y separa tu detalle. Fechas especiales del año y disponibilidad en tiempo real.",
};

export default function CalendarioPage() {
  const upcoming = upcomingOccasions(limaToday());
  const byMonth = upcoming.reduce<Record<string, typeof upcoming>>((acc, u) => {
    const { y, m } = parseISO(u.date);
    (acc[`${y}-${m}`] ||= []).push(u);
    return acc;
  }, {});

  return (
    <>
      <PageHero
        eyebrow="Calendario"
        title="Separa tu fecha"
        accent="con tiempo"
        description="Mira qué días están disponibles, descubre las fechas especiales del año y separa tu detalle para el día exacto."
      />

      <section className="container-x">
        <CalendarPlanner />
      </section>

      <section className="container-x py-20">
        <Reveal>
          <h2 className="font-display text-4xl font-medium sm:text-5xl">
            Fechas especiales <em className="text-pink italic">de los próximos 12 meses</em>
          </h2>
        </Reveal>
        <div className="relative mt-12">
          <div className="absolute bottom-0 left-[1.15rem] top-0 w-px bg-gradient-to-b from-pink/40 via-lilac/40 to-teal/40 sm:left-[7.5rem]" />
          <div className="space-y-10">
            {Object.entries(byMonth).map(([key, items]) => {
              const [y, m] = key.split("-").map(Number);
              return (
                <Reveal key={key} className="relative grid gap-4 pl-12 sm:grid-cols-[6.5rem_1fr] sm:gap-10 sm:pl-0">
                  <span className="absolute left-[0.65rem] top-2 size-3 rounded-full bg-pink ring-4 ring-cream sm:left-[7.08rem]" />
                  <p className="font-display text-2xl capitalize sm:text-right">
                    {MONTHS[m - 1]}
                    <span className="block text-sm text-ink-3">{y}</span>
                  </p>
                  <div className="grid gap-3 sm:pl-6 md:grid-cols-2">
                    {items.map(({ occasion: o, date, days }) => (
                      <Link
                        key={o.slug}
                        href={`/ocasiones/${o.slug}`}
                        className="group flex items-center gap-4 rounded-[1.5rem] bg-white p-4 shadow-soft ring-1 ring-ink/5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                      >
                        <span
                          className="grid size-14 shrink-0 place-items-center rounded-2xl"
                          style={{ background: `linear-gradient(150deg, ${o.palette.from}, ${o.palette.to})`, color: o.palette.accent }}
                        >
                          <OccasionIcon icon={o.icon} className="size-6" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-lg font-medium leading-tight">{o.name}</span>
                          <span className="block text-sm text-ink-3">{ucfirst(formatLong(date))}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-2">
                          {relativeDays(days)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
