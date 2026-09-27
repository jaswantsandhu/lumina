import { cx } from "../utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  /** Accessible label; announced to screen readers. */
  label?: string;
  className?: string;
}

/** Indeterminate loading indicator. */
export function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  return (
    <span className={cx("lm-spinner", `lm-spinner--${size}`, className)} role="status">
      <span className="lm-visually-hidden">{label}</span>
    </span>
  );
}
