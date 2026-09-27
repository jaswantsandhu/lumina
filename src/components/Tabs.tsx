import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../utils";

export interface TabItem {
  value: string;
  label: ReactNode;
  /** e.g. a count Badge. */
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name for the tab list. */
  label?: string;
  className?: string;
}

/** Switches between views. Arrow keys move between tabs. Pair with <TabPanel>. */
export function Tabs({ items, value, onValueChange, label, className }: TabsProps) {
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = items.filter((i) => !i.disabled);
  const onKeyDown = (e: KeyboardEvent) => {
    const i = enabled.findIndex((t) => t.value === value);
    const move = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    const target = e.key === "Home" ? enabled[0] : e.key === "End" ? enabled[enabled.length - 1] : move ? enabled[(i + move + enabled.length) % enabled.length] : undefined;
    if (!target) return;
    e.preventDefault();
    onValueChange(target.value);
    refs.current[target.value]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={cx("lm-tabs", className)} onKeyDown={onKeyDown}>
      {items.map((t) => (
        <button
          key={t.value}
          ref={(el) => {
            refs.current[t.value] = el;
          }}
          type="button"
          role="tab"
          id={`${base}-tab-${t.value}`}
          aria-selected={t.value === value}
          aria-controls={`lm-panel-${t.value}`}
          tabIndex={t.value === value ? 0 : -1}
          disabled={t.disabled}
          className={cx("lm-tabs__tab", t.value === value && "lm-tabs__tab--active")}
          onClick={() => onValueChange(t.value)}
        >
          {t.label}
          {t.badge}
        </button>
      ))}
    </div>
  );
}

/** Content for one tab; renders only when active. */
export function TabPanel({ value, current, children }: { value: string; current: string; children: ReactNode }) {
  if (value !== current) return null;
  return (
    <div role="tabpanel" id={`lm-panel-${value}`} className="lm-tabs__panel" tabIndex={0}>
      {children}
    </div>
  );
}
