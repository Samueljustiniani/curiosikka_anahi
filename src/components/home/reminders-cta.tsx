import Link from "next/link";
import { ArrowRight, BellRing, Cake, Gem, GraduationCap, Heart as HeartIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { Sparkle, Star } from "@/components/ui/illustrations";
import { buttonClass } from "@/components/ui/button";

const SAMPLE = [
  { Icon: Gem, label: "Nuestro aniversario", color: "#a3399a", bg: "#fbe3f0" },
  { Icon: Cake, label: "Cumpleaños de mamá", color: "#d0447f", bg: "#fff0c9" },
  { Icon: HeartIcon, label: "Cumpleaños de mi amor", color: "#ec4f8f", bg: "#fde6ef" },
  { Icon: GraduationCap, label: "Graduación de mi hermano", color: "#1c1b3a", bg: "#e1e3f5" },
];

export function RemindersCta() {
  return (
    <section className="container-x py-16 sm:py-24">
      <Reveal>
        <div className="relative grid overflow-hidden rounded-[2.5rem] bg-ink text-cream lg:grid-cols-2">
          <Sparkle className="absolute left-[46%] top-10 size-6 animate-twinkle" />
          <Star color="#b49be3" className="absolute bottom-12 left-10 size-4 animate-twinkle [animation-delay:1.2s]" />
          <div className="relative p-8 sm:p-14">
            <p className="eyebrow inline-flex items-center gap-2 text-pink-soft">
              <BellRing className="size-3.5" /> Mis fechas importantes
            </p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.02] sm:text-5xl">
              Nunca más llegues tarde a <em className="font-wonk text-pink-soft italic">una fecha especial.</em>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-cream/70">
              Guarda los cumpleaños, aniversarios y fechas de quienes quieres con tu número de celular.
              Unos días antes te escribimos por WhatsApp para que tengas tu detalle a tiempo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/mis-fechas" className={buttonClass("pink", "lg")}>
                Guardar mis fechas <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="mt-5 text-xs text-cream/50">Solo usamos tu número para escribirte sobre tus fechas y pedidos.</p>
          </div>

          <div className="relative flex items-center justify-center p-8 pt-0 sm:p-14 lg:pt-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgb(236_79_143/0.35),transparent_60%)]" />
            <div className="relative w-full max-w-sm space-y-3">
              {SAMPLE.map(({ Icon, label, color, bg }, i) => (
                <Reveal key={label} delay={0.15 + i * 0.12} y={16}>
                  <div
                    className="flex items-center gap-4 rounded-2xl bg-white p-3.5 pr-5 text-ink shadow-lift"
                    style={{ transform: `translateX(${i % 2 ? 18 : 0}px) rotate(${i % 2 ? 1 : -1}deg)` }}
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: bg, color }}>
                      <Icon className="size-5" />
                    </span>
                    <span className="flex-1 text-sm font-semibold">{label}</span>
                    <BellRing className="size-4 text-ink-3" />
                  </div>
                </Reveal>
              ))}
              <Reveal delay={0.7} y={16}>
                <div className="ml-auto mt-5 flex max-w-[16rem] items-start gap-2.5 rounded-2xl rounded-tr-md bg-[#d9fdd3] p-3.5 text-[0.8rem] leading-snug text-ink shadow-lift">
                  <WhatsAppIcon size={16} className="mt-0.5 shrink-0 text-[#1fae57]" />
                  ¡Hola! Se acerca una de tus fechas especiales 💝 ¿Te ayudamos con el detalle?
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
