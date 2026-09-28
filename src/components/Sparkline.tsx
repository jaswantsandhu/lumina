import { useId } from "react";
import { cx } from "../utils";

export interface SparklineProps {
  data: (number | null)[];
  /** "line" (default), "area" or "bar". */
  type?: "line" | "area" | "bar";
  /** Accessible summary, e.g. "Tokens per day, last 14 days". The range and last value are added. */
  label: string;
  height?: number;
  /** Colour: a tone or any CSS colour (default: the accent). */
  tone?: "accent" | "success" | "warning" | "danger" | "muted" | (string & {});
  /** Mark the last point (line and area). */
  showLast?: boolean;
  className?: string;
}

const TONES: Record<string, string> = {
  accent: "var(--lm-color-accent)",
  success: "var(--lm-color-success)",
  warning: "var(--lm-color-warning)",
  danger: "var(--lm-color-danger)",
  muted: "var(--lm-color-text-muted)",
};

/** A tiny trend chart for stat cards and table cells. Scales to its container's width. */
export function Sparkline({ data, type = "line", label, height = 32, tone = "accent", showLast = true, className }: SparklineProps) {
  const gid = useId().replace(/:/g, "");
  const color = TONES[tone] ?? tone;
  const values = data.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));
  const nums = values.filter((v): v is number => v !== null);
  const W = 100;
  const H = height;
  const pad = 2;
  const min = type === "bar" ? Math.min(0, ...nums) : Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const x = (i: number) => (values.length <= 1 ? W / 2 : pad + (i * (W - pad * 2)) / (values.length - 1));
  const y = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2);
  const last = [...values].reverse().find((v) => v !== null);
  const summary = nums.length ? `${label}: from ${nums[0]} to ${last}, low ${Math.min(...nums)}, high ${max}` : `${label}: no data`;

  let body = null;
  if (nums.length) {
    if (type === "bar") {
      const bw = Math.max(1, (W - pad * 2) / values.length - 1);
      body = values.map((v, i) =>
        v === null ? null : <rect key={i} x={pad + i * ((W - pad * 2) / values.length)} y={Math.min(y(v), y(0))} width={bw} height={Math.max(1, Math.abs(y(v) - y(0)))} fill={color} rx={0.5} />,
      );
    } else {
      const pts = values.map((v, i) => (v === null ? null : `${x(i)},${y(v)}`)).filter(Boolean) as string[];
      const line = `M${pts.join(" L")}`;
      const lastIndex = values.lastIndexOf(last ?? null);
      body = (
        <>
          {type === "area" && (
            <>
              <defs>
                <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={color} stopOpacity={0.3} />
                  <stop offset="1" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d={`${line} L${x(lastIndex)},${H} L${x(values.findIndex((v) => v !== null))},${H} Z`} fill={`url(#${gid})`} />
            </>
          )}
          <path d={line} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          {showLast && last != null && <circle cx={x(lastIndex)} cy={y(last)} r={2.2} fill={color} vectorEffect="non-scaling-stroke" />}
        </>
      );
    }
  }
  return (
    <svg className={cx("lm-sparkline", className)} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" height={height} role="img" aria-label={summary}>
      {body}
    </svg>
  );
}
