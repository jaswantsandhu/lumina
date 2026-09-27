import { type ReactNode } from "react";
import { cx } from "../utils";
import type { Tone } from "./Badge";

export interface AlertProps {
  tone?: Exclude<Tone, "neutral"> | "neutral";
  title?: ReactNode;
  children?: ReactNode;
  /** Buttons at the end. */
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const icons: Record<string, string> = { success: "✓", warning: "!", danger: "!", info: "i", accent: "i", neutral: "i" };

/** An inline message about the current view. Danger and warning are announced. */
export function Alert({ tone = "info", title, children, action, onDismiss, className }: AlertProps) {
  return (
    <div className={cx("lm-alert", `lm-alert--${tone}`, className)} role={tone === "danger" || tone === "warning" ? "alert" : "status"}>
      <span className="lm-alert__icon" aria-hidden="true">
        {icons[tone]}
      </span>
      <div className="lm-alert__content">
        {title && <p className="lm-alert__title">{title}</p>}
        {children && <div className="lm-alert__body">{children}</div>}
      </div>
      {action && <div className="lm-alert__action">{action}</div>}
      {onDismiss && (
        <button type="button" className="lm-alert__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
