import type { ReactNode } from "react";
import { cx } from "../utils";

export interface DescriptionItem {
  term: ReactNode;
  description: ReactNode;
  /** Span the full width in the "columns" layout (long values). */
  wide?: boolean;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** "rows" (term beside value, default) or "columns" (a grid of stacked pairs). */
  layout?: "rows" | "columns";
  className?: string;
}

/** Labelled details of one item (a <dl>): status, who, when, source… Empty values show as "—". */
export function DescriptionList({ items, layout = "rows", className }: DescriptionListProps) {
  return (
    <dl className={cx("lm-dl", `lm-dl--${layout}`, className)}>
      {items.map((it, i) => (
        <div key={i} className={cx("lm-dl__item", it.wide && "lm-dl__item--wide")}>
          <dt className="lm-dl__term">{it.term}</dt>
          <dd className="lm-dl__description">{it.description === null || it.description === undefined || it.description === "" ? "—" : it.description}</dd>
        </div>
      ))}
    </dl>
  );
}
