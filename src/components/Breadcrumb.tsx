import type { ReactNode } from "react";
import { cx } from "../utils";

export interface BreadcrumbItem {
  /** Visible link or current-page text. */
  label: ReactNode;
  /** Omit for a non-link item. The final item is always the current page. */
  href?: string;
}

export interface BreadcrumbProps {
  /** Ancestors followed by the current page. */
  items: BreadcrumbItem[];
  /** Accessible navigation name. */
  label?: string;
  className?: string;
}

/** Native breadcrumb links; the final item has aria-current="page". */
export function Breadcrumb({ items, label = "Breadcrumb", className }: BreadcrumbProps) {
  return <nav aria-label={label} className={cx("lm-breadcrumb", className)}>
    <ol className="lm-breadcrumb__list">{items.map((item, index) => <li key={index} className="lm-breadcrumb__item">
      {index > 0 && <span aria-hidden="true" className="lm-breadcrumb__separator">/</span>}
      {index === items.length - 1 ? <span aria-current="page">{item.label}</span> : item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
    </li>)}</ol>
  </nav>;
}
