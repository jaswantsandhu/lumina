import { forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { useField } from "./Field";
import { portalTarget, usePopover } from "./popover";
import { cx } from "../utils";

export interface DatePickerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange" | "defaultValue"> {
  /** Controlled date-only YYYY-MM-DD value (years 0001-9999); empty means no selection. */
  value: string;
  /** Receives a date-only string, never a timestamp. */
  onValueChange: (value: string) => void;
  /** Earliest selectable date, inclusive, in YYYY-MM-DD format. */
  min?: string;
  /** Latest selectable date, inclusive, in YYYY-MM-DD format. */
  max?: string;
  /** Text shown when value is empty. */
  placeholder?: string;
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function days(year: number, month: number) {
  return [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
function format(year: number, month: number, day: number) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function valid(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && y >= 1 && m >= 1 && m <= 12 && d >= 1 && d <= days(y, m);
}
function shift(value: string, amount: number, byMonth = false) {
  let [y, m, d] = value.split("-").map(Number);
  if (byMonth) {
    const total = y * 12 + m - 1 + amount;
    y = Math.floor(total / 12); m = total % 12 + 1;
    d = Math.min(d, days(y, m));
  } else {
    d += amount;
    while (d < 1) { m--; if (m < 1) { m = 12; y--; } d += days(y, m); }
    while (d > days(y, m)) { d -= days(y, m); m++; if (m > 12) { m = 1; y++; } }
  }
  return format(y, m, d);
}
function weekday(value: string) {
  let [y, m, d] = value.split("-").map(Number);
  if (m < 3) y--;
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4][m - 1] + d) % 7;
}

/** Calendar popover. Arrows move days/weeks, Home/End move within a week,
 * PageUp/PageDown browse months (Shift browses years), and Enter selects. */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  { value, onValueChange, min, max, placeholder = "Choose date", className, disabled, id, name, onClick, onKeyDown, ...rest }, ref,
) {
  const field = useField();
  const popupId = useId();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement>(null);
  const dateButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("2000-01-01");
  const style = usePopover(open, trigger, popup);
  const lower = min && valid(min) ? min : "0001-01-01";
  const upper = max && valid(max) ? max : "9999-12-31";
  const clamp = (date: string) => date < lower ? lower : date > upper ? upper : date;
  const available = (date: string) => valid(date) && date >= lower && date <= upper;
  const show = () => {
    if (lower > upper) return;
    const now = new Date();
    setActive(clamp(valid(value) ? value : format(now.getFullYear(), now.getMonth() + 1, now.getDate())));
    setOpen(true);
  };
  const close = () => { setOpen(false); trigger.current?.focus(); };
  useEffect(() => {
    if (open) dateButton.current?.focus();
  }, [open, active]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => {
      if (!popup.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    const outsideFocus = (event: FocusEvent) => {
      if (!popup.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("focusin", outsideFocus);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("focusin", outsideFocus);
    };
  }, [open]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useEffect(() => {
    if (lower > upper) setOpen(false);
    else setActive((date) => date < lower ? lower : date > upper ? upper : date);
  }, [lower, upper]);
  const navigate = (event: KeyboardEvent) => {
    let next: string;
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (event.key === "Tab") { setOpen(false); trigger.current?.focus(); return; }
    if (event.key === "ArrowLeft") next = shift(active, -1);
    else if (event.key === "ArrowRight") next = shift(active, 1);
    else if (event.key === "ArrowUp") next = shift(active, -7);
    else if (event.key === "ArrowDown") next = shift(active, 7);
    else if (event.key === "Home") next = shift(active, -weekday(active));
    else if (event.key === "End") next = shift(active, 6 - weekday(active));
    else if (event.key === "PageUp") next = shift(active, event.shiftKey ? -12 : -1, true);
    else if (event.key === "PageDown") next = shift(active, event.shiftKey ? 12 : 1, true);
    else return;
    event.preventDefault();
    if (valid(next)) setActive(clamp(next));
  };
  const [year, month] = active.split("-").map(Number);
  const first = format(year, month, 1);
  const cells = Array.from({ length: Math.ceil((weekday(first) + days(year, month)) / 7) * 7 }, (_, i) => i - weekday(first) + 1);
  return <>
    {name && <input type="hidden" name={name} value={value} disabled={disabled} form={rest.form} />}
    <Button {...rest} id={id ?? field?.id} ref={(el) => {
      trigger.current = el;
      if (typeof ref === "function") ref(el); else if (ref) ref.current = el;
    }} disabled={disabled} className={cx("lm-date-picker", className)}
      aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
      aria-invalid={rest["aria-invalid"] ?? (field?.invalid || undefined)}
      aria-required={rest["aria-required"] ?? (field?.required || undefined)}
      aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? popupId : undefined}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) open ? close() : show(); }}
      onKeyDown={(event) => { onKeyDown?.(event); if (!event.defaultPrevented && event.key === "ArrowDown") { event.preventDefault(); show(); } }}>
      {value || placeholder}
    </Button>
    {open && createPortal(<div ref={popup} id={popupId} role="dialog" aria-label="Choose date" className="lm-date-picker__popover" style={style} onKeyDown={navigate}>
      <div className="lm-date-picker__header">
        <Button size="sm" aria-label="Previous month" disabled={!valid(shift(active, -1, true)) || shift(first, -1, true).slice(0, 7) < lower.slice(0, 7)} onClick={() => setActive(clamp(shift(active, -1, true)))}>&lt;</Button>
        <span id={`${popupId}-month`} aria-live="polite">{months[month - 1]} {year}</span>
        <Button size="sm" aria-label="Next month" disabled={!valid(shift(active, 1, true)) || shift(first, 1, true).slice(0, 7) > upper.slice(0, 7)} onClick={() => setActive(clamp(shift(active, 1, true)))}>&gt;</Button>
      </div>
      <table className="lm-date-picker__calendar" role="grid" aria-labelledby={`${popupId}-month`}>
        <thead><tr>{weekdays.map((day) => <th key={day} scope="col" abbr={day}>{day.slice(0, 2)}</th>)}</tr></thead>
        <tbody>{Array.from({ length: cells.length / 7 }, (_, row) => <tr key={row}>{cells.slice(row * 7, row * 7 + 7).map((day, col) => {
          const date = format(year, month, day);
          return <td key={col} aria-selected={day >= 1 && day <= days(year, month) && date === value}>{day >= 1 && day <= days(year, month) && <button
            ref={date === active ? dateButton : undefined} type="button" className={cx("lm-date-picker__day", date === value && "lm-date-picker__day--selected")}
            aria-label={date} disabled={!available(date)} tabIndex={date === active ? 0 : -1}
            onFocus={() => setActive(date)} onClick={() => { if (available(date)) { onValueChange(date); close(); } }}>{day}</button>}</td>;
        })}</tr>)}</tbody>
      </table>
    </div>, portalTarget(trigger.current) ?? document.body)}
  </>;
});
