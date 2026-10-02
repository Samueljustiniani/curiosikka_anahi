"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CheckCheck, Pause, Play } from "lucide-react";
import { GiftBox, Heart, Jar, Scissors, Sparkle, Yarn } from "@/components/ui/illustrations";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const DURATION = 5200;

const STEPS = [
  { title: "Nos cuentas tu idea", text: "Por WhatsApp: para quién es, la fecha y las fotos o frases que quieres usar." },
  { title: "Lo diseñamos contigo", text: "Armamos la propuesta y te la mostramos antes de producir. Nada sale sin tu visto bueno." },
  { title: "Lo hacemos a mano", text: "Cortamos, pegamos, armamos y decoramos cada pieza con cuidado." },
  { title: "Llega tu sorpresa", text: "Listo para la fecha que separaste, con su dedicatoria y todo el cariño." },
];

const ease = [0.16, 1, 0.3, 1] as const;

function Bubble({ me, delay, children }: { me?: boolean; delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease }}
      className={cn(
        "max-w-[82%] rounded-2xl px-3 py-2 text-[0.78rem] leading-snug shadow-sm",
        me ? "ml-auto rounded-br-md bg-[#d9fdd3] text-ink" : "rounded-bl-md bg-white text-ink"
      )}
    >
      {children}
    </motion.div>
  );
}

function SceneChat() {
  return (
    <div className="flex h-full flex-col bg-[#efe7dd]">
      <div className="flex items-center gap-2.5 bg-[#0b5c55] px-4 pb-3 pt-9 text-white">
        <span className="relative size-8 overflow-hidden rounded-full bg-white">
          <Image src="/brand/logo-320.webp" alt="" fill sizes="32px" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Curiosiika</p>
          <p className="text-[0.65rem] opacity-75">en línea</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Bubble me delay={0.3}>¡Hola! Quiero un cuadro para el Día del Novio 💙</Bubble>
        <Bubble delay={1.1}>¡Claro! ✨ Envíanos tus fotos favoritas y la frase que quieras.</Bubble>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5, ease }}
          className="ml-auto grid w-[70%] grid-cols-3 gap-1 rounded-2xl rounded-br-md bg-[#d9fdd3] p-1.5"
        >
          {["#f7a1c4", "#8fd6cf", "#c9a7f0"].map((c) => (
            <span key={c} className="aspect-square rounded-lg" style={{ background: `linear-gradient(150deg,#fff6,${c})` }} />
          ))}
        </motion.div>
        <Bubble me delay={2.8}>
          Y que diga: “contigo todo es especial” <CheckCheck className="ml-1 inline size-3 text-[#34b7f1]" />
        </Bubble>
      </div>
    </div>
  );
}

function SceneDesign() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-[#fbf2e4] p-6">
      <div className="dotted-bg absolute inset-0" />
      <div className="relative w-[78%] rounded-xl bg-[linear-gradient(135deg,#e2bf98,#b4835a)] p-2.5 shadow-lift">
        <div className="relative grid aspect-[4/5] grid-cols-2 gap-2 rounded-md bg-[#fffaf3] p-3 pb-12">
          {["#f7a1c4", "#8fd6cf", "#f9c48d", "#c9a7f0"].map((c, i) => (
            <motion.span
              key={c}
              className="rounded-sm"
              style={{ background: `linear-gradient(150deg,#fff8,${c})` }}
              initial={{ opacity: 0, x: i % 2 ? 60 : -60, y: i < 2 ? -40 : 40, rotate: i % 2 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.35, type: "spring", damping: 14 }}
            />
          ))}
          <motion.p
            className="absolute inset-x-0 bottom-3 text-center font-hand text-xl text-ink"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ delay: 2, duration: 1.2 }}
          >
            contigo todo es especial
          </motion.p>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 3.4, type: "spring", damping: 12 }}
        className="relative mt-5 inline-flex items-center gap-1.5 rounded-full bg-teal px-3.5 py-1.5 text-xs font-bold text-white shadow-lift"
      >
        <Check className="size-3.5" /> Diseño aprobado
      </motion.span>
    </div>
  );
}

function SceneCraft() {
  return (
    <div className="relative h-full overflow-hidden bg-butter-soft">
      <div className="dotted-bg absolute inset-0" />
      <svg viewBox="0 0 200 40" className="absolute left-[8%] right-[8%] top-[34%] w-[84%]">
        <path d="M0 20 Q 50 0 100 20 T 200 20" stroke="#1c1b3a" strokeWidth="2" strokeDasharray="6 6" fill="none" opacity=".35" />
        <motion.path
          d="M0 20 Q 50 0 100 20 T 200 20"
          stroke="#ec4f8f"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.6, ease: "easeInOut", delay: 0.3 }}
        />
      </svg>
      <motion.div
        className="absolute top-[22%] w-[26%]"
        initial={{ left: "2%" }}
        animate={{ left: "70%", rotate: [0, -8, 0, -8, 0] }}
        transition={{ duration: 2.6, ease: "easeInOut", delay: 0.3 }}
      >
        <Scissors className="w-full -rotate-90" />
      </motion.div>
      <motion.div
        className="absolute bottom-[12%] left-[10%] w-[34%]"
        initial={{ x: -120, rotate: -180 }}
        animate={{ x: 0, rotate: 0 }}
        transition={{ delay: 1.2, duration: 1.4, ease }}
      >
        <Yarn className="w-full" />
      </motion.div>
      <motion.div
        className="absolute bottom-[10%] right-[10%] w-[26%]"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 1, ease }}
      >
        <Jar className="w-full" />
      </motion.div>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ left: `${30 + i * 18}%`, top: "52%" }}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: [0, 1.3, 1], rotate: 0 }}
          transition={{ delay: 3 + i * 0.25, duration: 0.5 }}
        >
          <Heart className="size-6" color={["#ec4f8f", "#17a8a0", "#b49be3"][i]} />
        </motion.span>
      ))}
    </div>
  );
}

