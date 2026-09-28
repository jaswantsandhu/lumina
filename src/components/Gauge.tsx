import type { ReactNode } from "react";
import { cx } from "../utils";

export interface GaugeProps {
  value: number;
  max?: number;
  /** Accessible name, e.g. "Plan used". */
  label: string;
  /** Text in the middle (default: the percentage). */
  valueText?: ReactNode;
  /** Small line under the value, e.g. "1.6M of 2M". */
  caption?: ReactNode;
  /** "ring" (full circle, default) or "half" (a semicircle). */
  variant?: "ring" | "half";
  /** Diameter in px (default 120). */
  size?: number;
  /** Fractions of max that turn it warning/danger (default 0.8 / 1); null keeps the accent. */
  thresholds?: { warning?: number; danger?: number } | null;
  className?: string;
}

/** A radial meter for one value against a limit: plan usage, disk, capacity. */
export function Gauge({ value, max = 100, label, valueText, caption, variant = "ring", size = 120, thresholds = { warning: 0.8, danger: 1 }, className }: GaugeProps) {
  const frac = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const tone = thresholds && frac >= (thresholds.danger ?? Infinity) ? "danger" : thresholds && frac >= (thresholds.warning ?? Infinity) ? "warning" : "accent";
  const stroke = Math.max(6, size / 12);
  const r = (size - stroke) / 2;
  const half = variant === "half";
  const sweep = half ? Math.PI : 2 * Math.PI;
  const length = r * sweep;
  const cx0 = size / 2;
  const cy0 = size / 2;
  const arc = (to: number) => {
    const start = half ? Math.PI : -Math.PI / 2;
    const end = start + sweep * to;
    const [x1, y1] = [cx0 + r * Math.cos(start), cy0 + r * Math.sin(start)];
    const [x2, y2] = [cx0 + r * Math.cos(end), cy0 + r * Math.sin(end)];
    if (!half && to >= 0.9999) return `M${cx0},${cy0 - r} A${r},${r} 0 1 1 ${cx0 - 0.01},${cy0 - r}`;
    return `M${x1},${y1} A${r},${r} 0 ${sweep * to > Math.PI ? 1 : 0} 1 ${x2},${y2}`;
  };
  const height = half ? size / 2 + stroke / 2 + 4 : size;
  return (
    <div
      className={cx("lm-gauge", `lm-gauge--${tone}`, half && "lm-gauge--half", className)}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={typeof valueText === "string" ? valueText : `${Math.round(frac * 100)}%`}
      style={{ width: size }}
    >
      <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`} aria-hidden="true">
        <path d={arc(1)} className="lm-gauge__track" strokeWidth={stroke} fill="none" strokeLinecap="round" />
        {frac > 0 && <path d={arc(frac)} className="lm-gauge__bar" strokeWidth={stroke} fill="none" strokeLinecap="round" style={{ strokeDasharray: length, strokeDashoffset: 0 }} />}
      </svg>
      <div className="lm-gauge__center" style={half ? { top: "auto", bottom: 0 } : undefined}>
        <span className="lm-gauge__value">{valueText ?? `${Math.round(frac * 100)}%`}</span>
        {caption && <span className="lm-gauge__caption">{caption}</span>}
      </div>
    </div>
  );
}
