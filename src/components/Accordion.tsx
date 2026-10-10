import { useId, useRef, useState, type ReactNode } from "react";
import { cx } from "../utils";

export interface AccordionItem {
  /** Unique stable identifier within this accordion. */
  value: string;
  /** Heading and toggle label. */
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow several panels open at once. Defaults to false. */
  multiple?: boolean;
  /** Controlled expanded item values. Single mode uses only the first value. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Heading level for each toggle. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/** Expandable sections with native buttons and optional arrow-key heading navigation. */
export function Accordion({ items, multiple = false, value, defaultValue = [], onValueChange, headingLevel = 3, className }: AccordionProps) {
  const [inner, setInner] = useState(defaultValue);
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const expanded = multiple ? value ?? inner : (value ?? inner).slice(0, 1);
  const enabled = items.filter((item) => !item.disabled);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";
  return <div className={cx("lm-accordion", className)}>{items.map((item, index) => {
    const open = expanded.includes(item.value);
    const triggerId = `${base}-${index}-trigger`;
    const panelId = `${base}-${index}-panel`;
    return <div key={item.value} className="lm-accordion__item">
      <Heading className="lm-accordion__heading"><button type="button" id={triggerId} aria-expanded={open} aria-controls={panelId}
        disabled={item.disabled} className="lm-accordion__trigger" ref={(node) => { refs.current[item.value] = node; }}
        onClick={() => {
          const next = open ? expanded.filter((entry) => entry !== item.value) : multiple ? [...expanded, item.value] : [item.value];
          if (value === undefined) setInner(next);
          onValueChange?.(next);
        }} onKeyDown={(event) => {
          const current = enabled.findIndex((entry) => entry.value === item.value);
          const move = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
          const target = event.key === "Home" ? enabled[0] : event.key === "End" ? enabled[enabled.length - 1] : move ? enabled[(current + move + enabled.length) % enabled.length] : undefined;
          if (!target) return;
          event.preventDefault();
          refs.current[target.value]?.focus();
        }}><span>{item.label}</span><span aria-hidden="true">{open ? "-" : "+"}</span></button></Heading>
      <div id={panelId} aria-labelledby={triggerId} hidden={!open} className="lm-accordion__panel">{item.content}</div>
    </div>;
  })}</div>;
}
