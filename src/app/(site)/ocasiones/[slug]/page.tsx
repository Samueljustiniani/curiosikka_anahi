import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck, ChevronRight, Lightbulb } from "lucide-react";
import { OCCASIONS, getOccasion, nextOccurrence, occasionDateInYear } from "@/lib/occasions";
import { diffDays, formatLong, limaToday, parseISO, relativeDays, ucfirst } from "@/lib/dates";
import { getProductsForOccasion } from "@/lib/data";
import { Countdown } from "@/components/ui/countdown";
import { OccasionIcon } from "@/components/ui/occasion-icon";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyCatalog } from "@/components/ui/empty-catalog";
import { Heart, Sparkle, Star } from "@/components/ui/illustrations";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const o = getOccasion(slug);
  if (!o) return { title: "Ocasión no encontrada" };
  return { title: `Regalos para ${o.name}`, description: o.description };
}

export default async function OccasionPage({ params }: Props) {
  const { slug } = await params;
  const o = getOccasion(slug);
  if (!o) notFound();

  const today = limaToday();
  const date = nextOccurrence(o, today);
  const days = date ? diffDays(today, date) : null;
  const products = await getProductsForOccasion(o.slug);
  const p = o.palette;
  const nextYear = date ? occasionDateInYear(o, parseISO(date).y + 1) : null;

  return (
    <>
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${p.from} 0%, ${p.to} 100%)`, color: p.ink }}>
        <div className="dotted-bg absolute inset-0 opacity-40" />
        <div className="absolute -right-32 -top-32 size-[28rem] rounded-full opacity-30 blur-3xl" style={{ background: p.accent }} />
        <Sparkle color="#fff" className="absolute left-[8%] top-16 size-7 animate-twinkle" />
        <Star color="#fff" className="absolute right-[18%] top-24 size-4 animate-twinkle [animation-delay:1.3s]" />
        <Heart color="#fff" className="absolute bottom-16 right-[8%] size-8 animate-float opacity-80" />

        <div className="container-x relative py-10 sm:py-16">
          <nav className="flex items-center gap-1.5 text-sm opacity-70" aria-label="Migas de pan">
            <Link href="/" className="hover:opacity-100">Inicio</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/ocasiones" className="hover:opacity-100">Ocasiones</Link>
          </nav>

          <div className="mt-10 grid items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="inline-grid size-16 place-items-center rounded-2xl bg-white/70 shadow-soft backdrop-blur" style={{ color: p.accent }}>
                <OccasionIcon icon={o.icon} className="size-7" />
              </span>
              <h1 className="font-soft mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.03em] sm:text-7xl lg:text-8xl">
                <em className="font-wonk italic">{o.name}</em>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-85">{o.description}</p>
            </div>

            <div className="rounded-[2rem] bg-white/65 p-6 shadow-soft ring-1 ring-white backdrop-blur sm:p-8">
              {date && days !== null ? (
                <>
                  <p className="eyebrow opacity-70">{relativeDays(days)}</p>
                  <p className="mt-2 font-display text-3xl font-medium">{ucfirst(formatLong(date, true))}</p>
                  <p className="mt-1 text-sm opacity-70">Se celebra: {o.when}</p>
                  <Countdown date={date} className="mt-6" />
                  <Link
                    href={`/separar?fecha=${date}&ocasion=${o.slug}`}
                    className="mt-6 flex h-14 items-center justify-center gap-2 rounded-full font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5"
                    style={{ background: p.ink }}
                  >
                    <CalendarCheck className="size-4" /> Separar para esta fecha
                  </Link>
                  {nextYear && o.rule.type === "nth" && (
                    <p className="mt-3 text-center text-xs opacity-60">El próximo año cae el {formatLong(nextYear)}.</p>
                  )}
                </>
              ) : (
                <>
                  <p className="eyebrow opacity-70">{o.when}</p>
                  <p className="mt-2 font-display text-3xl font-medium">Tú eliges la fecha</p>
                  <p className="mt-2 text-sm opacity-75">Elige el día en el calendario y lo preparamos para ese momento.</p>
                  <Link
                    href={`/separar?ocasion=${o.slug}`}
                    className="mt-6 flex h-14 items-center justify-center gap-2 rounded-full font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5"
                    style={{ background: p.ink }}
                  >
                    <CalendarCheck className="size-4" /> Elegir fecha y separar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-16 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {o.ideas.map((idea, i) => (
            <div key={idea} className="flex items-start gap-4 rounded-[1.5rem] bg-white/70 p-5 ring-1 ring-ink/5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full font-display font-semibold text-white" style={{ background: p.accent }}>
                {i + 1}
              </span>
              <p className="pt-2 font-medium">{idea}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-10">
        <SectionHeading
          eyebrow={`Detalles para ${o.name}`}
          title="Elige el tuyo"
          accent="y sepáralo"
          action={
            <Link href={`/personalizado?ocasion=${o.slug}${date ? `&fecha=${date}` : ""}`} className="inline-flex items-center gap-2 font-semibold text-pink-deep">
              <Lightbulb className="size-4" /> ¿Tienes otra idea? Pídela personalizada <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-10">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
              {products.map((prod, i) => (
                <ProductCard key={prod.id} product={prod} index={i} />
              ))}
            </div>
          ) : (
            <EmptyCatalog
              title={`Prepara tu detalle para ${o.name}`}
              text="Aún no publicamos productos para esta fecha, pero hacemos detalles a tu medida. Cuéntanos tu idea y te enviamos una propuesta."
            />
          )}
        </div>
      </section>
    </>
  );
}
