"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart, type Line } from "@/hooks/useCart";
import { useDialog } from "@/hooks/useDialog";
import { useOpenStatus } from "@/hooks/useOpenStatus";
import { DELIVERY_FEES, PAYMENTS, type Payment } from "@/data/hours";
import { SITE, waLink } from "@/data/site";
import { feeFor, haversineKm } from "@/utils/delivery";
import { buildMessage, totals, type Checkout } from "@/utils/whatsapp";
import { brl, cx } from "@/utils/format";
import { IconBack, IconBag, IconCheck, IconClose, IconLocate, IconWhatsApp } from "@/components/ui/Icons";
import { Stepper } from "@/components/ui/Stepper";

const FORM_KEY = "tbb:cliente:v1";
type Step = "itens" | "dados" | "enviado";

const emptyForm: Checkout = {
  name: "",
  phone: "",
  mode: "entrega",
  street: "",
  number: "",
  district: "",
  complement: "",
  reference: "",
  payment: "Pix",
  change: "",
  fee: null,
};

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useCart();
  return <AnimatePresence>{cartOpen && <Drawer onClose={() => setCartOpen(false)} />}</AnimatePresence>;
}

function Drawer({ onClose }: { onClose: () => void }) {
  const { lines, setQty, clear, count } = useCart();
  const ref = useDialog<HTMLDivElement>(true, onClose);
  const [step, setStep] = useState<Step>(lines.length ? "itens" : "itens");
  const [form, setForm] = useState<Checkout>(emptyForm);
  const [touched, setTouched] = useState(false);
  const [geo, setGeo] = useState<"idle" | "loading" | "denied" | "error">("idle");
  const status = useOpenStatus();

  // Dados do cliente lembrados neste navegador (conveniência)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FORM_KEY);
      if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw), fee: null, change: "" }));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      const { name, phone, mode, street, number, district, complement, reference, payment } = form;
      localStorage.setItem(FORM_KEY, JSON.stringify({ name, phone, mode, street, number, district, complement, reference, payment }));
    } catch {}
  }, [form]);

  const set = <K extends keyof Checkout>(k: K, v: Checkout[K]) => setForm((f) => ({ ...f, [k]: v }));
  const t = totals(lines, form);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Checkout, string>> = {};
    if (form.name.trim().length < 2) e.name = "Informe seu nome.";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Informe um telefone com DDD.";
    if (form.mode === "entrega") {
      if (form.street.trim().length < 3) e.street = "Informe a rua.";
      if (!form.number.trim()) e.number = "Informe o número.";
      if (form.district.trim().length < 2) e.district = "Informe o bairro.";
    }
    return e;
  }, [form]);

  const locate = () => {
    if (!navigator.geolocation) return setGeo("error");
    setGeo("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("fee", feeFor(haversineKm(pos.coords.latitude, pos.coords.longitude)));
        setGeo("idle");
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const send = () => {
    setTouched(true);
    if (Object.keys(errors).length) {
      const first = Object.keys(errors)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    window.open(waLink(buildMessage(lines, form)), "_blank", "noopener,noreferrer");
    setStep("enviado");
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 36, stiffness: 340 }}
        className="relative flex h-[100dvh] w-full flex-col bg-surface sm:max-w-[480px] sm:border-l sm:border-text/10"
      >
        {/* Topo */}
        <div className="flex h-[var(--header-h)] shrink-0 items-center gap-2 border-b border-text/10 px-4 sm:px-6">
          {step === "dados" && (
            <button type="button" onClick={() => setStep("itens")} className="-ml-2 grid h-11 w-11 place-items-center rounded-full hover:bg-text/10" aria-label="Voltar para os itens">
              <IconBack />
            </button>
          )}
          <h2 id="cart-title" className="display flex-1 text-[2rem]">
            {step === "dados" ? "Entrega e pagamento" : step === "enviado" ? "Pedido enviado" : "Meu pedido"}
          </h2>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full hover:bg-text/10" aria-label="Fechar pedido" data-autofocus>
            <IconClose />
          </button>
        </div>

        {/* Progresso */}
        {step !== "enviado" && lines.length > 0 && (
          <div className="flex gap-1.5 px-4 pt-3 sm:px-6" aria-hidden>
            <span className="h-1 flex-1 rounded-full bg-primary" />
            <span className={cx("h-1 flex-1 rounded-full transition-colors duration-500", step === "dados" ? "bg-primary" : "bg-text/15")} />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <AnimatePresence mode="wait" initial={false}>
            {step === "itens" && (
              <motion.div key="itens" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                {lines.length === 0 ? (
                  <Empty onClose={onClose} />
                ) : (
                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {lines.map((l) => (
                        <motion.li key={l.key} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, height: 0, marginTop: 0 }} transition={{ duration: 0.3 }}>
                          <LineRow l={l} onQty={(q) => setQty(l.key, q)} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </motion.div>
            )}

            {step === "dados" && (
              <motion.form
                key="dados"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
                id="checkout"
              >
                <Segmented
                  label="Como você quer receber?"
                  value={form.mode}
                  onChange={(v) => set("mode", v as Checkout["mode"])}
                  options={[
                    { value: "entrega", label: "Entrega" },
                    { value: "retirada", label: "Retirar na loja" },
                  ]}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="name" label="Nome" value={form.name} onChange={(v) => set("name", v)} error={touched ? errors.name : undefined} autoComplete="name" />
                  <Field id="phone" label="Telefone / WhatsApp" value={form.phone} onChange={(v) => set("phone", v)} error={touched ? errors.phone : undefined} autoComplete="tel" inputMode="tel" placeholder="(11) 9...." />
                </div>

                {form.mode === "entrega" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_96px] gap-3">
                      <Field id="street" label="Rua" value={form.street} onChange={(v) => set("street", v)} error={touched ? errors.street : undefined} autoComplete="address-line1" />
                      <Field id="number" label="Número" value={form.number} onChange={(v) => set("number", v)} error={touched ? errors.number : undefined} inputMode="numeric" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field id="district" label="Bairro" value={form.district} onChange={(v) => set("district", v)} error={touched ? errors.district : undefined} autoComplete="address-level3" />
                      <Field id="complement" label="Complemento (opcional)" value={form.complement} onChange={(v) => set("complement", v)} />
                    </div>
                    <Field id="reference" label="Ponto de referência (opcional)" value={form.reference} onChange={(v) => set("reference", v)} />

                    {/* Taxa por distância */}
                    <div className="rounded-2xl border border-text/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold">Taxa de entrega</p>
                          <p className="text-sm text-muted">
                            {form.fee?.kind === "band"
                              ? `Estimativa: ${brl(form.fee.fee)} (até ${form.fee.band} km). A casa confirma.`
                              : form.fee?.kind === "out"
                                ? `Você está a uns ${form.fee.km.toFixed(1).replace(".", ",")} km. Acima de ${DELIVERY_FEES.at(-1)!.km} km, a casa confirma no WhatsApp.`
                                : `De ${brl(DELIVERY_FEES[0].fee)} a ${brl(DELIVERY_FEES.at(-1)!.fee)}, conforme a distância.`}
                          </p>
                        </div>
                        <button type="button" onClick={locate} disabled={geo === "loading"} className="btn-ghost min-h-[44px] shrink-0 px-4 text-sm">
                          <IconLocate size={16} />
                          {geo === "loading" ? "Calculando…" : form.fee ? "Recalcular" : "Calcular"}
                        </button>
                      </div>
                      {geo === "denied" && <p className="mt-2 text-sm text-muted">Sem acesso à localização. Tudo bem: a taxa vai como “a confirmar”.</p>}
                      {geo === "error" && <p className="mt-2 text-sm text-muted">Não deu para calcular agora. A taxa vai como “a confirmar”.</p>}
                      <ol className="mt-4 grid grid-cols-5 gap-1 text-center text-[11px] text-muted" aria-label="Tabela de taxa por distância">
                        {DELIVERY_FEES.map((b) => (
                          <li key={b.km} className={cx("rounded-lg py-1.5", form.fee?.kind === "band" && form.fee.band === b.km ? "bg-primary text-primary-ink" : "bg-text/[0.05]")}>
                            <span className="block font-semibold">até {b.km} km</span>
                            {brl(b.fee).replace(",00", "")}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-2xl border border-text/10 p-4 text-[15px] text-muted">
                    Retirada em <span className="text-text">{SITE.fullAddress}</span>.
                  </p>
                )}

                <fieldset>
                  <legend className="mb-3 text-[15px] font-semibold">Forma de pagamento</legend>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENTS.map((p) => (
                      <label key={p} className={cx("cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary", form.payment === p ? "border-primary bg-primary text-primary-ink" : "border-text/15 hover:border-text/40")}>
                        <input type="radio" name="payment" value={p} checked={form.payment === p} onChange={() => set("payment", p as Payment)} className="sr-only" />
                        {p}
                      </label>
                    ))}
                  </div>
                  {form.payment === "Dinheiro" && (
                    <div className="mt-4 max-w-[220px]">
                      <Field id="change" label="Troco para (opcional)" value={form.change} onChange={(v) => set("change", v)} inputMode="decimal" placeholder="R$ 100" />
                    </div>
                  )}
                </fieldset>

                {status && !status.open && (
                  <p className="rounded-2xl bg-text/[0.05] p-4 text-sm text-muted">
                    {status.label}. Você pode enviar o pedido mesmo assim: ele chega no WhatsApp da casa.
                  </p>
                )}
              </motion.form>
            )}

            {step === "enviado" && (
              <motion.div key="enviado" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center px-2 pt-10 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-ink">
                  <IconCheck size={36} strokeWidth={2.5} />
                </span>
                <p className="display mt-6 text-[2.6rem]">Agora é no WhatsApp.</p>
                <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-muted">
                  Abrimos a conversa com o pedido pronto. Toque em enviar por lá e a casa confirma o total e o tempo de entrega.
                </p>
                <a href={waLink(buildMessage(lines, form))} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-8">
                  <IconWhatsApp size={18} /> Abrir de novo
                </a>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setStep("itens");
                    onClose();
                  }}
                  className="mt-3 text-sm text-muted underline underline-offset-4 hover:text-text"
                >
                  Começar um pedido novo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rodapé com totais */}
        {step !== "enviado" && lines.length > 0 && (
          <div className="safe-bottom shrink-0 border-t border-text/10 bg-surface px-4 pt-4 sm:px-6 sm:pb-6">
            <dl className="space-y-1.5 text-[15px]">
              <div className="flex justify-between text-muted">
                <dt>Subtotal ({count} {count === 1 ? "item" : "itens"})</dt>
                <dd className="tabular-nums">{brl(t.subtotal)}</dd>
              </div>
              {step === "dados" && (
                <div className="flex justify-between text-muted">
                  <dt>Entrega</dt>
                  <dd className="tabular-nums">{form.mode === "retirada" ? "Retirada" : form.fee?.kind === "band" ? `${brl(form.fee.fee)}*` : "a confirmar"}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-1">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-[1.9rem] font-bold leading-none tabular-nums text-primary">
                  {brl(step === "dados" ? t.total : t.subtotal)}
                  {(t.hasUnpriced || (step === "dados" && !t.deliveryKnown)) && <span className="ml-1 font-sans text-xs font-normal text-muted">+ a confirmar</span>}
                </dd>
              </div>
            </dl>
            {step === "itens" ? (
              <button type="button" onClick={() => setStep("dados")} className="btn-primary mt-4 w-full">
                Continuar pedido
              </button>
            ) : (
              <button type="submit" form="checkout" className="btn-primary mt-4 w-full">
                <IconWhatsApp size={20} />
                Enviar pedido no WhatsApp
              </button>
            )}
            {step === "itens" && (
              <button type="button" onClick={onClose} className="mt-2 w-full py-2 text-sm text-muted hover:text-text">
                Continuar comprando
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function LineRow({ l, onQty }: { l: Line; onQty: (q: number) => void }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-bg/50 p-3">
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-surface-2">
        {l.image ? (
          <Image src={l.image} alt="" fill sizes="72px" className="object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/brand/symbol.svg" alt="" className="absolute inset-0 m-auto h-9 w-9 opacity-40" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold leading-tight">{l.name}</p>
          <p className="shrink-0 text-sm font-semibold tabular-nums">{l.unit == null ? "a confirmar" : brl(l.unit * l.qty)}</p>
        </div>
        {l.picks.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-[13px] leading-snug text-muted">
            {l.picks.map((p) => (
              <li key={`${p.groupId}-${p.optionId}`}>
                {p.qty > 1 ? `${p.qty}× ` : ""}
                {p.option}
                {p.price > 0 && ` (+${brl(p.price * p.qty)})`}
              </li>
            ))}
          </ul>
        )}
        {l.note && <p className="mt-1 text-[13px] italic text-muted">“{l.note}”</p>}
        <div className="mt-2">
          <Stepper size="sm" value={l.qty} min={0} onChange={onQty} label={l.name} trashAtOne />
        </div>
      </div>
    </div>
  );
}

function Empty({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center px-4 pt-14 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full border border-text/15 text-muted">
        <IconBag size={32} />
      </span>
      <p className="display mt-6 text-[2.4rem]">Seu pedido está vazio.</p>
      <p className="mt-2 max-w-[30ch] text-[15px] text-muted">Escolha um burger no cardápio e ele aparece aqui.</p>
      <a href="#cardapio" onClick={onClose} className="btn-primary mt-8">
        Ver cardápio
      </a>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  ...rest
}: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">) {
  return (
    <label className="block" htmlFor={`f-${id}`}>
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input
        id={`f-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `e-${id}` : undefined}
        className={cx(
          "h-12 w-full rounded-xl border bg-bg/60 px-4 text-[16px] text-text placeholder:text-muted/60 focus:outline-none",
          error ? "border-accent" : "border-text/15 focus:border-primary",
        )}
        {...rest}
      />
      {error && (
        <span id={`e-${id}`} className="mt-1 block text-[13px] text-accent">
          {error}
        </span>
      )}
    </label>
  );
}

function Segmented({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[15px] font-semibold">{label}</legend>
      <div className="isolate grid grid-cols-2 gap-1 rounded-full bg-bg/60 p-1">
        {options.map((o) => (
          <label key={o.value} className={cx("relative cursor-pointer rounded-full py-3 text-center text-[15px] font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary", value === o.value ? "text-primary-ink" : "text-text/75")}>
            {value === o.value && <motion.span layoutId="seg" className="absolute inset-0 -z-10 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <input type="radio" name="mode" value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
