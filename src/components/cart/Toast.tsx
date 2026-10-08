"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/hooks/useCart";
import { IconCheck } from "@/components/ui/Icons";

/** Confirmação ao adicionar: fica acima da barra do celular e some sozinha. */
export function Toast() {
  const { toast, setCartOpen, cartOpen } = useCart();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--dock-h)+16px)] z-[65] flex justify-center px-4 lg:bottom-28" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && !cartOpen && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex max-w-[440px] items-center gap-3 rounded-full border border-text/10 bg-surface-2/95 py-2 pl-2 pr-2 shadow-2xl backdrop-blur-xl"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-ink">
              <IconCheck size={18} strokeWidth={2.6} />
            </span>
            <span className="min-w-0 truncate text-[15px]">
              <span className="text-muted">Adicionado: </span>
              {toast.text}
            </span>
            <button type="button" onClick={() => setCartOpen(true)} className="shrink-0 rounded-full bg-text px-4 py-2 text-sm font-semibold text-bg transition-transform active:scale-95">
              Ver pedido
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
