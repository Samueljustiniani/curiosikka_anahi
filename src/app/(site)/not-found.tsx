import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Bulb, Heart, Sparkle } from "@/components/ui/illustrations";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative">
        <Bulb className="w-24 animate-float [--r:-6deg]" />
        <Sparkle className="absolute -right-8 top-0 size-6 animate-twinkle" />
        <Heart className="absolute -left-8 bottom-4 size-5 animate-float" />
      </div>
      <p className="eyebrow mt-8 text-pink-deep">Error 404</p>
      <h1 className="mt-4 font-display text-5xl font-medium sm:text-6xl">
        Este detalle <em className="text-pink italic">se nos perdió</em>
      </h1>
      <p className="mt-4 max-w-md text-ink-3">La página que buscas no existe o ya no está disponible.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/tienda" className={buttonClass("primary", "md")}>
          Ir a la tienda <ArrowRight className="size-4" />
        </Link>
        <Link href="/" className={buttonClass("outline", "md")}>
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
