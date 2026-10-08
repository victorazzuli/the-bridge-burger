"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/menu";

export type Pick = { groupId: string; group: string; option: string; optionId: string; qty: number; price: number };

export type Line = {
  key: string;
  productId: string;
  name: string;
  image?: string;
  /** Preço unitário já com adicionais. null = sem preço cadastrado (valor a confirmar). */
  unit: number | null;
  qty: number;
  picks: Pick[];
  note?: string;
};

export type Toast = { id: number; text: string };

type Ctx = {
  lines: Line[];
  count: number;
  subtotal: number;
  hasUnpriced: boolean;
  add: (l: Omit<Line, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  /** Produto aberto na ficha (modal/sheet) */
  active: Product | null;
  open: (p: Product) => void;
  close: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  toast: Toast | null;
  /** Incrementa a cada adição: usado para animar o contador */
  bump: number;
};

const CartCtx = createContext<Ctx | null>(null);
const STORAGE = "tbb:pedido:v1";

// Mesma escolha = mesma linha (soma quantidade)
const keyOf = (l: Omit<Line, "key" | "qty">) =>
  JSON.stringify([l.productId, l.picks.map((p) => `${p.groupId}:${p.optionId}:${p.qty}`).sort(), (l.note || "").trim().toLowerCase()]);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [bump, setBump] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // O pedido sobrevive a recarregar a página (só neste navegador)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) setLines(parsed.filter((l) => l && typeof l.qty === "number" && l.qty > 0 && typeof l.name === "string"));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(lines));
    } catch {}
  }, [lines, loaded]);

  const add = useCallback((l: Omit<Line, "key">) => {
    const key = keyOf(l);
    setLines((cur) => {
      const i = cur.findIndex((x) => x.key === key);
      if (i >= 0) return cur.map((x, j) => (j === i ? { ...x, qty: Math.min(99, x.qty + l.qty) } : x));
      return [...cur, { ...l, key }];
    });
    setBump((b) => b + 1);
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text: `${l.qty}× ${l.name}` });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setLines((cur) => (qty <= 0 ? cur.filter((x) => x.key !== key) : cur.map((x) => (x.key === key ? { ...x, qty: Math.min(99, qty) } : x))));
  }, []);
  const remove = useCallback((key: string) => setLines((cur) => cur.filter((x) => x.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Ctx>(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + (l.unit ?? 0) * l.qty, 0);
    return {
      lines,
      count,
      subtotal,
      hasUnpriced: lines.some((l) => l.unit == null),
      add,
      setQty,
      remove,
      clear,
      active,
      open: setActive,
      close: () => setActive(null),
      cartOpen,
      setCartOpen,
      toast,
      bump,
    };
  }, [lines, add, setQty, remove, clear, active, cartOpen, toast, bump]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return c;
}
