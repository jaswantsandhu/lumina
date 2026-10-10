import { cx } from "../utils";

export interface PaginationProps {
  /** Controlled one-based page. Out-of-range values are clamped for display. */
  page: number;
  /** Total pages; zero renders disabled navigation and no page buttons. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Number of adjacent pages shown on each side. Defaults to 1. */
  siblingCount?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Controlled pagination with bounded native buttons and a compact page window. */
export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, label = "Pagination", disabled, className }: PaginationProps) {
  const count = Number.isFinite(pageCount) ? Math.max(0, Math.floor(pageCount)) : 0;
  const current = Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), Math.max(1, count));
  const siblings = Number.isFinite(siblingCount) ? Math.max(0, Math.floor(siblingCount)) : 1;
  const pages = new Set<number>();
  if (count) {
    pages.add(1);
    for (let n = Math.max(1, current - siblings); n <= Math.min(count, current + siblings); n++) pages.add(n);
    pages.add(count);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const change = (next: number) => {
    if (!disabled && count > 0 && next >= 1 && next <= count && next !== current) onPageChange(next);
  };
  return <nav aria-label={label} className={cx("lm-pagination", className)}>
    <button type="button" className="lm-pagination__button" disabled={disabled || !count || current === 1} onClick={() => change(current - 1)}>Previous</button>
    {sorted.map((n, index) => <span key={n} className="lm-pagination__entry">
      {index > 0 && n - sorted[index - 1] > 1 && <span className="lm-pagination__gap" aria-hidden="true">...</span>}
      <button type="button" className="lm-pagination__button" aria-label={`Page ${n}`} aria-current={n === current ? "page" : undefined} disabled={disabled} onClick={() => change(n)}>{n}</button>
    </span>)}
    <button type="button" className="lm-pagination__button" disabled={disabled || !count || current === count} onClick={() => change(current + 1)}>Next</button>
  </nav>;
}
