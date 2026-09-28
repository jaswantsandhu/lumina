import { forwardRef, useEffect, useId, useMemo, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { portalTarget, usePopover } from "./popover";
import { cx } from "../utils";
import { useField } from "./Field";

// ---------- PasswordInput ----------

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  size?: "sm" | "md" | "lg";
}

/** Password field with a show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput({ size = "md", className, ...rest }, ref) {
  const [shown, setShown] = useState(false);
  const field = useField();
  return (
    <div className={cx("lm-input-group", "lm-password", `lm-input--${size}`, className)}>
      <input
        ref={ref}
        type={shown ? "text" : "password"}
        className={cx("lm-input", `lm-input--${size}`)}
        id={rest.id ?? field?.id}
        aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
        aria-invalid={rest["aria-invalid"] ?? (field?.invalid || undefined)}
        required={rest.required ?? (field?.required || undefined)}
        {...rest}
      />
      <button type="button" className="lm-password__toggle" aria-pressed={shown} aria-label={shown ? "Hide password" : "Show password"} onClick={() => setShown(!shown)}>
        {shown ? "Hide" : "Show"}
      </button>
    </div>
  );
});

// ---------- NumberInput ----------

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"> {
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Whole numbers only unless true. */
  decimal?: boolean;
  /** Unit shown after the value, e.g. "MB" or "tokens". */
  suffix?: ReactNode;
  size?: "sm" | "md" | "lg";
}

/** A number (or empty) with an optional unit; clamps to min/max when you leave the field. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { value, onValueChange, min, max, decimal, suffix, size = "md", className, onBlur, ...rest },
  ref,
) {
  const field = useField();
  const [text, setText] = useState(value == null ? "" : String(value));
  useEffect(() => {
    if (value == null ? text !== "" : Number(text) !== value) setText(value == null ? "" : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const parse = (s: string) => {
    if (s.trim() === "") return null;
    const n = decimal ? Number(s) : Math.trunc(Number(s));
    return Number.isFinite(n) ? n : NaN;
  };
  const input = (
    <input
      ref={ref}
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      className={cx("lm-input", `lm-input--${size}`, "lm-number", !suffix && className)}
      value={text}
      id={rest.id ?? field?.id}
      aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
      aria-invalid={rest["aria-invalid"] ?? (field?.invalid || Number.isNaN(parse(text)) || undefined)}
      required={rest.required ?? (field?.required || undefined)}
      onChange={(e) => {
        setText(e.target.value);
        const n = parse(e.target.value);
        if (!Number.isNaN(n)) onValueChange(n);
      }}
      onBlur={(e) => {
        let n = parse(text);
        if (n != null && !Number.isNaN(n)) {
          if (min != null) n = Math.max(min, n);
          if (max != null) n = Math.min(max, n);
          setText(String(n));
          onValueChange(n);
        }
        onBlur?.(e);
      }}
      {...rest}
    />
  );
  if (!suffix) return input;
  return (
    <div className={cx("lm-input-group", `lm-input--${size}`, className)}>
      {input}
      <span className="lm-input-group__adornment">{suffix}</span>
    </div>
  );
});

// ---------- Combobox ----------

export interface ComboboxOption {
  value: string;
  label?: string;
  description?: string;
}

export interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: (string | ComboboxOption)[];
  /** Allow any typed text, not only listed options (default true). */
  allowCustom?: boolean;
  placeholder?: string;
  loading?: boolean;
  /** Shown when nothing matches. */
  emptyText?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
}

/**
 * Pick from a list or type your own (e.g. a model id). Type to filter; arrow keys
 * move, Enter picks, Escape closes. Follows the ARIA combobox pattern.
 */
export function Combobox({ value, onValueChange, options, allowCustom = true, placeholder, loading, emptyText = "No matches", disabled, size = "md", className, ...rest }: ComboboxProps) {
  const field = useField();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const style = usePopover(open, wrap, list, { matchWidth: true });
  const opts = useMemo(() => options.map((o) => (typeof o === "string" ? { value: o } : o)), [options]);
  // Show the picked option's label, not its raw value (values can be ids).
  const text = query ?? opts.find((o) => o.value === value)?.label ?? value;
  const filtered = useMemo(() => {
    const q = (query ?? "").toLowerCase();
    return q ? opts.filter((o) => o.value.toLowerCase().includes(q) || o.label?.toLowerCase().includes(q)) : opts;
  }, [opts, query]);
  useEffect(() => setActive(0), [query, open]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && !list.current?.contains(e.target as Node) && commit();
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  });
  const pick = (v: string) => {
    onValueChange(v);
    setQuery(null);
    setOpen(false);
  };
  const commit = () => {
    if (query != null && allowCustom) onValueChange(query);
    setQuery(null);
    setOpen(false);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      if (open && filtered[active]) {
        e.preventDefault();
        pick(filtered[active].value);
      } else if (open) {
        e.preventDefault();
        commit();
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setQuery(null);
        setOpen(false);
      }
    }
  };
  const optionId = (i: number) => `${listId}-o${i}`;
  return (
    <div ref={wrap} className={cx("lm-combobox", className)}>
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[active] ? optionId(active) : undefined}
        className={cx("lm-input", `lm-input--${size}`, "lm-combobox__input")}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        id={field?.id}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        aria-label={rest["aria-label"]}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        onBlur={(e) => {
          if (!wrap.current?.contains(e.relatedTarget as Node) && !list.current?.contains(e.relatedTarget as Node)) commit();
        }}
      />
      <button type="button" tabIndex={-1} className="lm-combobox__toggle" aria-label="Show options" disabled={disabled} onClick={() => setOpen(!open)}>
        <span aria-hidden="true" />
      </button>
      {open &&
        createPortal(
        <ul ref={list} id={listId} role="listbox" className="lm-combobox__list" style={style}>
          {loading ? (
            <li className="lm-combobox__empty">Loading…</li>
          ) : filtered.length ? (
            filtered.map((o, i) => (
              <li
                key={o.value}
                id={optionId(i)}
                role="option"
                aria-selected={o.value === value}
                className={cx("lm-combobox__option", i === active && "lm-combobox__option--active")}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o.value)}
              >
                <span>{o.label ?? o.value}</span>
                {o.description && <span className="lm-combobox__description">{o.description}</span>}
              </li>
            ))
          ) : (
            <li className="lm-combobox__empty">{allowCustom && query ? `Use "${query}"` : emptyText}</li>
          )}
        </ul>,
          portalTarget(wrap.current) ?? document.body,
        )}
    </div>
  );
}
