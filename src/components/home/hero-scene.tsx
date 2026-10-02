"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { Bulb, GiftBox, Heart, Jar, Sparkle, Star } from "@/components/ui/illustrations";

/** Pseudo-aleatorio determinista (mismo resultado en servidor y cliente) */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const HEART_COLORS = ["#ec4f8f", "#f9a8c9", "#b49be3", "#17a8a0", "#f6c744"];

function useParallax(x: MotionValue<number>, y: MotionValue<number>, depth: number) {
  const tx = useTransform(x, (v) => v * depth);
  const ty = useTransform(y, (v) => v * depth);
  return { x: tx, y: ty };
}

const POLAROIDS = [
  { rot: -7, caption: "nosotros ♡", bg: "linear-gradient(160deg,#ffd6e6 0%,#f7a1c4 55%,#c9a7f0 100%)", art: "hearts" },
  { rot: 4, caption: "mi lugar favorito", bg: "linear-gradient(160deg,#fdf1c9 0%,#f9c48d 50%,#ec7aa6 100%)", art: "sun" },
  { rot: -3, caption: "siempre", bg: "linear-gradient(160deg,#d2f1ee 0%,#8fd6cf 55%,#5aa6c9 100%)", art: "stars" },
] as const;

function PolaroidArt({ art }: { art: (typeof POLAROIDS)[number]["art"] }) {
  if (art === "hearts")
    return (
      <svg viewBox="0 0 100 80" className="h-full w-full">
        <circle cx="50" cy="78" r="40" fill="#fff" opacity=".25" />
        <path d="M38 52s-12-7-12-15c0-4 3-7 6.5-7 2.6 0 4.4 1.6 5.5 3.4 1.1-1.8 2.9-3.4 5.5-3.4 3.5 0 6.5 3 6.5 7 0 8-12 15-12 15Z" fill="#fff" />
        <path d="M64 44s-8-4.6-8-10c0-2.7 2-4.6 4.3-4.6 1.7 0 2.9 1 3.7 2.3.8-1.3 2-2.3 3.7-2.3 2.3 0 4.3 1.9 4.3 4.6 0 5.4-8 10-8 10Z" fill="#ec4f8f" />
      </svg>
    );
  if (art === "sun")
    return (
      <svg viewBox="0 0 100 80" className="h-full w-full">
        <circle cx="50" cy="48" r="16" fill="#fff6d6" />
        <path d="M0 62c18-10 34-10 50 0s32 10 50 0v18H0Z" fill="#1c1b3a" opacity=".22" />
        <path d="M0 70c18-8 34-8 50 0s32 8 50 0v10H0Z" fill="#1c1b3a" opacity=".35" />
      </svg>
    );
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      <path d="m30 22 2.4 5 5.6.6-4.2 3.8 1.2 5.5L30 34l-5 2.9 1.2-5.5-4.2-3.8 5.6-.6Z" fill="#fff" />
      <path d="m68 16 1.6 3.4 3.7.4-2.8 2.5.8 3.7-3.3-1.9-3.3 1.9.8-3.7-2.8-2.5 3.7-.4Z" fill="#fff6d6" />
      <circle cx="74" cy="44" r="10" fill="#fff" opacity=".9" />
      <circle cx="78" cy="41" r="9" fill="#8fd6cf" />
      <path d="M0 66c22-8 40-8 60 0s28 6 40 2v12H0Z" fill="#1c1b3a" opacity=".3" />
    </svg>
  );
}

