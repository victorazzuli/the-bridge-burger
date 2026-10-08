"use client";
import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { fromPrice, type Product } from "@/data/menu";
import { useCart } from "@/hooks/useCart";
import { IconPlus } from "@/components/ui/Icons";
import { brl, cx } from "@/utils/format";

const priceLabel = (p: Product) => {
  const v = fromPrice(p);
  if (v == null) return "Consulte";
  // "a partir de" só quando o preço vem da escolha obrigatória (ex.: 1 ou 2 carnes)
  return p.price === 0 && v > 0 ? `a partir de ${brl(v)}` : brl(v);
};

/** Itens sem escolha obrigatória entram direto no pedido pelo "+" (com toast); os outros abrem a ficha. */
function useAddFlow(p: Product) {
  const { add, open } = useCart();
  const needsChoice = (p.groups ?? []).some((g) => g.required) || p.price == null;
  const quick = () => (needsChoice ? open(p) : add({ productId: p.id, name: p.name, image: p.image?.src, unit: p.price, qty: 1, picks: [] }));
  return { open: () => open(p), quick, needsChoice };
}

function AddButton({ p, quick, needsChoice, className = "" }: { p: Product; quick: () => void; needsChoice: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        quick();
      }}
      aria-label={needsChoice ? `Escolher opções de ${p.name}` : `Adicionar ${p.name} ao pedido`}
      className={cx(
        "relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-ink shadow-[0_8px_30px_-8px_rgb(var(--primary)/0.8)] transition-transform duration-300 ease-out hover:scale-110 active:scale-90",
        className,
      )}
    >
      <IconPlus size={22} strokeWidth={2.4} />
    </button>
  );
}

/** Pôster: foto grande, nome sobre a imagem. Leve inclinação 3D seguindo o cursor. */
export function PosterCard({ p, sizes = "(max-width: 768px) 85vw, 420px", className = "" }: { p: Product; sizes?: string; className?: string }) {
  const { open, quick, needsChoice } = useAddFlow(p);
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 150, damping: 20 });
  const shineX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const shine = useTransform(shineX, (x) => `radial-gradient(500px circle at ${x} 0%, rgb(var(--primary) / 0.16), transparent 50%)`);

  return (
    <motion.article
      ref={ref}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={cx("group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[28px] bg-surface", className)}
    >
      {p.image && (
        <Image
          src={p.image.src}
          alt={p.image.alt}
          fill
          sizes={sizes}
          className="-z-20 object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
          style={{ objectPosition: p.image.position ?? "50% 50%" }}
        />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: shine }} />
      {p.tag && <span className="absolute left-5 top-5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">{p.tag}</span>}

      <div className="p-5 sm:p-6">
        <h3 className="display text-[2.5rem] sm:text-[2.9rem]">
          <button type="button" onClick={open} className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:rounded-[28px] [&:focus-visible]:after:shadow-[inset_0_0_0_2px_rgb(var(--primary))]">
            {p.name}
          </button>
        </h3>
        {p.description && <p className="mt-2 line-clamp-2 max-w-[38ch] text-[15px] leading-snug text-text/75">{p.description}</p>}
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="font-display text-[1.7rem] font-bold leading-none text-primary">{priceLabel(p)}</span>
          <AddButton p={p} quick={quick} needsChoice={needsChoice} />
        </div>
      </div>
    </motion.article>
  );
}

/** Linha com foto menor à esquerda (fotos de 300–600 px ficam nítidas). */
export function RowCard({ p, large }: { p: Product; large?: boolean }) {
  const { open, quick, needsChoice } = useAddFlow(p);
  return (
    <article className={cx("group relative flex gap-4 rounded-[22px] bg-surface p-3 transition-colors duration-300 hover:bg-surface-2 sm:gap-5", large ? "sm:p-4" : "")}>
      <div className={cx("relative shrink-0 overflow-hidden rounded-[16px] bg-surface-2", large ? "aspect-[3/2] w-[44%] max-w-[300px]" : "aspect-square w-[104px] sm:w-[128px]")}>
        {p.image && (
          <Image
            src={p.image.src}
            alt={p.image.alt}
            fill
            sizes={large ? "(max-width: 640px) 44vw, 300px" : "128px"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            style={{ objectPosition: p.image.position ?? "50% 50%" }}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <h3 className={cx("display", large ? "text-[1.9rem] sm:text-[2.4rem]" : "text-[1.55rem] sm:text-[1.7rem]")}>
          <button type="button" onClick={open} className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:rounded-[22px] [&:focus-visible]:after:shadow-[inset_0_0_0_2px_rgb(var(--primary))]">
            {p.name}
          </button>
        </h3>
        {p.description && <p className={cx("mt-1.5 text-sm leading-snug text-muted", large ? "line-clamp-3" : "line-clamp-2")}>{p.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <span className="font-display text-[1.45rem] font-bold leading-none text-primary">{priceLabel(p)}</span>
          <AddButton p={p} quick={quick} needsChoice={needsChoice} className="h-11 w-11" />
        </div>
      </div>
    </article>
  );
}

/** Sem foto: linha de cardápio impresso com pontilhado. */
export function LineItem({ p }: { p: Product }) {
  const { open, quick, needsChoice } = useAddFlow(p);
  return (
    <li className="group relative flex min-h-[60px] items-center gap-3 border-b border-text/[0.08] py-2 last:border-0">
      <div className="flex min-w-0 flex-1 items-baseline">
        <button type="button" onClick={open} className="truncate text-left text-[16px] font-medium text-text after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:rounded-lg [&:focus-visible]:after:shadow-[inset_0_0_0_2px_rgb(var(--primary))]">
          {p.name}
          {p.description && <span className="ml-2 hidden text-sm font-normal text-muted sm:inline">{p.description}</span>}
        </button>
        <span className="leader" aria-hidden />
        <span className="shrink-0 font-display text-xl font-bold tabular-nums text-primary">{priceLabel(p)}</span>
      </div>
      <button
        type="button"
        onClick={quick}
        aria-label={needsChoice ? `Escolher opções de ${p.name}` : `Adicionar ${p.name} ao pedido`}
        className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-text/20 text-text transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-ink active:scale-90"
      >
        <IconPlus size={18} />
      </button>
    </li>
  );
}
