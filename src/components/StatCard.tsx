import { type ReactNode } from "react";
import { cx } from "../utils";
import { Card } from "./Card";

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Small line under the value, e.g. "145 of 156 finished". */
  hint?: ReactNode;
  /** Change against a previous period, e.g. "+12%"; its tone says whether that is good. */
  trend?: { value: ReactNode; tone?: "positive" | "negative" | "neutral" };
  /** Optional content under everything, e.g. a <Progress>. */
  children?: ReactNode;
  className?: string;
}

/** One number that matters, with its label and context. Use several in a <Grid>. */
export function StatCard({ label, value, hint, trend, children, className }: StatCardProps) {
  return (
    <Card className={cx("lm-stat", className)}>
      <div className="lm-stat__label">{label}</div>
      <div className="lm-stat__row">
        <div className="lm-stat__value">{value}</div>
        {trend && <span className={cx("lm-stat__trend", `lm-stat__trend--${trend.tone ?? "neutral"}`)}>{trend.value}</span>}
      </div>
      {hint && <div className="lm-stat__hint">{hint}</div>}
      {children}
    </Card>
  );
}