export function HeroScene({ videoUrl, posterUrl }: { videoUrl?: string | null; posterUrl?: string | null }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const far = useParallax(sx, sy, -10);
  const mid = useParallax(sx, sy, 8);
  const near = useParallax(sx, sy, 18);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  const hearts = useMemo(() => {
    const rnd = seeded(7);
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: 6 + rnd() * 88,
      size: 10 + rnd() * 18,
      delay: rnd() * 9,
      duration: 8 + rnd() * 7,
      drift: (rnd() - 0.5) * 60,
      color: HEART_COLORS[i % HEART_COLORS.length],
    }));
  }, []);

  const sparkles = useMemo(() => {
    const rnd = seeded(21);
    return Array.from({ length: 9 }, (_, i) => ({
      id: i,
      left: rnd() * 100,
      top: rnd() * 100,
      size: 8 + rnd() * 14,
      delay: rnd() * 3,
      color: i % 3 === 0 ? "#1c1b3a" : i % 3 === 1 ? "#f6c744" : "#b49be3",
    }));
  }, []);

  const appear = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, scale: 0.8, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { delay, duration: 1, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div ref={ref} className="relative mx-auto aspect-[4/5] w-full max-w-[34rem] select-none" aria-hidden="true">
      {/* Fondo: manchas de color que respiran */}
      <motion.div style={far} className="absolute inset-[6%]">
        <div className="absolute inset-0 animate-blob bg-[radial-gradient(circle_at_30%_30%,#fbc4da_0%,transparent_55%),radial-gradient(circle_at_75%_35%,#d9c8f6_0%,transparent_55%),radial-gradient(circle_at_50%_85%,#bfece7_0%,transparent_60%)] opacity-90 blur-[2px]" />
        <svg viewBox="0 0 200 200" className="absolute inset-[-4%] h-[108%] w-[108%] animate-spin-slow">
          <circle cx="100" cy="100" r="96" fill="none" stroke="#ec4f8f" strokeWidth="1.4" strokeDasharray="2 7" strokeLinecap="round" opacity=".55" />
        </svg>
      </motion.div>

      {/* Destellos */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute animate-twinkle"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        >
          {s.id % 2 ? <Star color={s.color} className="h-full w-full" /> : <Sparkle color={s.color} className="h-full w-full" />}
        </span>
      ))}

      {/* Corazones que suben */}
      <div className="absolute inset-0 overflow-hidden rounded-[3rem]">
        {!reduce &&
          hearts.map((h) => (
            <motion.span
              key={h.id}
              className="absolute bottom-[-8%]"
              style={{ left: `${h.left}%`, width: h.size, height: h.size }}
              initial={{ y: 0, x: 0, opacity: 0, rotate: -10 }}
              animate={{ y: [0, -520], x: [0, h.drift], opacity: [0, 0.9, 0.9, 0], rotate: [-10, 14] }}
              transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: "easeOut" }}
            >
              <Heart color={h.color} className="h-full w-full" />
            </motion.span>
          ))}
      </div>

      {/* Cuadro de madera con polaroids (o el video de la tienda) */}
      <motion.div style={mid} className="absolute left-[9%] right-[9%] top-[13%] bottom-[16%]">
        <motion.div
          {...appear(0.15)}
          className="relative h-full w-full rounded-[1.6rem] bg-[linear-gradient(135deg,#e2bf98,#c99a6c_40%,#b4835a)] p-3 shadow-[0_40px_80px_-30px_rgb(28_27_58/0.55),inset_0_2px_0_rgb(255_255_255/0.35)]"
        >
          <div className="relative h-full w-full overflow-hidden rounded-[1.1rem] bg-[#fffaf3] shadow-[inset_0_2px_10px_rgb(120_80_40/0.25)]">
            {videoUrl ? (
              <video
                className="h-full w-full object-cover"
                src={videoUrl}
                poster={posterUrl ?? undefined}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <>
                <div className="dotted-bg absolute inset-0 opacity-60" />
                {/* cuerda */}
                <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="absolute inset-x-0 top-[7%] h-[12%] w-full">
                  <path d="M0 8 C 80 52, 220 52, 300 8" stroke="#8d6440" strokeWidth="2" fill="none" />
                </svg>
                {/* polaroids colgando */}
                <div className="absolute inset-x-[5%] top-[10%] flex justify-between">
                  {POLAROIDS.map((p, i) => (
                    <motion.div
                      key={p.caption}
                      className="relative w-[30%] origin-top"
                      style={{ marginTop: i === 1 ? "9%" : "3%" }}
                      initial={reduce ? false : { y: -40, opacity: 0, rotate: p.rot * 3 }}
                      animate={
                        reduce
                          ? undefined
                          : { y: 0, opacity: 1, rotate: [p.rot, p.rot + 2.5, p.rot - 1.5, p.rot] }
                      }
                      transition={{
                        y: { delay: 0.5 + i * 0.18, type: "spring", damping: 12 },
                        opacity: { delay: 0.5 + i * 0.18, duration: 0.4 },
                        rotate: { delay: 1.2 + i * 0.3, duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
                      }}
                    >
                      <span className="absolute -top-2.5 left-1/2 z-10 h-5 w-2.5 -translate-x-1/2 rounded-[3px] bg-[#e9c79f] ring-1 ring-[#a87a50]" />
                      <div className="rounded-[6px] bg-white p-[7%] pb-[22%] shadow-[0_10px_20px_-8px_rgb(28_27_58/0.45)]">
                        <div className="aspect-[5/4] overflow-hidden rounded-[3px]" style={{ background: p.bg }}>
                          <PolaroidArt art={p.art} />
                        </div>
                        <p className="absolute inset-x-0 bottom-[3%] text-center font-hand text-[clamp(0.7rem,1.6vw,1.05rem)] leading-none text-ink-2">
                          {p.caption}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* frase escrita a mano */}
                <motion.p
                  className="absolute inset-x-0 bottom-[23%] text-center font-hand text-[clamp(1.3rem,3.6vw,2.2rem)] leading-tight text-ink"
                  initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{ delay: 1.4, duration: 1.8, ease: "easeInOut" }}
                >
                  contigo, todo es <span className="text-pink">especial</span>
                </motion.p>
                {/* fichas TE AMO */}
                <div className="absolute inset-x-0 bottom-[8%] flex justify-center gap-[1.5%]">
                  {["T", "E", "", "A", "M", "O"].map((l, i) =>
                    l ? (
                      <motion.span
                        key={i}
                        className="grid aspect-square w-[9%] place-items-center rounded-[5px] bg-[#f6ead7] font-display text-[clamp(0.75rem,2vw,1.15rem)] font-semibold text-ink shadow-[0_3px_0_#d8c3a3,0_6px_10px_-4px_rgb(28_27_58/0.35)]"
                        initial={reduce ? false : { y: 24, opacity: 0, rotate: -12 }}
                        animate={{ y: 0, opacity: 1, rotate: (i % 2 ? 1 : -1) * 3 }}
                        transition={{ delay: 2.6 + i * 0.12, type: "spring", damping: 10, stiffness: 180 }}
                      >
                        {l}
                      </motion.span>
                    ) : (
                      <span key={i} className="w-[3%]" />
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Foco con corazón */}
      <motion.div style={near} className="absolute left-[1%] top-[1%] w-[22%]">
        <motion.div {...appear(0.4)} className="relative animate-float [--r:-8deg]">
          <div className="absolute inset-[10%] animate-pulse rounded-full bg-butter/50 blur-2xl" />
          <Bulb className="relative w-full drop-shadow-[0_10px_14px_rgb(28_27_58/0.18)]" />
        </motion.div>
      </motion.div>

      {/* Frasco con cintas */}
      <motion.div style={near} className="absolute bottom-[3%] right-[0%] w-[22%]">
        <motion.div {...appear(0.65)} className="animate-float [--r:6deg] [animation-delay:1.2s]">
          <Jar className="w-full drop-shadow-[0_16px_18px_rgb(28_27_58/0.25)]" />
        </motion.div>
      </motion.div>

      {/* Regalo */}
      <motion.div style={near} className="absolute bottom-[1%] left-[1%] w-[26%]">
        <motion.div {...appear(0.8)} className="animate-float-slow [--r:-4deg]">
          <GiftBox className="w-full drop-shadow-[0_16px_18px_rgb(28_27_58/0.25)]" />
        </motion.div>
      </motion.div>

      {/* Etiqueta hecho a mano */}
      <motion.div style={mid} className="absolute right-[2%] top-[7%]">
        <motion.div
          {...appear(1.1)}
          className="rotate-[8deg] rounded-full bg-ink px-4 py-2 font-hand text-lg leading-none text-cream shadow-lift"
        >
          hecho a mano ♡
        </motion.div>
      </motion.div>
    </div>
  );
}
