import { type ReactNode } from "react";
import { cx } from "../utils";

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Usually one primary Button. */
  action?: ReactNode;
  className?: string;
}

/** What to show when there's nothing yet, with a way forward. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cx("lm-empty", className)}>
      {icon && <div className="lm-empty__icon">{icon}</div>}
      <p className="lm-empty__title">{title}</p>
      {description && <p className="lm-empty__description">{description}</p>}
      {action && <div className="lm-empty__action">{action}</div>}
    </div>
  );
}

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  /** Number of text lines to draw. */
  lines?: number;
  circle?: boolean;
  className?: string;
}

/** Placeholder while content loads. */
export function Skeleton({ width, height = "0.875rem", lines, circle, className }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className={cx("lm-skeleton-lines", className)} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="lm-skeleton" style={{ height, width: i === lines - 1 ? "60%" : "100%" }} />
        ))}
      </div>
    );
  }
  return <span aria-hidden="true" className={cx("lm-skeleton", circle && "lm-skeleton--circle", className)} style={{ width, height }} />;
}
