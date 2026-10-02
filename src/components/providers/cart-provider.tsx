"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number | null;
  image: string | null;
  qty: number;
  note: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hasQuote: boolean;
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "qty" | "note"> & { qty?: number; note?: string }, opts?: { silent?: boolean }) => void;
  update: (productId: string, patch: Partial<Pick<CartItem, "qty" | "note">>) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "curiosiika:mi-lista";
const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.productId === "string") : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible: la lista vive solo en memoria */
    }
  }, [items, ready]);

  const add = useCallback<CartContextValue["add"]>((item, opts) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, qty: Math.min(50, i.qty + (item.qty ?? 1)), note: item.note || i.note }
            : i
        );
      }
      return [...prev, { ...item, qty: item.qty ?? 1, note: item.note ?? "" }];
    });
    if (!opts?.silent) setOpen(true);
  }, []);

  const update = useCallback<CartContextValue["update"]>((productId, patch) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, ...patch, qty: Math.max(1, Math.min(50, patch.qty ?? i.qty)) }
          : i
      )
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
    const hasQuote = items.some((i) => i.price === null);
    return { items, count, subtotal, hasQuote, ready, open, setOpen, add, update, remove, clear };
  }, [items, ready, open, add, update, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
