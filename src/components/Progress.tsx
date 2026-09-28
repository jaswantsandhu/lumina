import { type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  max?: number;
  /** Accessible name, e.g. "Monthly tokens used". Required unless `label` is shown. */
  "aria-label"?: string;
  /** Visible label above the bar (also its accessible name). */
  label?: ReactNode;
  /** Text on the right of the label, e.g. "4.2k of 2M". */
  valueText?: ReactNode;
  /** Share at which the bar turns warning / danger (0–1). Set to null to keep the accent tone. */
  thresholds?: { warning: number; danger: number } | null;
  size?: "sm" | "md";
}

/**
 * How much of something is used or done: a meter (usage against an allowance) with
 * warning and danger thresholds, or plain progress (thresholds={null}).
 */
export function Progress({ value, max = 100, label, valueText, thresholds = { warning: 0.8, danger: 1 }, size = "md", className, ...rest }: ProgressProps) {
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const tone = !thresholds ? "accent" : share >= thresholds.danger ? "danger" : share >= thresholds.warning ? "warning" : "accent";
  const bar = (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={typeof valueText === "string" ? valueText : undefined}
      aria-label={typeof label === "string" ? label : rest["aria-label"]}
      className={cx("lm-progress", `lm-progress--${size}`, !label && className)}
      {...(label ? {} : rest)}
    >
      <div className={cx("lm-progress__fill", `lm-progress__fill--${tone}`)} style={{ width: `${share * 100}%` }} />
    </div>
  );
  if (!label && !valueText) return bar;
  return (
    <div className={cx("lm-progress-field", className)} {...(label ? rest : {})}>
      <div className="lm-progress-field__head">
        <span className="lm-progress-field__label">{label}</span>
        {valueText && <span className="lm-progress-field__value">{valueText}</span>}
      </div>
      {bar}
    </div>
  );
}
