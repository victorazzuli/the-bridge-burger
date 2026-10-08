"use client";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import type { Group, Product } from "@/data/menu";
import { useCart, type Pick } from "@/hooks/useCart";
import { useDialog } from "@/hooks/useDialog";
import { IconCheck, IconClose } from "@/components/ui/Icons";
import { Stepper } from "@/components/ui/Stepper";
import { brl, cx } from "@/utils/format";

type Sel = Record<string, Record<string, number>>;

/** Pré-seleciona o que não custa nada em grupos de escolha única obrigatórios ("Não quero trocar", "1 carne"). */
function initialSel(p: Product): Sel {
  const s: Sel = {};
  for (const g of p.groups ?? []) {
    s[g.id] = {};
    if (g.kind === "single" && g.required) {
      const cheapest = [...g.options].sort((a, b) => a.price - b.price)[0];
      if (cheapest) s[g.id][cheapest.id] = 1;
    }
  }
  return s;
}

const groupTotal = (s: Sel, g: Group) => Object.values(s[g.id] ?? {}).reduce((a, b) => a + b, 0);

export function ProductSheet() {
  const { active, close } = useCart();
  return <AnimatePresence>{active && <Sheet key={active.id} product={active} onClose={close} />}</AnimatePresence>;
}

function Sheet({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const { add } = useCart();
  const ref = useDialog<HTMLDivElement>(true, onClose);
  const drag = useDragControls();
  const [sel, setSel] = useState<Sel>(() => initialSel(p));
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Decide antes do 1º render (a ficha só monta no cliente): trocar a animação no meio deixava a opacidade travada
  const [isMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const groupRefs = useRef<Record<string, HTMLFieldSetElement | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const picks: Pick[] = useMemo(() => {
    const out: Pick[] = [];
    for (const g of p.groups ?? [])
      for (const o of g.options) {
        const q = sel[g.id]?.[o.id] ?? 0;
        if (q > 0) out.push({ groupId: g.id, group: g.short, option: o.name, optionId: o.id, qty: q, price: o.price });
      }
    return out;
  }, [p, sel]);

  const unit = p.price == null ? null : p.price + picks.reduce((s, x) => s + x.price * x.qty, 0);
  const missing = (p.groups ?? []).find((g) => g.required && groupTotal(sel, g) < g.min);

  const setSingle = (g: Group, optionId: string) => {
    setError(null);
    setSel((s) => ({ ...s, [g.id]: { [optionId]: 1 } }));
  };
  const setCount = (g: Group, optionId: string, v: number) => {
    setError(null);
    setSel((s) => {
      const cur = { ...(s[g.id] ?? {}) };
      const others = Object.entries(cur).reduce((a, [k, n]) => (k === optionId ? a : a + n), 0);
      cur[optionId] = Math.max(0, Math.min(v, g.max - others));
      return { ...s, [g.id]: cur };
    });
  };

  const submit = () => {
    if (missing) {
      setError(missing.id);
      // Rola só a lista da ficha (scrollIntoView também rolaria a página atrás no celular)
      const el = groupRefs.current[missing.id];
      const box = scrollRef.current;
      if (el && box) box.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
      return;
    }
    add({ productId: p.id, name: p.name, image: p.image?.src, unit, qty, picks, note: note.trim() || undefined });
    onClose();
  };

  const sheetMotion = isMobile
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "spring" as const, damping: 34, stiffness: 320 } }
    : { initial: { opacity: 0, y: 24, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.98 }, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        {...sheetMotion}
        drag={isMobile ? "y" : false}
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, i) => (i.offset.y > 120 || i.velocity.y > 600) && onClose()}
        className="relative flex max-h-[94svh] w-full flex-col overflow-clip rounded-t-[28px] bg-surface shadow-2xl md:grid md:h-[min(820px,90vh)] md:max-h-none md:max-w-[1040px] md:grid-cols-[1fr_1.05fr] md:grid-rows-[minmax(0,1fr)] md:rounded-[28px]"
      >
        {/* Alça (mobile) */}
        <div className="absolute inset-x-0 top-0 z-20 flex h-7 touch-none justify-center pt-2.5 md:hidden" onPointerDown={(e) => drag.start(e)} aria-hidden>
          <span className="h-1.5 w-12 rounded-full bg-text/40" />
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar" data-autofocus className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-bg/70 text-text backdrop-blur-md transition hover:bg-bg">
          <IconClose />
        </button>

        {/* Foto */}
        <div className="relative h-[34svh] shrink-0 overflow-clip bg-surface-2 md:h-auto" onPointerDown={(e) => isMobile && drag.start(e)}>
          {p.image ? (
            <>
              {/* Desktop: foto inteira sobre um fundo desfocado dela mesma (serve para qualquer proporção) */}
              <Image src={p.image.src} alt="" aria-hidden fill sizes="200px" className="hidden scale-125 object-cover opacity-50 blur-3xl md:block" />
              <motion.div className="absolute inset-0" initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover md:object-contain md:p-8 md:drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]"
                  style={{ objectPosition: p.image.position ?? "50% 50%" }}
                  priority
                />
              </motion.div>
            </>
          ) : (
            <NoPhoto name={p.name} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent md:hidden" aria-hidden />
        </div>

        {/* Conteúdo */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 md:px-8 md:pt-10">
            <h2 id="sheet-title" className="display pr-12 text-[2.6rem] md:text-[3.2rem]">
              {p.name}
            </h2>
            <p className="mt-2 font-display text-2xl font-bold text-primary">
              {unit == null ? "Valor a confirmar" : brl(unit)}
            </p>
            {p.description && <p className="mt-4 text-[15px] leading-relaxed text-muted">{p.description}</p>}
            {p.ingredients && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Ingredientes e itens">
                {p.ingredients.map((i) => (
                  <li key={i} className="rounded-full bg-text/[0.06] px-3 py-1.5 text-[13px] text-text/85">
                    {i}
                  </li>
                ))}
              </ul>
            )}
            {p.price == null && (
              <p className="mt-5 rounded-2xl border border-text/10 p-4 text-sm text-muted">
                Este item está sem preço no cardápio da casa. Ele vai no pedido como <strong className="text-text">valor a confirmar</strong> no WhatsApp.
              </p>
            )}

            {(p.groups ?? []).map((g) => (
              <fieldset
                key={g.id}
                ref={(el) => {
                  groupRefs.current[g.id] = el;
                }}
                className={cx("mt-8 rounded-2xl transition-shadow", error === g.id && "shadow-[0_0_0_2px_rgb(var(--accent))]")}
              >
                <legend className="flex w-full items-baseline justify-between gap-3 pb-3">
                  <span className="text-[17px] font-semibold text-text">{g.name}</span>
                  <span className={cx("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", g.required ? "bg-primary/15 text-primary" : "bg-text/10 text-muted")}>
                    {g.required ? "Obrigatório" : "Opcional"}
                    {g.kind === "count" && ` · ${groupTotal(sel, g)}/${g.max}`}
                  </span>
                </legend>
                {error === g.id && (
                  <p className="mb-3 text-sm text-accent" role="alert">
                    {g.kind === "single" ? "Escolha uma opção." : `Escolha pelo menos ${g.min}.`}
                  </p>
                )}
                <ul className="divide-y divide-text/[0.08] overflow-hidden rounded-2xl border border-text/10">
                  {g.options.map((o) => {
                    const q = sel[g.id]?.[o.id] ?? 0;
                    const full = groupTotal(sel, g) >= g.max;
                    return (
                      <li key={o.id}>
                        {g.kind === "single" ? (
                          <label className={cx("flex min-h-[56px] cursor-pointer items-center gap-3 px-4 transition-colors", q ? "bg-primary/[0.08]" : "hover:bg-text/[0.03]")}>
                            <input type="radio" name={`${p.id}-${g.id}`} checked={!!q} onChange={() => setSingle(g, o.id)} className="peer sr-only" />
                            <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary", q ? "border-primary bg-primary" : "border-text/30")}>
                              {!!q && <IconCheck size={12} className="text-primary-ink" strokeWidth={3} />}
                            </span>
                            <span className="flex-1 text-[15px]">{o.name}</span>
                            <span className="text-sm tabular-nums text-muted">{o.price ? `+ ${brl(o.price)}` : ""}</span>
                          </label>
                        ) : (
                          <div className={cx("flex min-h-[56px] items-center gap-3 py-1.5 pl-4 pr-2 transition-colors", q > 0 && "bg-primary/[0.08]")}>
                            <span className="flex-1 text-[15px]">
                              {o.name}
                              {o.price > 0 && <span className="ml-2 text-sm tabular-nums text-muted">+ {brl(o.price)}</span>}
                            </span>
                            <Stepper size="sm" value={q} label={o.name} onChange={(v) => setCount(g, o.id, v)} max={g.max} disableInc={full} />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}

            <label className="mt-8 block">
              <span className="text-[17px] font-semibold">Alguma observação?</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={140}
                rows={2}
                placeholder="Ex.: sem maionese, sem salada, etc."
                className="mt-3 w-full resize-none rounded-2xl border border-text/15 bg-bg/50 p-4 text-[15px] text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          {/* Rodapé fixo: quantidade + adicionar */}
          <div className="safe-bottom flex items-center gap-3 border-t border-text/10 bg-surface px-5 pt-3 md:px-8 md:pb-5 md:pt-4">
            <Stepper value={qty} onChange={setQty} min={1} label="quantidade" />
            <button type="button" onClick={submit} className="btn-primary flex-1 justify-between px-6">
              <span>Adicionar</span>
              <span className="tabular-nums">{unit == null ? "a confirmar" : brl(unit * qty)}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function NoPhoto({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_30%,rgb(var(--primary)/0.18),transparent_60%)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/symbol.svg" alt="" className="h-24 w-24 opacity-30" />
      <span className="sr-only">{name}</span>
    </div>
  );
}
