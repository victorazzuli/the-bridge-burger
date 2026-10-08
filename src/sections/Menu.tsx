"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORIES, HOUSE_BURGERS, PRODUCTS, productsBy, type CategoryId, type Product } from "@/data/menu";
import { LineItem, PosterCard, RowCard } from "@/components/menu/ProductCard";
import { IconClose, IconSearch } from "@/components/ui/Icons";
import { cx, normalize } from "@/utils/format";

const ease = [0.16, 1, 0.3, 1] as const;

export function Menu() {
  const [active, setActive] = useState<CategoryId>("promocoes");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickLock = useRef(0);

  // Categoria ativa = a última cujo topo já passou da linha logo abaixo da barra fixa
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (Date.now() < clickLock.current) return;
      const line = window.innerHeight * 0.32;
      let current: CategoryId = CATEGORIES[0].id;
      for (const c of CATEGORIES) {
        const el = document.getElementById(`cat-${c.id}`);
        if (el && el.getBoundingClientRect().top <= line) current = c.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [query]);

  // Mantém a aba ativa visível na barra (só rolagem horizontal da barra, nunca da página)
  useEffect(() => {
    const bar = tabsRef.current;
    const tab = bar?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (!bar || !tab) return;
    bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const go = (id: CategoryId) => {
    setQuery("");
    setActive(id);
    clickLock.current = Date.now() + 900;
    requestAnimationFrame(() => document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const q = normalize(query.trim());
  const results = useMemo(() => {
    if (!q) return null;
    const hit = (p: Product) =>
      [p.name, p.description ?? "", ...(p.ingredients ?? []), ...(p.category === "combos" ? HOUSE_BURGERS : [])].some((t) => normalize(t).includes(q));
    return { items: PRODUCTS.filter(hit), burgers: HOUSE_BURGERS.filter((b) => normalize(b).includes(q)) };
  }, [q]);

  return (
    <section id="cardapio" aria-labelledby="cardapio-title" className="relative scroll-mt-0 pb-24 pt-24 sm:pt-32">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="cardapio-title" className="display text-[clamp(4rem,12vw,11rem)]">
            Cardápio
          </h2>
          <p className="max-w-[36ch] pb-3 text-[17px] leading-relaxed text-muted">
            Os preços são os do cardápio oficial da casa. Escolha, ajuste do seu jeito e envie o pedido pronto no WhatsApp.
          </p>
        </div>
      </div>

      {/* Barra de categorias + busca: gruda embaixo do header */}
      <div className="sticky top-[var(--header-h)] z-30 mt-10 border-y border-text/10 bg-bg/85 backdrop-blur-xl">
        <div className="container-x flex items-center gap-3">
          <div ref={tabsRef} className={cx("no-scrollbar -mx-4 flex flex-1 gap-1 overflow-x-auto px-4 py-2.5 sm:mx-0 sm:px-0", searchOpen && "hidden sm:flex")} role="tablist" aria-label="Categorias do cardápio">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active === c.id && !q}
                data-cat={c.id}
                onClick={() => go(c.id)}
                className={cx("relative isolate shrink-0 rounded-full px-4 py-2.5 text-[15px] font-medium transition-colors", active === c.id && !q ? "text-primary-ink" : "text-text/75 hover:text-text")}
              >
                {active === c.id && !q && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-primary" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                {c.id === "artesanais" ? "Artesanais" : c.name}
              </button>
            ))}
          </div>

          <div className={cx("flex items-center", searchOpen ? "flex-1 sm:flex-none" : "")}>
            <label className={cx("relative items-center", searchOpen ? "flex w-full" : "hidden sm:flex")}>
              <span className="sr-only">Buscar no cardápio</span>
              <IconSearch size={18} className="pointer-events-none absolute left-4 text-muted" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar: bacon, brownie, coca…"
                className="h-11 w-full rounded-full border border-text/15 bg-surface pl-11 pr-10 text-[15px] text-text placeholder:text-muted/70 focus:border-primary focus:outline-none sm:w-[280px]"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-2 grid h-8 w-8 place-items-center rounded-full text-muted hover:text-text" aria-label="Limpar busca">
                  <IconClose size={16} />
                </button>
              )}
            </label>
            <button
              type="button"
              className="ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-text/15 sm:hidden"
              aria-label={searchOpen ? "Fechar busca" : "Buscar no cardápio"}
              onClick={() => {
                setSearchOpen((o) => !o);
                if (searchOpen) setQuery("");
                else setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              {searchOpen ? <IconClose size={18} /> : <IconSearch size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="container-x">
        <AnimatePresence mode="wait" initial={false}>
          {results ? (
            <motion.div key="busca" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="pt-10" aria-live="polite">
              <p className="text-sm text-muted">
                {results.items.length ? `${results.items.length} ${results.items.length === 1 ? "item" : "itens"} para “${query.trim()}”` : `Nada encontrado para “${query.trim()}”.`}
              </p>
              {results.burgers.length > 0 && (
                <p className="mt-4 rounded-2xl border border-primary/30 bg-primary/[0.06] p-4 text-[15px]">
                  <strong className="text-primary">{results.burgers.join(", ")}</strong> {results.burgers.length > 1 ? "estão" : "está"} entre os lanches que você escolhe nos combos.
                </p>
              )}
              {results.items.length > 0 ? (
                <ul className="mt-6 grid gap-3 md:grid-cols-2">
                  {results.items.map((p) => (
                    <li key={p.id}>{p.image ? <RowCard p={p} /> : <ul><LineItem p={p} /></ul>}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-6 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} type="button" onClick={() => go(c.id)} className="chip hover:border-primary hover:text-text">
                      Ver {c.name}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="lista" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {CATEGORIES.map((c) => (
                <CategoryBlock key={c.id} id={c.id} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function CategoryHead({ id, title, blurb, count }: { id: string; title: string; blurb?: string; count: number }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 border-b border-text/10 pb-5">
      <div>
        <h3 id={`h-${id}`} className="display text-[clamp(2.6rem,6vw,4.4rem)]">
          {title}
        </h3>
        {blurb && <p className="mt-2 text-[15px] text-muted">{blurb}</p>}
      </div>
      <span className="shrink-0 pb-2 text-sm tabular-nums text-muted">
        {count} {count === 1 ? "item" : "itens"}
      </span>
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay, ease }}>
      {children}
    </motion.div>
  );
}

function CategoryBlock({ id }: { id: CategoryId }) {
  const cat = CATEGORIES.find((c) => c.id === id)!;
  const items = productsBy(id);
  const withPhoto = items.filter((p) => p.image);
  const noPhoto = items.filter((p) => !p.image);

  return (
    <section id={`cat-${id}`} aria-labelledby={`h-${id}`} className="scroll-mt-[calc(var(--header-h)+80px)] pt-16 sm:pt-20">
      <CategoryHead id={id} title={cat.name} blurb={cat.blurb} count={items.length} />

      {id === "promocoes" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <RowCard p={p} large />
            </Reveal>
          ))}
        </div>
      )}

      {id === "combos" && (
        <>
          {/* Mobile: carrossel com swipe. Desktop: três pôsteres. */}
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08} className="w-[82vw] max-w-[380px] shrink-0 snap-center md:w-auto md:max-w-none">
                <PosterCard p={p} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 rounded-[28px] border border-text/10 p-6 sm:p-8">
            <p className="text-[15px] text-muted">Nos combos, você escolhe entre os 11 lanches da casa:</p>
            <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
              {HOUSE_BURGERS.map((b) => (
                <li key={b} className="rounded-full border border-text/15 px-3.5 py-1.5 font-display text-lg font-bold tracking-wide text-text/90">
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        </>
      )}

      {id === "artesanais" && (
        <div className="grid gap-4 md:grid-cols-[minmax(0,420px)_1fr] md:items-stretch">
          {items.map((p) => (
            <Reveal key={p.id}>
              <PosterCard p={p} sizes="(max-width: 768px) 92vw, 420px" />
            </Reveal>
          ))}
          <Reveal delay={0.1} className="flex flex-col justify-end rounded-[28px] bg-surface p-6 sm:p-10">
            <p className="display text-[clamp(2rem,4vw,3.2rem)] text-text">Os outros 11 burgers da casa estão nos combos.</p>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted">
              Bridge Bacon, Bridge 1983, Bridge Jalapeño e os demais aparecem para escolha dentro do 1+1+1, do 3+3 e do 4+2.
            </p>
            <button type="button" onClick={() => document.getElementById("cat-combos")?.scrollIntoView({ behavior: "smooth" })} className="btn-ghost mt-8 self-start">
              Ver combos
            </button>
          </Reveal>
        </div>
      )}

      {id === "acompanhamentos" && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {withPhoto.map((p) => (
            <Reveal key={p.id}>
              <RowCard p={p} large />
            </Reveal>
          ))}
          <Reveal delay={0.08}>
            <ul className="rounded-[22px] bg-surface px-5 py-2">{noPhoto.map((p) => <LineItem key={p.id} p={p} />)}</ul>
          </Reveal>
        </div>
      )}

      {id === "sobremesas" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 0.06}>
              <RowCard p={p} />
            </Reveal>
          ))}
        </div>
      )}

      {id === "bebidas" && (
        <Reveal>
          <ul className="grid rounded-[22px] bg-surface px-5 py-2 md:grid-cols-2 md:gap-x-12">
            {items.map((p) => (
              <LineItem key={p.id} p={p} />
            ))}
          </ul>
        </Reveal>
      )}
    </section>
  );
}
