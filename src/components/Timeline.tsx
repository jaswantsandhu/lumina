import { useState, type ReactNode } from "react";
import { cx } from "../utils";
import { Badge, type Tone } from "./Badge";

export interface TimelineItem {
  id: string;
  /** Leading icon (emoji or svg). */
  icon?: ReactNode;
  title: ReactNode;
  /** Muted one-line text after the title, e.g. a preview. */
  preview?: ReactNode;
  /** A badge after the title, e.g. { label: "running", tone: "info" }. */
  status?: { label: ReactNode; tone?: Tone };
  /** Still happening: the row pulses and the status badge shows a dot. */
  live?: boolean;
  /** Expandable content (shown on click). */
  detail?: ReactNode;
  /** Right-aligned text, e.g. a time. */
  meta?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  /** Accessible name of the list, e.g. "coder's activity". */
  "aria-label": string;
  /** Scroll inside this height instead of growing the page, e.g. "24rem". */
  maxHeight?: string;
  /** Announce new steps to screen readers (for live activity). */
  live?: boolean;
  empty?: ReactNode;
  className?: string;
}

function Row({ item }: { item: TimelineItem }) {
  const [open, setOpen] = useState(false);
  const head = (
    <>
      {item.icon && <span className="lm-timeline__icon" aria-hidden="true">{item.icon}</span>}
      <span className="lm-timeline__title">{item.title}</span>
      {item.status && (
        <Badge tone={item.status.tone ?? "neutral"} dot={item.live}>
          {item.status.label}
        </Badge>
      )}
      {item.preview && <span className="lm-timeline__preview">{item.preview}</span>}
      {item.meta && <span className="lm-timeline__meta">{item.meta}</span>}
    </>
  );
  return (
    <li className={cx("lm-timeline__item", item.live && "lm-timeline__item--live")}>
      {item.detail ? (
        <button type="button" className="lm-timeline__head lm-timeline__head--button" aria-expanded={open} onClick={() => setOpen(!open)}>
          {head}
        </button>
      ) : (
        <div className="lm-timeline__head">{head}</div>
      )}
      {open && item.detail && <div className="lm-timeline__detail">{item.detail}</div>}
    </li>
  );
}

/** A sequence of steps: what an agent did, what happened to a record, a deploy log. */
export function Timeline({ items, maxHeight, live, empty, className, ...rest }: TimelineProps) {
  if (!items.length && empty) return <div className={cx("lm-timeline__empty", className)}>{empty}</div>;
  return (
    <ol className={cx("lm-timeline", className)} style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined} aria-live={live ? "polite" : undefined} {...rest}>
      {items.map((item) => (
        <Row key={item.id} item={item} />
      ))}
    </ol>
  );
}
