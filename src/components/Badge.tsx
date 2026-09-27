import { type HTMLAttributes } from "react";
import { cx } from "../utils";

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  variant?: "soft" | "outline" | "solid";
  /** Leading status dot. */
  dot?: boolean;
}

/** Short status or count label. */
export function Badge({ tone = "neutral", variant = "soft", dot, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx("lm-badge", `lm-badge--${tone}`, `lm-badge--${variant}`, className)} {...rest}>
      {dot && <span className="lm-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
