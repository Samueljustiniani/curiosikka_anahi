import { Heart, Sparkle } from "@/components/ui/illustrations";
import { cn } from "@/lib/utils";

const WORDS = ["Cuadros personalizados", "Detalles", "Manualidades", "Curiosidades", "Recuerdos únicos", "Hecho con amor"];

export function Marquee({ className, tone = "lilac" }: { className?: string; tone?: "lilac" | "ink" }) {
  const row = [...WORDS, ...WORDS];
  return (
    <div
      className={cn(
        "relative overflow-hidden py-4",
        tone === "lilac" ? "bg-lilac-soft text-[#3f2c7a]" : "bg-ink text-cream",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center gap-10 pr-10">
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
                <span className="font-display text-2xl italic sm:text-3xl">{w}</span>
                {i % 2 ? <Heart className="size-5" /> : <Sparkle color="#ec4f8f" className="size-5" />}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
