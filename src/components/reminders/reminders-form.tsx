"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellRing, Check, Loader, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Heart } from "@/components/ui/illustrations";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MONTHS, daysInMonth } from "@/lib/dates";
import { cn, errorMessage, normalizePhone, sanitizePhoneInput } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";
import { useSite } from "@/components/providers/site-provider";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { BRAND } from "@/lib/config";

const LABELS = ["Cumpleaños", "Aniversario", "Cumplemes", "Graduación", "Día especial"];
const ME_KEY = "curiosiika:mis-datos";

type Row = { id: number; label: string; person: string; month: number; day: number };

let rowId = 1;
const newRow = (): Row => ({ id: rowId++, label: "Cumpleaños", person: "", month: 0, day: 0 });

export function RemindersForm() {
  const { whatsapp } = useSite();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rows, setRows] = useState<Row[]>(() => [newRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<Row[] | null>(null);

  useEffect(() => {
    try {
      const me = JSON.parse(window.localStorage.getItem(ME_KEY) || "{}");
      if (me.name) setName(me.name);
      if (me.phone) setPhone(me.phone);
    } catch {}
  }, []);

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const complete = rows.filter((r) => r.label.trim() && r.month && r.day);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return toast.error("Ingresa un celular válido de 9 dígitos.");
    if (complete.length === 0) return toast.error("Completa al menos una fecha (día y mes).");
    try {
      window.localStorage.setItem(ME_KEY, JSON.stringify({ name: name.trim(), phone: cleanPhone }));
    } catch {}

    if (!isSupabaseConfigured) {
      setSaved(complete);
      return;
    }
    setSubmitting(true);
    const { error } = await getSupabaseBrowser().rpc("save_reminders", {
      p_name: name.trim(),
      p_phone: cleanPhone,
      p_items: complete.map((r) => ({ label: r.label.trim(), person_name: r.person.trim(), month: r.month, day: r.day })),
    });
    setSubmitting(false);
    if (error) {
      toast.error(errorMessage(error));
      return;
    }
    setSaved(complete);
  };

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl rounded-[2.5rem] bg-white p-8 text-center shadow-lift ring-1 ring-ink/5 sm:p-12"
      >
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-pink text-white shadow-glow">
          <BellRing className="size-9" />
        </span>
        <h2 className="mt-7 font-display text-4xl font-medium">
          ¡Fechas <em className="text-pink italic">guardadas!</em>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink-3">
          Te escribiremos por WhatsApp unos días antes de cada fecha para que tengas tu detalle a tiempo. ¡No tienes que hacer nada más!
        </p>
        <ul className="mx-auto mt-8 max-w-sm space-y-2 text-left">
          {saved.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3">
              <Heart className="size-4 shrink-0" />
              <span className="flex-1 font-medium">
                {r.label}
                {r.person && <span className="text-ink-3"> · {r.person}</span>}
              </span>
              <span className="text-sm text-ink-3">
                {r.day} {MONTHS[r.month - 1].slice(0, 3)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => { setSaved(null); setRows([newRow()]); }}>
            <Plus className="size-4" /> Agregar más fechas
          </Button>
        </div>
        {!isSupabaseConfigured && (
          <a
            href={waLink(
              `¡Hola ${BRAND.name}! Quiero que me recuerden estas fechas:\n${saved.map((r) => `• ${r.label}${r.person ? ` (${r.person})` : ""}: ${r.day} de ${MONTHS[r.month - 1]}`).join("\n")}`,
              whatsapp
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#178f47]"
          >
            <WhatsAppIcon size={16} /> Enviarlas por WhatsApp
          </a>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl rounded-[2.5rem] bg-white/85 p-5 shadow-lift ring-1 ring-ink/5 backdrop-blur sm:p-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Tu nombre</span>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 80))} className="field" placeholder="¿Cómo te llamas?" autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Celular (WhatsApp)</span>
          <div className="flex items-center rounded-2xl border border-ink/12 bg-white transition focus-within:border-pink focus-within:ring-4 focus-within:ring-pink/10">
            <span className="border-r border-ink/10 px-3.5 text-sm font-semibold text-ink-3">🇵🇪 +51</span>
            <input
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              maxLength={9}
              className="w-full rounded-r-2xl bg-transparent px-3.5 py-3 tracking-wide focus:outline-none"
              placeholder="9XX XXX XXX"
              inputMode="tel"
              autoComplete="tel-national"
            />
          </div>
        </label>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-2xl font-medium">Mis fechas</h2>
        <span className="text-sm text-ink-3">{rows.length}/12</span>
      </div>

      <div className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {rows.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-[1.5rem] bg-paper/70 p-4 ring-1 ring-ink/5">
                <div className="flex flex-wrap gap-1.5">
                  {LABELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => update(r.id, { label: l })}
                      className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition", r.label === l ? "bg-ink text-cream" : "bg-white ring-1 ring-ink/10 hover:ring-ink/30")}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_1fr_0.7fr_auto]">
                  <input
                    value={r.person}
                    onChange={(e) => update(r.id, { person: e.target.value.slice(0, 60) })}
                    className="field"
                    placeholder="¿De quién? Ej: Mamá, mi amor"
                    aria-label="Persona"
                  />
                  <select value={r.month} onChange={(e) => update(r.id, { month: Number(e.target.value) })} className="field cursor-pointer capitalize" aria-label="Mes">
                    <option value={0}>Mes</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1} className="capitalize">
                        {m}
                      </option>
                    ))}
                  </select>
                  <select value={r.day} onChange={(e) => update(r.id, { day: Number(e.target.value) })} className="field cursor-pointer" aria-label="Día">
                    <option value={0}>Día</option>
                    {Array.from({ length: r.month ? daysInMonth(2024, r.month) : 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.id !== r.id) : rs))}
                    disabled={rows.length === 1}
                    className="grid h-12 place-items-center rounded-2xl px-3 text-ink-3 transition hover:bg-blush hover:text-pink-deep disabled:opacity-30"
                    aria-label="Quitar fecha"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => setRows((rs) => (rs.length < 12 ? [...rs, newRow()] : rs))}
        disabled={rows.length >= 12}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-ink/15 py-4 text-sm font-semibold text-ink-2 transition hover:border-pink hover:text-pink-deep disabled:opacity-40"
      >
        <Plus className="size-4" /> Agregar otra fecha
      </button>

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-ink-3">
          Solo usaremos tu número para escribirte sobre tus fechas y pedidos. Tu celular es tu identificación: si vuelves con el mismo número, sumamos tus fechas.
        </p>
        <Button type="submit" variant="pink" size="lg" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
          Guardar mis fechas
        </Button>
      </div>
    </form>
  );
}
