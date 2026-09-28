import { useEffect, useRef, useState } from "react";
import { cx } from "../utils";

export interface CalendarHeatmapProps {
  /** One entry per day with activity ("YYYY-MM-DD"); missing days count as 0. */
  data: { date: string; value: number }[];
  /** Last day shown (default: today). */
  end?: string;
  /** Weeks shown, ending with `end`'s week. Default: as many as fit the width (up to 53). */
  weeks?: number;
  /** Accessible name, e.g. "Runs per day". */
  label: string;
  /** How a value reads in tooltips, e.g. (v) => `${v} runs`. */
  format?: (value: number) => string;
  /** Monday-first weeks (default true). */
  weekStartsMonday?: boolean;
  className?: string;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * A GitHub-style activity calendar: one square per day, columns are weeks,
 * darker means more. Colours come from the sequential chart palette (follows the accent).
 */
export function CalendarHeatmap({ data, end, weeks: fixedWeeks, label, format = (v) => String(v), weekStartsMonday = true, className }: CalendarHeatmapProps) {
  // Without a fixed number of weeks, fill the container's width (like a year view).
  const box = useRef<HTMLElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  useEffect(() => {
    if (!box.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setBoxWidth(e.contentRect.width));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  const gap = 3;
  const left = 26;
  // More weeks as the width grows (up to a year); then bigger squares (up to 18px) to fill it.
  const weeks = fixedWeeks ?? (boxWidth ? Math.max(4, Math.min(53, Math.floor((boxWidth - left) / 14))) : 26);
  const cell = boxWidth ? Math.max(10, Math.min(18, Math.floor((boxWidth - left) / weeks) - gap)) : 11;
  const endDate = end ? new Date(`${end}T00:00:00Z`) : new Date(`${iso(new Date())}T00:00:00Z`);
  const dow = (d: Date) => (weekStartsMonday ? (d.getUTCDay() + 6) % 7 : d.getUTCDay());
  const start = new Date(endDate.getTime() - ((weeks - 1) * 7 + dow(endDate)) * 864e5);
  const values = new Map(data.map((d) => [d.date, d.value]));
  const max = Math.max(0, ...data.map((d) => d.value));
  // 0 = none, 1-4 = quartiles of the max.
  const level = (v: number) => (v <= 0 || max === 0 ? 0 : Math.min(4, Math.ceil((v / max) * 4)));
  const top = 16;
  const days: { date: string; v: number; col: number; row: number; future: boolean }[] = [];
  for (let d = new Date(start), i = 0; i < weeks * 7; i++, d = new Date(d.getTime() + 864e5)) {
    const date = iso(d);
    days.push({ date, v: values.get(date) ?? 0, col: Math.floor(i / 7), row: i % 7, future: d > endDate });
  }
  // A label where each month starts; drop one that would run into the next.
  const starts = days.filter((d) => d.row === 0 && (d.col === 0 || d.date.slice(8) <= "07")).map((d) => ({ col: d.col, label: MONTHS[Number(d.date.slice(5, 7)) - 1] }));
  const months = starts.filter((m, i) => !starts[i + 1] || starts[i + 1].col - m.col >= 3);
  const total = days.reduce((n, d) => n + d.v, 0);
  const active = days.filter((d) => d.v > 0).length;
  const width = left + weeks * (cell + gap);
  const height = top + 7 * (cell + gap);
  const dayNames = weekStartsMonday ? ["Mon", "", "Wed", "", "Fri", "", ""] : ["", "Mon", "", "Wed", "", "Fri", ""];
  return (
    <figure ref={box as never} className={cx("lm-calendar", className)}>
      <div className="lm-calendar__scroll" tabIndex={0} role="region" aria-label={`${label} (scrolls sideways)`}>
        <svg width={width} height={height} role="img" aria-label={`${label}: ${format(total)} over ${weeks} weeks, on ${active} day${active === 1 ? "" : "s"}`}>
          {months.map((m, i) => (
            <text key={i} x={left + m.col * (cell + gap)} y={10} className="lm-calendar__axis">
              {m.label}
            </text>
          ))}
          {dayNames.map((n, i) =>
            n ? (
              <text key={i} x={0} y={top + i * (cell + gap) + cell - 1} className="lm-calendar__axis">
                {n}
              </text>
            ) : null,
          )}
          {days.map((d) =>
            d.future ? null : (
              <rect key={d.date} x={left + d.col * (cell + gap)} y={top + d.row * (cell + gap)} width={cell} height={cell} rx={2} className={`lm-calendar__day lm-calendar__day--${level(d.v)}`}>
                <title>{`${d.date}: ${format(d.v)}`}</title>
              </rect>
            ),
          )}
        </svg>
      </div>
      <figcaption className="lm-calendar__legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`lm-calendar__key lm-calendar__day--${l}`} aria-hidden="true" />
        ))}
        <span>More</span>
      </figcaption>
    </figure>
  );
}
