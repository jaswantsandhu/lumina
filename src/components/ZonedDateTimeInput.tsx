import { cx } from "../utils";
import { isoToZoned, zonedToISO } from "../time";
import { useField } from "./Field";

export interface ZonedDateTimeInputProps {
  /** UTC ISO string, or null for "not set". */
  value: string | null;
  onChange: (iso: string | null) => void;
  /** IANA time zone the date and time are entered in, e.g. "Asia/Kolkata". */
  timeZone: string;
  /** Time used when only a date is picked (default "09:00"). */
  defaultTime?: string;
  /** Accessible names for the two inputs when not inside a <Field> (default "Date" and "Time"). */
  dateLabel?: string;
  timeLabel?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  /** Show the time zone next to the inputs (default true). */
  showZone?: boolean;
  className?: string;
}

/** A date and a time entered in a given time zone, stored as UTC: schedules, release times, deadlines. */
export function ZonedDateTimeInput({
  value, onChange, timeZone, defaultTime = "09:00", dateLabel = "Date", timeLabel = "Time", size = "md", disabled, showZone = true, className,
}: ZonedDateTimeInputProps) {
  const field = useField();
  const { date, time } = isoToZoned(value, timeZone);
  const set = (d: string, t: string) => onChange(d ? zonedToISO(d, t || defaultTime, timeZone) : null);
  return (
    <span className={cx("lm-zoned", `lm-zoned--${size}`, className)}>
      <input
        id={field?.id}
        type="date"
        className={cx("lm-input", `lm-input--${size}`)}
        value={date}
        onChange={(e) => set(e.target.value, time)}
        aria-label={field ? undefined : dateLabel}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        disabled={disabled}
      />
      <input
        type="time"
        className={cx("lm-input", `lm-input--${size}`)}
        value={time}
        onChange={(e) => set(date, e.target.value)}
        aria-label={timeLabel}
        disabled={disabled || !date}
      />
      {showZone && <span className="lm-zoned__zone">{timeZone}</span>}
    </span>
  );
}