function SceneSurprise() {
  return (
    <div className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_60%,#fde6ef,#efe8fb_60%,#d2f1ee)]">
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-[55%]"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{ x: Math.cos(angle) * 130, y: Math.sin(angle) * 150 - 40, opacity: [0, 1, 0], scale: 1 }}
            transition={{ delay: 1.3, duration: 1.8, ease: "easeOut" }}
          >
            {i % 3 === 0 ? (
              <Sparkle className="size-4" />
            ) : (
              <Heart className="size-4" color={["#ec4f8f", "#17a8a0", "#b49be3", "#f6c744"][i % 4]} />
            )}
          </motion.span>
        );
      })}
      <div className="relative mt-16 w-[58%]">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -6, 6, -6, 6, 0], y: [0, -4, 0, -4, 0, 0] }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="relative z-10"
        >
          <GiftBox className="w-full" />
        </motion.div>
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.6 }}
          animate={{ y: -120, opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, type: "spring", damping: 11 }}
          className="absolute inset-x-[12%] top-0 z-0 rounded-lg bg-[linear-gradient(135deg,#e2bf98,#b4835a)] p-1.5 shadow-lift"
        >
          <div className="grid aspect-[4/3] grid-cols-2 gap-1 rounded bg-[#fffaf3] p-1.5">
            {["#f7a1c4", "#8fd6cf", "#f9c48d", "#c9a7f0"].map((c) => (
              <span key={c} className="rounded-sm" style={{ background: `linear-gradient(150deg,#fff8,${c})` }} />
            ))}
          </div>
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.3, duration: 0.8, ease }}
        className="absolute bottom-[9%] font-hand text-4xl text-pink-deep"
      >
        ¡Sorpresa!
      </motion.p>
    </div>
  );
}

const SCENES = [SceneChat, SceneDesign, SceneCraft, SceneSurprise];

export function StoryReel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  const go = useCallback((i: number) => {
    setActive((i + STEPS.length) % STEPS.length);
    progressRef.current = 0;
    setProgress(0);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      progressRef.current += (t - last) / DURATION;
      last = t;
      if (progressRef.current >= 1) {
        progressRef.current = 0;
        setActive((a) => (a + 1) % STEPS.length);
      }
      setProgress(progressRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, inView]);

  const Scene = SCENES[active];

  return (
    <section className="relative overflow-hidden bg-paper/70 py-20 sm:py-28">
      <div className="dotted-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1fr_21rem] lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="Así nace tu detalle"
            title="De una idea a una"
            accent="sorpresa"
            description="Todo el proceso es cercano y por WhatsApp. Así trabajamos cada pedido personalizado."
          />
          <ol className="mt-10 space-y-2">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-3xl p-5 text-left transition-all duration-500",
                    active === i ? "bg-white shadow-soft ring-1 ring-ink/5" : "hover:bg-white/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full font-display text-lg font-semibold transition-colors",
                        active === i ? "bg-pink text-white" : "bg-white text-ink-3 ring-1 ring-ink/10"
                      )}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className={cn("font-display text-xl font-medium", active !== i && "text-ink-2")}>{s.title}</p>
                      <AnimatePresence initial={false}>
                        {active === i && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease }}
                            className="overflow-hidden text-sm leading-relaxed text-ink-3"
                          >
                            <span className="block pt-1.5">{s.text}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {active === i && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ink/5">
                      <span className="block h-full bg-pink" style={{ width: `${progress * 100}%` }} />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* "Video" vertical tipo historia */}
        <div ref={ref} className="relative mx-auto w-full max-w-[20rem]">
          <div className="absolute -inset-6 -z-10 rotate-6 rounded-[3rem] bg-gradient-to-br from-pink-soft via-lilac-soft to-teal-soft" />
          <div
            className="relative aspect-[9/16] overflow-hidden rounded-[2.4rem] bg-ink p-2 shadow-lift"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[1.9rem] bg-cream">
              <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
                {STEPS.map((_, i) => (
                  <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-ink/15">
                    <span
                      className="block h-full rounded-full bg-ink"
                      style={{ width: i < active ? "100%" : i === active ? `${progress * 100}%` : "0%" }}
                    />
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="absolute right-3 top-6 z-20 grid size-7 place-items-center rounded-full bg-ink/60 text-white backdrop-blur"
                aria-label={paused ? "Reproducir" : "Pausar"}
              >
                {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
              </button>
              <button type="button" aria-label="Anterior" onClick={() => go(active - 1)} className="absolute inset-y-0 left-0 z-10 w-1/3" />
              <button type="button" aria-label="Siguiente" onClick={() => go(active + 1)} className="absolute inset-y-0 right-0 z-10 w-1/3" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, ease }}
                >
                  {inView && <Scene />}
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink/70 to-transparent p-4 pt-10 text-white">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] opacity-75">Paso {active + 1} de 4</p>
                <p className="font-display text-lg">{STEPS[active].title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
