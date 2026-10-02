"use client";

import { useEffect, useState } from "react";
import { Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { storeLinkReply } from "@/lib/whatsapp";
import { Card } from "./admin-shell";

/** Link público de la tienda (en producción será tu dominio) */
export function useStoreOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  return origin;
}

export function copyText(text: string, okMessage = "Copiado") {
  navigator.clipboard?.writeText(text).then(
    () => toast.success(okMessage, { description: "Pégalo en Facebook, Instagram o WhatsApp." }),
    () => toast.error("No se pudo copiar. Selecciona el texto y cópialo a mano.")
  );
}

/** Mensaje listo para responder consultas en redes y llevarlas a la tienda */
export function QuickReplyCard() {
  const origin = useStoreOrigin();
  const message = origin ? storeLinkReply(`${origin}/tienda`) : "";
  const isLocal = origin.includes("localhost") || origin.includes("127.0.0.1");

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Link2 className="size-5 text-pink" />
        <h2 className="font-display text-2xl">Respuesta rápida</h2>
      </div>
      <p className="mt-1 text-sm text-ink-3">
        Cuando te pregunten por Facebook o Instagram, pega este mensaje: el cliente ve fotos y precios y separa solo.
      </p>
      <p className="mt-4 rounded-2xl bg-paper/70 p-4 text-sm leading-relaxed">{message || "…"}</p>
      <button
        type="button"
        onClick={() => copyText(message, "Mensaje copiado")}
        disabled={!message}
        className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-cream disabled:opacity-40"
      >
        <Copy className="size-4" /> Copiar mensaje
      </button>
      {isLocal && (
        <p className="mt-3 text-xs text-ink-3">
          Ahora el link es de tu computadora (localhost). Cuando publiques la tienda, este mensaje usará tu dominio automáticamente.
        </p>
      )}
      <p className="mt-3 text-xs text-ink-3">Para un producto específico, usa el botón 🔗 en Productos.</p>
    </Card>
  );
}
