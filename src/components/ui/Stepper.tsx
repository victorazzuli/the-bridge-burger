"use client";
import { IconMinus, IconPlus, IconTrash } from "./Icons";
import { cx } from "@/utils/format";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: "sm" | "md";
  /** Mostra lixeira no lugar do "−" quando chegar ao mínimo 1 (carrinho) */
  trashAtOne?: boolean;
  disableInc?: boolean;
};

export function Stepper({ value, onChange, min = 0, max = 99, label, size = "md", trashAtOne, disableInc }: Props) {
  const s = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const showTrash = trashAtOne && value === 1;
  return (
    <div className="inline-flex items-center rounded-full border border-text/15 bg-bg/40" role="group" aria-label={label}>
      <button
        type="button"
        className={cx(s, "grid place-items-center rounded-full text-text transition-colors hover:bg-text/10 active:scale-90 disabled:opacity-30")}
        onClick={() => onChange(value - 1)}
        disabled={!showTrash && value <= min}
        aria-label={showTrash ? `Remover ${label}` : `Diminuir ${label}`}
      >
        {showTrash ? <IconTrash size={16} /> : <IconMinus size={16} />}
      </button>
      <span className={cx("min-w-7 text-center font-semibold tabular-nums", size === "sm" ? "text-sm" : "text-base")} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cx(s, "grid place-items-center rounded-full text-text transition-colors hover:bg-text/10 active:scale-90 disabled:opacity-30")}
        onClick={() => onChange(value + 1)}
        disabled={value >= max || disableInc}
        aria-label={`Aumentar ${label}`}
      >
        <IconPlus size={16} />
      </button>
    </div>
  );
}
