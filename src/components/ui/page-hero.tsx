import { Heart, Sparkle, Star } from "./illustrations";
import { cn } from "@/lib/utils";

/** Cabecera elegante para páginas internas */
export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden pb-10 pt-10 sm:pb-14 sm:pt-16", className)}>
      <div className="pointer-events-none absolute -left-32 -top-20 size-96 rounded-full bg-pink-soft/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-0 size-96 rounded-full bg-lilac-soft blur-3xl" />
      <Sparkle className="absolute right-[12%] top-14 size-7 animate-twinkle" />
      <Star color="#17a8a0" className="absolute right-[24%] top-36 hidden size-4 animate-twinkle [animation-delay:1s] sm:block" />
      <Heart className="absolute bottom-6 right-[8%] hidden size-6 animate-float sm:block" />
      <div className="container-x relative">
        <p className="eyebrow inline-flex items-center gap-2 text-pink-deep">
          <span className="h-px w-6 bg-current" />
          {eyebrow}
        </p>
        <h1 className="font-soft mt-5 max-w-4xl text-[2.7rem] font-medium leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
          {title} {accent && <em className="font-wonk text-pink italic">{accent}</em>}
        </h1>
        {description && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-3">{description}</p>}
        {children}
      </div>
    </section>
  );
}
