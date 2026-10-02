"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/providers/cart-provider";
import { useSite } from "@/components/providers/site-provider";
import { Button, buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { productInquiry, waLink } from "@/lib/whatsapp";
import { BRAND } from "@/lib/config";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const { whatsapp } = useSite();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const outOfStock = product.stock !== null && product.stock <= 0;

  const item = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images[0] ?? null,
    qty,
    note: note.trim(),
  };

  return (
    <div className="space-y-5">
      {product.is_customizable && (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            ¿Qué nombre, fecha o frase lleva? <span className="font-normal text-ink-3">(opcional)</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 300))}
            rows={2}
            placeholder={product.customization_hint || "Ej: “Ana & Luis · 15.03.2022”. Las fotos las envías por WhatsApp."}
            className="field resize-none"
          />
        </label>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="inline-flex h-14 items-center justify-between rounded-full bg-white px-2 ring-1 ring-ink/10 sm:w-36">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-10 place-items-center rounded-full hover:bg-paper disabled:opacity-40"
            disabled={qty <= 1}
            aria-label="Menos"
          >
            <Minus className="size-4" />
          </button>
          <span className="font-display text-lg font-semibold tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(50, q + 1))}
            className="grid size-10 place-items-center rounded-full hover:bg-paper"
            aria-label="Más"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={outOfStock}
          onClick={() => {
            add(item, { silent: true });
            toast.success("Agregado a tu lista", {
              description: product.name,
              action: { label: "Ver lista", onClick: () => router.push("/separar") },
            });
          }}
        >
          <ShoppingBag className="size-4" /> {outOfStock ? "Agotado por ahora" : "Agregar a mi lista"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="pink"
          size="lg"
          disabled={outOfStock}
          onClick={() => {
            add(item, { silent: true });
            router.push("/separar");
          }}
        >
          <CalendarCheck className="size-4" /> Separar ahora
        </Button>
        <a
          href={waLink(
            productInquiry({ name: product.name, price: product.price, url: `${BRAND.siteUrl}/producto/${product.slug}` }),
            whatsapp
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("outline", "lg")}
        >
          <WhatsAppIcon size={18} className="text-[#1fae57]" /> Consultar
        </a>
      </div>
    </div>
  );
}
