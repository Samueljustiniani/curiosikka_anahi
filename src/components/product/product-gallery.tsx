"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "./product-card";

type Media = { type: "image" | "video"; src: string };

export function ProductGallery({ images, video, name }: { images: string[]; video?: string | null; name: string }) {
  const media: Media[] = [
    ...images.map((src) => ({ type: "image" as const, src })),
    ...(video ? [{ type: "video" as const, src: video }] : []),
  ];
  const [active, setActive] = useState(0);
  const current = media[active];

  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-2.5 shadow-lift ring-1 ring-ink/5">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-paper">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {!current ? (
                <ProductPlaceholder />
              ) : current.type === "image" ? (
                <Image
                  src={current.src}
                  alt={name}
                  fill
                  priority={active === 0}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <video src={current.src} className="h-full w-full object-cover" autoPlay muted loop playsInline controls />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {media.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={m.src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-2xl bg-paper ring-2 transition-all",
                active === i ? "ring-pink" : "ring-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={m.type === "video" ? "Ver video" : `Ver imagen ${i + 1}`}
            >
              {m.type === "image" ? (
                <Image src={m.src} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <span className="grid h-full place-items-center bg-ink text-cream">
                  <Play className="size-6" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
