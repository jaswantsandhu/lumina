import type { ReactNode } from "react";
import { cx } from "../utils";

export interface JourneyStop {
  id: string;
  /** Short label under the marker, e.g. "Fee rules". */
  label: ReactNode;
  /** done ✓, active (in progress), todo (open, not started), locked (not available yet). */
  state: "done" | "active" | "todo" | "locked";
  /** What's inside the circle; defaults to the stop's number (✓ when done, 🔒 when locked). */
  marker?: ReactNode;
  /** Accessible name for the stop, e.g. "Day 3: Strings, arrays & money". */
  title?: string;
}

export interface JourneyProps {
  stops: JourneyStop[];
  /** Called with the stop's id when it's chosen. Locked stops can still be chosen (to see when they open). */
  onSelect?: (id: string) => void;
  /** Accessible name for the whole strip, e.g. "Course progress". */
  label: string;
  /** Columns on wide screens (default: the number of stops, at most 10). */
  columns?: number;
  className?: string;
}

const STATE_TEXT = { done: "done", active: "in progress", todo: "not started", locked: "locked" } as const;

/** A row of numbered stops showing progress through a course, a programme or an onboarding path. */
export function Journey({ stops, onSelect, label, columns, className }: JourneyProps) {
  return (
    <ol className={cx("lm-journey", className)} aria-label={label} style={{ ["--lm-journey-cols" as string]: columns ?? Math.min(stops.length, 10) }}>
      {stops.map((s, i) => {
        const marker = s.marker ?? (s.state === "done" ? "✓" : s.state === "locked" ? "🔒" : i + 1);
        const name = `${s.title ?? `Step ${i + 1}`} (${STATE_TEXT[s.state]})`;
        const inner = (
          <>
            <span className="lm-journey__marker" aria-hidden="true">{marker}</span>
            <span className="lm-journey__label">{s.label}</span>
          </>
        );
        return (
          <li key={s.id} className={cx("lm-journey__stop", `lm-journey__stop--${s.state}`)} aria-current={s.state === "active" ? "step" : undefined}>
            {onSelect ? (
              <button type="button" className="lm-journey__button" onClick={() => onSelect(s.id)} aria-label={name}>{inner}</button>
            ) : (
              <span className="lm-journey__button" aria-label={name}>{inner}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
