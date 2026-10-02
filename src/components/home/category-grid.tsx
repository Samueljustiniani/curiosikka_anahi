import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Bulb, GiftBox, Jar, Scissors, Yarn } from "@/components/ui/illustrations";
import { cn } from "@/lib/utils";

/** Las cuatro líneas de Curiosiika (también sembradas en la base de datos) */
export const DEFAULT_CATEGORIES: Pick<Category, "slug" | "name" | "description">[] = [
  { slug: "cuadros-personalizados", name: "Cuadros personalizados", description: "Tus fotos y frases convertidas en un recuerdo para siempre." },
  { slug: "detalles", name: "Detalles", description: "Sorpresas pensadas para cada persona y cada fecha." },
  { slug: "manualidades", name: "Manualidades", description: "Hecho a mano, pieza por pieza." },
  { slug: "curiosidades", name: "Curiosidades", description: "Cositas únicas para regalar y regalarte." },
];

const STYLES: Record<string, { bg: string; art: React.ReactNode }> = {
  "cuadros-personalizados": {
    bg: "bg-blush",
    art: (
      <div className="relative h-full w-full">
        <div className="absolute right-6 top-6 w-[46%] rotate-[6deg] rounded-xl bg-[linear-gradient(135deg,#e2bf98,#b4835a)] p-2 shadow-lift transition-transform duration-700 group-hover:rotate-[2deg]">
          <div className="grid aspect-[4/5] grid-cols-2 gap-1.5 rounded-md bg-[#fffaf3] p-2">
            <span className="rounded-sm bg-[linear-gradient(160deg,#ffd6e6,#f7a1c4)]" />
            <span className="rounded-sm bg-[linear-gradient(160deg,#d2f1ee,#8fd6cf)]" />
            <span className="rounded-sm bg-[linear-gradient(160deg,#fdf1c9,#f9c48d)]" />
            <span className="rounded-sm bg-[linear-gradient(160deg,#efe8fb,#c9a7f0)]" />
          </div>
        </div>
      </div>
    ),
  },
  detalles: {
    bg: "bg-teal-soft",
    art: <GiftBox className="absolute right-5 top-5 w-[34%] max-w-[8.5rem] transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-105" />,
  },
  manualidades: {
    bg: "bg-butter-soft",
    art: (
      <>
        <Scissors className="absolute right-5 top-5 w-[19%] max-w-[4.5rem] rotate-12 transition-transform duration-700 group-hover:rotate-[24deg]" />
        <Yarn className="absolute right-[25%] top-9 w-[24%] max-w-[6rem] transition-transform duration-700 group-hover:translate-x-2" />
      </>
    ),
  },
  curiosidades: {
    bg: "bg-lilac-soft",
    art: (
      <>
        <Bulb className="absolute right-[22%] top-5 w-[13%] max-w-[5.5rem] transition-transform duration-700 group-hover:-translate-y-2" />
        <Jar className="absolute right-6 top-6 w-[13%] max-w-[5.5rem] transition-transform duration-700 group-hover:rotate-6" />
      </>
    ),
  },
};

export function CategoryGrid({ categories }: { categories: Pick<Category, "slug" | "name" | "description">[] }) {
  const list = categories.length ? categories : DEFAULT_CATEGORIES;
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHeading
        eyebrow="Lo que hacemos"
        title="Cada detalle,"
        accent="hecho para alguien"
        description="Personalización, calidad y atención en cada pedido. Elige por dónde empezar."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {list.map((c, i) => {
          const style = STYLES[c.slug] ?? { bg: "bg-paper", art: null };
          const big = i === 0;
          return (
            <Reveal
              key={c.slug}
              delay={i * 0.08}
              className={cn(big && "sm:col-span-2 lg:row-span-2", i === 3 && "lg:col-span-2")}
            >
              <Link
                href={`/tienda?categoria=${c.slug}`}
                className={cn(
                  "group relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] p-7 ring-1 ring-ink/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift",
                  style.bg,
                  big ? "min-h-[22rem] lg:min-h-[31rem]" : "min-h-[15rem]"
                )}
              >
                <div className="pointer-events-none absolute inset-0">{style.art}</div>
                <span className="relative grid size-11 place-items-center rounded-full bg-white/80 text-ink shadow-soft transition-all duration-500 group-hover:rotate-45 group-hover:bg-ink group-hover:text-cream">
                  <ArrowUpRight className="size-5" />
                </span>
                <div className={cn("relative", big ? "max-w-[20rem]" : "max-w-[15rem]")}>
                  <h3 className={cn("font-display font-medium leading-tight", big ? "text-4xl sm:text-5xl" : "text-2xl")}>
                    {c.name}
                  </h3>
                  {c.description && <p className="mt-2 text-sm leading-relaxed text-ink-2/80">{c.description}</p>}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
