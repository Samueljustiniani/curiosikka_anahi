"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion } from "motion/react";
import { Play, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { getOccasion } from "@/lib/occasions";
import { cn } from "@/lib/utils";
import { Price } from "@/components/ui/price";
import { GiftBox } from "@/components/ui/illustrations";
import { useCart } from "@/components/providers/cart-provider";

export function ProductPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("grid h-full w-full place-items-center bg-[linear-gradient(150deg,#fde6ef,#efe8fb_55%,#d2f1ee)]", className)}>
      <GiftBox className="w-2/5 opacity-90" />
    </div>
  );
}

export function ProductCard({ product, index = 0, priority = false }: { product: Product; index?: number; priority?: boolean }) {
  const { add } = useCart();
  const [img1, img2] = product.images;
  const occasion = getOccasion(product.occasions[0]);
  const video = product.video_url;
  const videoRef = useRef<HTMLVideoElement>(null);

  // El video del producto se reproduce al pasar el mouse (se descarga solo en ese momento)
  const playVideo = () => {
    videoRef.current?.play().catch(() => {});
  };
  const stopVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(
      { productId: product.id, slug: product.slug, name: product.name, price: product.price, image: img1 ?? null },
      { silent: true }
    );
    toast.success("Agregado a tu lista", { description: product.name });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      onMouseEnter={video ? playVideo : undefined}
      onMouseLeave={video ? stopVideo : undefined}
    >
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-soft ring-1 ring-ink/5 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-lift">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-paper">
            {img1 ? (
              <>
                <Image
                  src={img1}
                  alt={product.name}
                  fill
                  priority={priority}
                  sizes="(min-width: 1280px) 22rem, (min-width: 768px) 33vw, 50vw"
                  className={cn(
                    "object-cover transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]",
                    (img2 || video) && "group-hover:opacity-0"
                  )}
                />
                {img2 && !video && (
                  <Image
                    src={img2}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 22rem, (min-width: 768px) 33vw, 50vw"
                    className="scale-[1.04] object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
                  />
                )}
              </>
            ) : (
              <ProductPlaceholder className="transition-transform duration-700 group-hover:scale-[1.04]" />
            )}

            {video && (
              <>
                <video
                  ref={videoRef}
                  src={video}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-[0.68rem] font-semibold text-white backdrop-blur transition-opacity group-hover:opacity-0">
                  <Play className="size-3 fill-current" /> Video
                </span>
              </>
            )}

            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {product.is_customizable && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[0.68rem] font-semibold text-[#5b3fa8] backdrop-blur">
                  <Sparkles className="size-3" /> Personalizable
                </span>
              )}
              {product.compare_at_price && product.price !== null && product.compare_at_price > product.price && (
                <span className="rounded-full bg-pink px-2.5 py-1 text-[0.68rem] font-bold text-white">
                  -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={quickAdd}
              className="absolute bottom-2.5 right-2.5 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-3 sm:bottom-3 sm:right-3 sm:h-11 sm:pl-3 sm:pr-4 text-sm font-semibold text-cream shadow-lift transition-all duration-500 hover:bg-pink sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
              aria-label={`Agregar ${product.name} a mi lista`}
            >
              <Plus className="size-4" /> <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>

        <div className="px-2 pt-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.66rem] font-semibold uppercase leading-snug tracking-[0.1em] text-ink-3 sm:text-[0.7rem] sm:tracking-[0.16em]">
            {product.category?.name && <span>{product.category.name}</span>}
            {occasion && (
              <>
                {product.category?.name && <span className="text-ink/20">•</span>}
                <span style={{ color: occasion.palette.accent }}>{occasion.name}</span>
              </>
            )}
          </div>
          <h3 className="mt-1.5 break-words font-display text-[1.1rem] font-medium leading-snug sm:text-[1.2rem] text-ink transition-colors group-hover:text-pink-deep">
            {product.name}
          </h3>
          <Price price={product.price} compareAt={product.compare_at_price} size="sm" className="mt-1.5" />
        </div>
      </Link>
    </motion.article>
  );
}
