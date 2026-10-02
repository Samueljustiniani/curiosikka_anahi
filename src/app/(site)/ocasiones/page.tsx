import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { Reveal } from "@/components/ui/reveal";
import { OCCASIONS, upcomingOccasions } from "@/lib/occasions";
import { formatLong, limaToday, relativeDays, ucfirst } from "@/lib/dates";
import { getProducts } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ocasiones",
  description: "San Valentín, Día de la Madre, Día del Padre, Día del Novio, Navidad y más: detalles para cada fecha especial.",
};

export default async function OcasionesPage() {
  const upcoming = upcomingOccasions(limaToday());
  const products = await getProducts();
  const countFor = (slug: string) => products.filter((p) => p.occasions.includes(slug)).length;
  const always = OCCASIONS.filter((o) => o.rule.type === "always");

  return (
    <>
      <PageHero
        eyebrow="Ocasiones"
        title="Un detalle para"
        accent="cada fecha"
        description="Las fechas especiales del calendario peruano, ordenadas por la más cercana. Y para todo lo demás: cumpleaños, aniversarios, graduaciones… o porque sí."
      />

      <section className="container-x pb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map(({ occasion: o, date, days }, i) => {
            const n = countFor(o.slug);
            return (
              <Reveal key={o.slug} delay={(i % 3) * 0.06}>
                <Link
                  href={`/ocasiones/${o.slug}`}
                  className="group relative flex h-full min-h-[17rem] flex-col justify-between overflow-hidden rounded-[2rem] p-7 ring-1 ring-ink/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
                  style={{ background: `linear-gradient(150deg, ${o.palette.from}, ${o.palette.to})`, color: o.palette.ink }}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-14 place-items-center rounded-2xl bg-white/70 backdrop-blur" style={{ color: o.palette.accent }}>
                      <OccasionIcon icon={o.icon} className="size-6" />
                    </span>
                    <span
                      className={
                        "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] " +
                        (i === 0 ? "bg-ink text-cream" : "bg-white/60")
                      }
                    >
                      {relativeDays(days)}
                    </span>
                  </div>
                  <div className="mt-10">
                    <h2 className="font-display text-3xl font-medium leading-tight">{o.name}</h2>
                    <p className="mt-1.5 text-sm opacity-75">{ucfirst(formatLong(date, true))}</p>
                    <div className="mt-5 flex items-center justify-between text-sm font-semibold">
                      <span className="opacity-80">{n > 0 ? `${n} detalle${n === 1 ? "" : "s"}` : o.when}</span>
                      <span className="grid size-10 place-items-center rounded-full bg-white/70 transition-all duration-500 group-hover:rotate-45 group-hover:bg-ink group-hover:text-cream">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="container-x py-16">
        <Reveal>
          <h2 className="font-display text-4xl font-medium sm:text-5xl">
            Y todo el año, <em className="text-pink italic">para todo lo demás</em>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {always.map((o, i) => (
            <Reveal key={o.slug} delay={i * 0.06}>
              <Link
                href={`/ocasiones/${o.slug}`}
                className="group flex h-full flex-col rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-ink/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
              >
                <span
                  className="grid size-12 place-items-center rounded-2xl"
                  style={{ background: `linear-gradient(150deg, ${o.palette.from}, ${o.palette.to})`, color: o.palette.accent }}
                >
                  <OccasionIcon icon={o.icon} className="size-5" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-medium">{o.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-3">{o.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-pink-deep">
                  Ver ideas <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
