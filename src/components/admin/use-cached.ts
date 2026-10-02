"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Caché en memoria compartida entre secciones del panel (dura mientras la pestaña esté abierta) */
const store = new Map<string, unknown>();

/**
 * Muestra al instante lo último que se cargó para `key` y lo actualiza en segundo plano.
 * Así, al ir y volver entre secciones del panel no se ve el spinner cada vez.
 */
export function useCached<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setState] = useState<T | undefined>(() => store.get(key) as T | undefined);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    const fresh = await fetcherRef.current();
    store.set(key, fresh);
    setState(fresh);
    return fresh;
  }, [key]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setData = useCallback(
    (updater: T | ((prev: T | undefined) => T)) => {
      setState((prev) => {
        const next = typeof updater === "function" ? (updater as (p: T | undefined) => T)(prev) : updater;
        store.set(key, next);
        return next;
      });
    },
    [key]
  );

  return { data, setData, reload };
}

/** Borra la caché (por ejemplo al cerrar sesión) */
export function clearCache() {
  store.clear();
}
