"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/hooks/useCart";
import { IconBag } from "@/components/ui/Icons";
import { brl, cx } from "@/utils/format";

/**
 * Celular: barra fixa estilo app (Cardápio | Meu pedido).
 * Desktop: botão flutuante "Meu pedido" que aparece depois do hero ou quando há itens.
 */
export function OrderDock() {
  const { count, subtotal, setCartOpen, bump, cartOpen, active } = useCart();
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const on = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const hidden = cartOpen || !!active;

  return (
    <>
      {/* Mobile */}
      <div
        className={cx(
          "safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-text/10 bg-bg/85 px-3 pt-3 backdrop-blur-xl transition-transform duration-500 ease-out lg:hidden",
          hidden && "translate-y-full",
        )}
      >
        <div className="flex gap-2">
          <a href="#cardapio" className="btn-ghost min-h-[52px] flex-1 whitespace-nowrap px-4 text-[15px]">
            Cardápio
          </a>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className={cx("btn min-h-[52px] flex-[1.6] justify-between gap-3 whitespace-nowrap px-5 text-[15px]", count ? "bg-primary text-primary-ink" : "bg-surface-2 text-text")}
          >
            <span className="inline-flex items-center gap-2">
              <span className="relative">
                <IconBag size={20} />
                {count > 0 && (
                  <span key={bump} className="absolute -right-2 -top-2 grid h-[18px] min-w-[18px] animate-bump place-items-center rounded-full bg-primary-ink px-1 text-[10px] font-bold text-primary">
                    {count}
                  </span>
                )}
              </span>
              Meu pedido
            </span>
            <span className="tabular-nums">{count ? brl(subtotal) : ""}</span>
          </button>
        </div>
      </div>

      {/* Desktop */}
      <AnimatePresence>
        {!hidden && (pastHero || count > 0) && (
          <motion.button
            type="button"
            onClick={() => setCartOpen(true)}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="group fixed bottom-8 right-8 z-40 hidden items-center gap-4 rounded-full bg-primary py-3 pl-5 pr-3 text-primary-ink shadow-[0_20px_60px_-15px_rgb(var(--primary)/0.7)] lg:flex"
            aria-label={count ? `Meu pedido: ${count} itens, ${brl(subtotal)}` : "Meu pedido, vazio"}
          >
            <span className="relative">
              <IconBag size={22} />
              {count > 0 && (
                <span key={bump} className="absolute -right-2 -top-2 grid h-[18px] min-w-[18px] animate-bump place-items-center rounded-full bg-primary-ink px-1 text-[10px] font-bold text-primary">
                  {count}
                </span>
              )}
            </span>
            <span className="text-[15px] font-semibold">Meu pedido</span>
            <span className="rounded-full bg-primary-ink/10 px-3 py-1.5 text-sm font-semibold tabular-nums transition-colors group-hover:bg-primary-ink/15">
              {count ? brl(subtotal) : "vazio"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
