import { forwardRef, useEffect, useId, useRef, useState, type InputHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { cx } from "../utils";
import { useField } from "./Field";
import { portalTarget, usePopover } from "./popover";

export interface MultiSelectOption {
  /** Unique stored value. */
  value: string;
  label?: string;
  disabled?: boolean;
}

export interface MultiSelectProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "type"> {
  /** Controlled selection. */
  value?: string[];
  /** Initial selection when uncontrolled. */
  defaultValue?: string[];
  /** Reports the complete next selection on toggle or chip removal. */
  onValueChange?: (value: string[]) => void;
  /** Available choices; each value must be unique. */
  options: (string | MultiSelectOption)[];
  emptyText?: string;
  /** Applied to the control wrapper; native input attributes go to the input. */
  className?: string;
}

/** Searchable multi-selection. Arrows/Home/End navigate; Enter toggles; Escape closes.
 * Backspace on an empty input removes the last enabled chip. Ref points to the input.
 */
export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(function MultiSelect({ value, defaultValue = [], onValueChange, options, emptyText = "No matches", className, disabled, readOnly, onKeyDown, onFocus, onBlur, id, required, ...rest }, ref) {
  const field = useField();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const interactive = !disabled && !readOnly;
  const shown = open && interactive;
  const style = usePopover(shown, wrap, list, { matchWidth: true });
  const opts = options.map(option => typeof option === "string" ? { value: option } : option);
  const filtered = opts.filter(option => `${option.label ?? ""} ${option.value}`.toLowerCase().includes(query.toLowerCase()));
  const enabled = filtered.filter(option => !option.disabled);
  const active = enabled.find(option => option.value === activeValue) ?? enabled[0];
  const optionId = (option: MultiSelectOption) => `${listId}-${opts.indexOf(option)}`;
  const change = (next: string[]) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  const toggle = (option: MultiSelectOption) => {
    if (!interactive || option.disabled) return;
    change(selected.includes(option.value) ? selected.filter(v => v !== option.value) : [...selected, option.value]);
    setQuery("");
    input.current?.focus();
  };
  const remove = (v: string) => {
    if (interactive && !opts.find(option => option.value === v)?.disabled) change(selected.filter(item => item !== v));
  };
  useEffect(() => {
    input.current?.setCustomValidity((required ?? field?.required) && !selected.length ? "Select at least one option." : "");
  }, [required, field?.required, selected.length]);
  useEffect(() => {
    if (!shown) return;
    const outside = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node) && !list.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [shown]);
  useEffect(() => {
    if (shown && active) document.getElementById(optionId(active))?.scrollIntoView?.({ block: "nearest" });
  }, [shown, active?.value]);
  return <div ref={wrap} className={cx("lm-multi-select", className)}>
    {rest.name && Array.from(new Set(selected)).map(v => <input key={v} type="hidden" name={rest.name} value={v} disabled={disabled} form={rest.form} />)}
    <div className="lm-multi-select__control">
      {Array.from(new Set(selected)).map(v => <span className="lm-multi-select__chip" key={v}>
        {opts.find(option => option.value === v)?.label ?? v}
        <button type="button" className="lm-multi-select__remove" disabled={!interactive || opts.find(option => option.value === v)?.disabled} aria-label={`Remove ${opts.find(option => option.value === v)?.label ?? v}`} onClick={() => { remove(v); input.current?.focus(); }}>x</button>
      </span>)}
      <input {...rest} name={undefined} ref={node => { input.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} id={id ?? field?.id} disabled={disabled} readOnly={readOnly} required={(required ?? field?.required) && !selected.length} aria-required={required ?? field?.required} aria-describedby={rest["aria-describedby"] ?? field?.describedBy} aria-invalid={rest["aria-invalid"] ?? (field?.invalid || undefined)} className="lm-multi-select__input" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={shown} aria-controls={shown ? listId : undefined} aria-activedescendant={shown && active ? optionId(active) : undefined} value={query}
        onChange={event => { setQuery(event.target.value); setActiveValue(null); setOpen(true); }}
        onFocus={event => { onFocus?.(event); if (!event.defaultPrevented && interactive) setOpen(true); }}
        onBlur={event => { onBlur?.(event); if (!wrap.current?.contains(event.relatedTarget as Node) && !list.current?.contains(event.relatedTarget as Node)) setOpen(false); }}
        onKeyDown={event => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.nativeEvent.isComposing || !interactive) return;
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) && (shown || event.key.startsWith("Arrow"))) {
            event.preventDefault();
            setOpen(true);
            const index = active ? enabled.indexOf(active) : -1;
            const next = event.key === "Home" || !shown ? 0 : event.key === "End" ? enabled.length - 1 : event.key === "ArrowDown" ? (index + 1) % enabled.length : (index - 1 + enabled.length) % enabled.length;
            setActiveValue(enabled[next]?.value ?? null);
          } else if (event.key === "Enter" && shown) {
            event.preventDefault();
            if (active) toggle(active);
          } else if (event.key === "Escape" && shown) {
            event.preventDefault(); event.stopPropagation(); setOpen(false); setQuery("");
          } else if (event.key === "Backspace" && !query && selected.length) {
            event.preventDefault();
            const last = [...selected].reverse().find(v => !opts.find(option => option.value === v)?.disabled);
            if (last !== undefined) remove(last);
          }
        }} />
    </div>
    {shown && createPortal(<ul ref={list} id={listId} role="listbox" aria-label={rest["aria-label"] ?? "Options"} aria-multiselectable="true" className="lm-multi-select__list" style={style}>
      {filtered.map(option => <li key={option.value} id={optionId(option)} role="option" aria-selected={selected.includes(option.value)} aria-disabled={option.disabled || undefined} className={cx("lm-multi-select__option", option === active && "lm-multi-select__option--active")} onMouseDown={event => event.preventDefault()} onMouseEnter={() => { if (!option.disabled) setActiveValue(option.value); }} onClick={() => toggle(option)}>{option.label ?? option.value}</li>)}
      {!filtered.length && <li className="lm-multi-select__empty" role="presentation">{emptyText}</li>}
    </ul>, portalTarget(wrap.current) ?? document.body)}
  </div>;
});
