import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import type { UpcomingOccasion } from "@/lib/occasions";
import type { Product } from "@/lib/types";
import { formatLong, relativeDays, ucfirst } from "@/lib/dates";
import { Countdown } from "@/components/ui/countdown";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { Reveal } from "@/components/ui/reveal";
import { Heart, Sparkle } from "@/components/ui/illustrations";
import { formatPrice } from "@/lib/utils";

export function OccasionSpotlight({ next, products }: { next: UpcomingOccasion; products: Product[] }) {
  const { occasion, date, days } = next;
  const p = occasion.palette;
  const picks = products.slice(0, 3);

  return (
    <section className="container-x py-16 sm:py-24">
      <Reveal>
        <div
          className="relative overflow-hidden rounded-[2.5rem] p-7 shadow-lift sm:p-12 lg:p-16"
          style={{ background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`, color: p.ink }}
        >
          <div className="dotted-bg absolute inset-0 opacity-40" />
          <div
            className="absolute -right-24 -top-24 size-96 rounded-full opacity-40 blur-3xl"
            style={{ background: p.accent }}
          />
          <Sparkle color="#fff" className="absolute right-[38%] top-10 size-7 animate-twinkle" />
          <Heart color="#fff" className="absolute bottom-10 left-[44%] size-6 animate-float opacity-80" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="eyebrow inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 backdrop-blur">
                <OccasionIcon icon={occasion.icon} className="size-3.5" style={{ color: p.accent }} />
                Próxima fecha especial · {relativeDays(days)}
              </p>
              <h2 className="font-soft mt-6 text-5xl font-medium leading-[0.95] sm:text-7xl">
                <em className="font-wonk italic">{occasion.name}</em>
              </h2>
              <p className="mt-4 font-display text-xl opacity-80 sm:text-2xl">{ucfirst(formatLong(date, true))}</p>
              <p className="mt-5 max-w-lg leading-relaxed opacity-80">{occasion.description}</p>

              <Countdown date={date} className="mt-8" />

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/separar?fecha=${date}&ocasion=${occasion.slug}`}
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5"
                  style={{ background: p.ink }}
                >
                  <CalendarCheck className="size-4" />
                  Separar para esta fecha
                </Link>
                <Link
                  href={`/ocasiones/${occasion.slug}`}
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white/70 px-7 font-semibold backdrop-blur transition hover:bg-white"
                >
                  Ver ideas de regalo
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="relative">
              {picks.length > 0 ? (
                <div className="relative mx-auto grid max-w-md grid-cols-2 gap-4">
                  {picks.map((prod, i) => (
                    <Link
                      key={prod.id}
                      href={`/producto/${prod.slug}`}
                      className={
                        "group relative overflow-hidden rounded-3xl bg-white p-2 shadow-lift transition-transform duration-500 hover:-translate-y-1 hover:rotate-0 " +
                        (i === 0 ? "col-span-2 rotate-[-1.5deg]" : i === 1 ? "rotate-[2deg]" : "rotate-[-2deg]")
                      }
                    >
                      <div className={"relative overflow-hidden rounded-[1.2rem] bg-paper " + (i === 0 ? "aspect-[16/10]" : "aspect-square")}>
                        {prod.images[0] && (
                          <Image src={prod.images[0]} alt={prod.name} fill sizes="(min-width:1024px) 24rem, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 px-2 py-2.5 text-ink">
                        <span className="truncate text-sm font-semibold">{prod.name}</span>
                        <span className="shrink-0 font-display text-sm">{formatPrice(prod.price)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="relative mx-auto max-w-sm rounded-[2rem] bg-white/70 p-8 text-center backdrop-blur ring-1 ring-white">
                  <span
                    className="mx-auto grid size-20 place-items-center rounded-full text-white shadow-lift"
                    style={{ background: p.accent }}
                  >
                    <OccasionIcon icon={occasion.icon} className="size-9" />
                  </span>
                  <p className="mt-6 font-display text-2xl text-ink">Ideas para regalar</p>
                  <ul className="mt-4 space-y-2.5 text-left text-ink-2">
                    {occasion.ideas.map((idea) => (
                      <li key={idea} className="flex items-start gap-2.5">
                        <Heart color={p.accent} className="mt-1 size-3.5 shrink-0" />
                        {idea}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/personalizado?ocasion=${occasion.slug}&fecha=${date}`}
                    className="mt-7 inline-flex items-center gap-2 font-semibold text-ink underline decoration-2 underline-offset-4"
                    style={{ textDecorationColor: p.accent }}
                  >
                    Pedir uno personalizado <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
