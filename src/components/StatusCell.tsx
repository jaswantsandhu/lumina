import type { ReactNode } from "react";
import { cx } from "../utils";

export interface StatusCellProps {
  /** success (done), warning (partly), danger (problem), info, neutral (nothing yet). */
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  /** Longer explanation, shown on hover and read by screen readers. */
  title?: string;
  className?: string;
}

/** A compact, coloured value for dense tables and dashboards (e.g. "3/9 · 4/5" per learner per day). */
export function StatusCell({ tone = "neutral", children, title, className }: StatusCellProps) {
  return (
    <span className={cx("lm-status-cell", `lm-status-cell--${tone}`, className)} title={title}>
      {children}
      {title && <span className="lm-visually-hidden">: {title}</span>}
    </span>
  );
}
