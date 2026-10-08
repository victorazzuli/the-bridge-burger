"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV, SITE, waLink } from "@/data/site";
import { useCart } from "@/hooks/useCart";
import { IconBag, IconClose, IconInstagram, IconMenu, IconWhatsApp } from "@/components/ui/Icons";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { brl, cx } from "@/utils/format";

export function Header() {
  const { count, subtotal, setCartOpen, bump } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [menu]);

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 h-[var(--header-h)] transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || menu ? "border-b border-text/10 bg-bg/80 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <div className="container-x flex h-full items-center justify-between gap-6">
          <a href="#topo" aria-label="The Bridge Burger, voltar ao início" className="shrink-0" onClick={() => setMenu(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-horizontal.svg" alt="" width={168} height={40} className="h-9 w-auto sm:h-10" />
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="relative rounded-full px-4 py-2 text-[15px] text-text/80 transition-colors hover:text-text after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={count ? `Meu pedido: ${count} ${count === 1 ? "item" : "itens"}, ${brl(subtotal)}` : "Meu pedido, vazio"}
              className="relative inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-text/15 px-3 text-sm transition-colors hover:border-text/40"
            >
              <IconBag size={20} />
              <span className="hidden tabular-nums sm:inline">{count ? brl(subtotal) : "Pedido"}</span>
              {count > 0 && (
                <span key={bump} className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-bump place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-ink">
                  {count}
                </span>
              )}
            </button>
            <a href="#cardapio" className="btn-primary hidden min-h-[44px] px-5 text-sm lg:inline-flex">
              Pedir agora
            </a>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-text/15 lg:hidden"
              aria-label={menu ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menu}
              aria-controls="menu-mobile"
              onClick={() => setMenu((m) => !m)}
            >
              {menu ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col bg-bg px-4 pb-[calc(var(--dock-h)+24px)] pt-[calc(var(--header-h)+28px)] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <nav aria-label="Menu móvel">
              <ul className="space-y-1">
                {NAV.map((n, i) => (
                  <motion.li key={n.href} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                    <a href={n.href} onClick={() => setMenu(false)} className="display block py-2 text-[3.4rem] text-text active:text-primary">
                      {n.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto space-y-4">
              <OpenBadge />
              <div className="flex gap-3">
                <a href={waLink("Olá, The Bridge! Quero fazer um pedido.")} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">
                  <IconWhatsApp size={18} /> WhatsApp
                </a>
                <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">
                  <IconInstagram size={18} /> Instagram
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
