import { useRef, type ReactNode } from "react";
import { cx } from "../utils";

export interface SegmentedControlItem {
  /** Unique stable identifier within this control. */
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  items: SegmentedControlItem[];
  /** Controlled selected value. */
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name for the radio group. */
  label: string;
  disabled?: boolean;
  className?: string;
}

/** Mutually exclusive buttons with roving focus, wrapping arrows, Home and End. */
export function SegmentedControl({ items, value, onValueChange, label, disabled, className }: SegmentedControlProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = items.filter((item) => !disabled && !item.disabled);
  const tabValue = enabled.find((item) => item.value === value)?.value ?? enabled[0]?.value;
  return <div role="radiogroup" aria-label={label} aria-disabled={disabled || undefined} className={cx("lm-segmented-control", className)}>
    {items.map((item) => <button key={item.value} type="button" role="radio" aria-checked={item.value === value}
      disabled={disabled || item.disabled} tabIndex={item.value === tabValue ? 0 : -1} className="lm-segmented-control__item"
      ref={(node) => { refs.current[item.value] = node; }} onClick={() => onValueChange(item.value)}
      onKeyDown={(event) => {
        const index = enabled.findIndex((entry) => entry.value === item.value);
        const move = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
        const target = event.key === "Home" ? enabled[0] : event.key === "End" ? enabled[enabled.length - 1] : move ? enabled[(index + move + enabled.length) % enabled.length] : undefined;
        if (!target) return;
        event.preventDefault();
        refs.current[target.value]?.focus();
        onValueChange(target.value);
      }}>{item.label}</button>)}
  </div>;
}
