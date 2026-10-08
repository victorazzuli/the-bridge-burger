import type { Payment } from "@/data/hours";
import type { Line } from "@/hooks/useCart";
import type { FeeEstimate } from "./delivery";
import { brl } from "./format";

export type Checkout = {
  name: string;
  phone: string;
  mode: "entrega" | "retirada";
  street: string;
  number: string;
  district: string;
  complement: string;
  reference: string;
  payment: Payment;
  change: string;
  fee: FeeEstimate | null;
};

export function totals(lines: Line[], c: Pick<Checkout, "mode" | "fee">) {
  const subtotal = lines.reduce((s, l) => s + (l.unit ?? 0) * l.qty, 0);
  const delivery = c.mode === "entrega" && c.fee?.kind === "band" ? c.fee.fee : 0;
  const deliveryKnown = c.mode === "retirada" || c.fee?.kind === "band";
  return { subtotal, delivery, deliveryKnown, total: subtotal + delivery, hasUnpriced: lines.some((l) => l.unit == null) };
}

const pickText = (p: Line["picks"][number]) =>
  `${p.qty > 1 ? `${p.qty}x ` : ""}${p.option}${p.price ? ` (+${brl(p.price * p.qty)})` : ""}`;

/** Mensagem no formato combinado com a casa (WhatsApp: *negrito*, _itálico_). */
export function buildMessage(lines: Line[], c: Checkout) {
  const t = totals(lines, c);
  const L: string[] = ["*THE BRIDGE BURGER* 🍔", "_Pedido feito pelo site_", "", "*Pedido:*"];
  for (const l of lines) {
    L.push("");
    L.push(`${l.qty}x ${l.name}${l.unit != null ? ` — ${brl(l.unit * l.qty)}` : " — valor a confirmar"}`);
    // Uma linha por grupo: "- Turbine: 2x Bacon (+R$ 9,00), Ovo (+R$ 3,00)"
    const byGroup = new Map<string, Line["picks"]>();
    for (const p of l.picks) byGroup.set(p.group, [...(byGroup.get(p.group) ?? []), p]);
    for (const [g, ps] of byGroup) L.push(`- ${g}: ${ps.map(pickText).join(", ")}`);
    if (l.note?.trim()) L.push(`- _Obs.: ${l.note.trim()}_`);
  }
  L.push("");
  L.push(`*Subtotal:* ${brl(t.subtotal)}${t.hasUnpriced ? " + itens a confirmar" : ""}`);
  if (c.mode === "retirada") L.push("*Entrega:* retirada na loja");
  else if (c.fee?.kind === "band") L.push(`*Entrega:* ${brl(c.fee.fee)} (estimativa até ${c.fee.band} km, confirmar)`);
  else if (c.fee?.kind === "out") L.push(`*Entrega:* a confirmar (cerca de ${c.fee.km.toFixed(1).replace(".", ",")} km da loja)`);
  else L.push("*Entrega:* a confirmar");
  L.push(`*Total:* ${brl(t.total)}${!t.deliveryKnown ? " + entrega" : ""}${t.hasUnpriced ? " + itens a confirmar" : ""}`);
  L.push("");
  L.push(`*Nome:* ${c.name.trim()}`);
  L.push(`*Telefone:* ${c.phone.trim()}`);
  if (c.mode === "entrega") {
    L.push(`*Endereço:* ${c.street.trim()}, ${c.number.trim()}${c.complement.trim() ? ` - ${c.complement.trim()}` : ""} — ${c.district.trim()}`);
    if (c.reference.trim()) L.push(`*Referência:* ${c.reference.trim()}`);
  } else {
    L.push("*Endereço:* vou retirar na loja");
  }
  L.push(`*Pagamento:* ${c.payment}${c.payment === "Dinheiro" && c.change.trim() ? ` (troco para ${c.change.trim()})` : ""}`);
  return L.join("\n");
}
