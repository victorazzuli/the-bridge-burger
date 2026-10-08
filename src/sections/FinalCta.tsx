"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { waLink } from "@/data/site";
import { useOpenStatus } from "@/hooks/useOpenStatus";
import { IconWhatsApp } from "@/components/ui/Icons";
import { hm } from "@/utils/format";

const ease = [0.16, 1, 0.3, 1] as const;
const DAY_PREP = ["no domingo", "na segunda", "na terça", "na quarta", "na quinta", "na sexta", "no sábado"];

export function FinalCta() {
  const s = useOpenStatus();
  const line = !s
    ? "A chapa acende de quarta a domingo."
    : s.open
      ? `A chapa está acesa até as ${hm(s.closesAt)}.`
      : s.next
        ? `A chapa acende ${s.next.today ? "hoje" : s.next.tomorrow ? "amanhã" : DAY_PREP[s.next.day]} às ${hm(s.next.time)}.`
        : "A chapa acende de quarta a domingo.";

  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden border-t border-text/10 py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_80%_40%,rgb(var(--primary)/0.16),transparent_70%)]" />
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div className="order-2 lg:order-1">
          <motion.h2
            id="cta-title"
            className="display max-w-[11ch] text-[clamp(3.2rem,8vw,7.6rem)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease }}
          >
            {line}
          </motion.h2>
          <motion.div className="mt-10 flex flex-col gap-3 xs:flex-row" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15, ease }}>
            <a href="#cardapio" className="btn-primary">
              Montar meu pedido
            </a>
            <a href={waLink("Olá, The Bridge! Quero fazer um pedido.")} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <IconWhatsApp size={18} />
              Falar no WhatsApp
            </a>
          </motion.div>
        </div>
        <motion.div
          className="relative order-1 mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-[32px] bg-surface lg:order-2"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.1, ease }}
        >
          <Image src="/img/galeria/molho-escorrendo.jpg" alt="Hambúrguer com bacon e molho escorrendo pelo pão, servido na tábua de madeira" fill sizes="(max-width: 1024px) 90vw, 460px" className="object-cover object-[50%_55%]" />
        </motion.div>
      </div>
    </section>
  );
}
