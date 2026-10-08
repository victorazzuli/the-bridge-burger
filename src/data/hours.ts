/**
 * Horário de funcionamento — cadastro do WhatsMenu (atualizado em 07/10/2026).
 * Conflito conhecido: o RestaurantGuru mostra quinta 18:00–23:00; vale o WhatsMenu, que é o
 * sistema de pedidos da casa. Um post antigo do Instagram (jan/2025) tinha outro horário.
 * Dia: 0 = domingo ... 6 = sábado.
 */
export type Shift = { open: string; close: string };

export const HOURS: Record<number, Shift | null> = {
  0: { open: "18:00", close: "22:00" },
  1: null,
  2: null,
  3: { open: "18:30", close: "23:00" }, // WhatsMenu: 22:59
  4: { open: "18:20", close: "23:00" },
  5: { open: "18:20", close: "23:00" },
  6: { open: "18:00", close: "23:00" },
};

export const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const DAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Ordem de exibição começando na quarta (a semana da casa). */
export const WEEK_ORDER = [3, 4, 5, 6, 0, 1, 2];

/** Taxa de entrega por distância (WhatsMenu). Acima de 5 km não há faixa cadastrada. */
export const DELIVERY_FEES = [
  { km: 1, fee: 4, minutes: 25 },
  { km: 2, fee: 5, minutes: 30 },
  { km: 3, fee: 6, minutes: 30 },
  { km: 4, fee: 9, minutes: 35 },
  { km: 5, fee: 12, minutes: 45 },
];

/** Formas de pagamento ativas no WhatsMenu. */
export const PAYMENTS = ["Pix", "Crédito", "Débito", "Dinheiro", "Vale-refeição", "Vale-alimentação"] as const;
export type Payment = (typeof PAYMENTS)[number];

/** Pedido mínimo (WhatsMenu). */
export const MIN_ORDER = 5;
