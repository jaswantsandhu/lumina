import { type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../utils";
import type { Space } from "./Stack";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Smallest column width before columns wrap, e.g. "16rem". Ignored when `columns` is set. */
  min?: string;
  /** Fixed number of columns (collapses to one on phones). */
  columns?: number;
  gap?: Space;
}

/** Responsive grid: as many columns as fit (each at least `min`), or a fixed count. */
export function Grid({ min = "16rem", columns, gap = "4", className, style, ...rest }: GridProps) {
  const template = columns ? `repeat(${columns}, minmax(0, 1fr))` : `repeat(auto-fit, minmax(min(100%, ${min}), 1fr))`;
  return (
    <div
      className={cx("lm-grid", columns ? "lm-grid--fixed" : undefined, className)}
      style={{ gridTemplateColumns: template, gap: `var(--lm-space-${gap})`, ...style } as CSSProperties}
      {...rest}
    />
  );
}
