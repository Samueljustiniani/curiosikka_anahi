"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";

/** Un reel vertical que se reproduce solo cuando está en pantalla */
function Reel({ product }: { product: Product }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.6 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <article className="group relative w-[15.5rem] shrink-0 snap-start sm:w-[17rem]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] bg-ink shadow-lift ring-1 ring-ink/5">
        <video
          ref={ref}
          src={product.video_url!}
          poster={product.images[0]}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ink/50 text-white backdrop-blur transition hover:bg-ink/70"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
        <Link
          href={`/producto/${product.slug}`}
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent p-5 pt-16 text-white"
        >
          <p className="font-display text-lg leading-tight">{product.name}</p>
          <p className="mt-1 flex items-center justify-between text-sm text-white/80">
            {formatPrice(product.price)}
            <span className="grid size-8 place-items-center rounded-full bg-white text-ink transition-transform group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </p>
        </Link>
      </div>
    </article>
  );
}

export function ProductReels({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="En video"
          title="Míralos"
          accent="de cerca"
          description="Así quedan nuestros detalles en la vida real."
        />
      </div>
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1rem,calc((100vw_-_80rem)_/_2_+_2rem))] scroll-px-[max(1rem,calc((100vw_-_80rem)_/_2_+_2rem))] pb-6">
        {products.map((p) => (
          <Reel key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
