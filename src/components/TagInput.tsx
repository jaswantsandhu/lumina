import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { useField } from "./Field";

export interface TagInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "type"> {
  /** Controlled tags. Values are unique, trimmed, and case-sensitive. */
  value?: string[];
  /** Initial tags when uncontrolled; blank and duplicate entries are removed. */
  defaultValue?: string[];
  /** Reports all tags after an addition or removal; duplicates do not notify. */
  onValueChange?: (value: string[]) => void;
  /** Applied to the control wrapper; native input attributes go to the input. */
  className?: string;
}

/** Freeform tags. Enter or comma commits a trimmed, unique tag; empty Backspace
 * removes the last tag. Escape clears the draft. Ref points to the input.
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput({ value, defaultValue = [], onValueChange, className, disabled, readOnly, onKeyDown, id, required, ...rest }, ref) {
  const field = useField();
  const [internalValue, setInternalValue] = useState(() => Array.from(new Set(defaultValue.map(tag => tag.trim()).filter(Boolean))));
  const tags = value ?? internalValue;
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement | null>(null);
  const interactive = !disabled && !readOnly;
  const change = (next: string[]) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  useEffect(() => {
    input.current?.setCustomValidity((required ?? field?.required) && !tags.length ? "Add at least one tag." : "");
  }, [required, field?.required, tags.length]);
  return <div className={cx("lm-tag-input", className)}>
    {rest.name && Array.from(new Set(tags)).map(tag => <input key={tag} type="hidden" name={rest.name} value={tag} disabled={disabled} form={rest.form} />)}
    {Array.from(new Set(tags)).map(tag => <span key={tag} className="lm-tag-input__tag">{tag}<button type="button" className="lm-tag-input__remove" disabled={!interactive} aria-label={`Remove ${tag}`} onClick={() => { change(tags.filter(item => item !== tag)); input.current?.focus(); }}>x</button></span>)}
    <input {...rest} name={undefined} ref={node => { input.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} id={id ?? field?.id} disabled={disabled} readOnly={readOnly} required={(required ?? field?.required) && !tags.length} aria-required={required ?? field?.required} aria-describedby={rest["aria-describedby"] ?? field?.describedBy} aria-invalid={rest["aria-invalid"] ?? (field?.invalid || undefined)} className="lm-tag-input__input" value={draft} onChange={event => setDraft(event.target.value)}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing || !interactive) return;
        if (event.key === "Enter" || event.key === ",") {
          event.preventDefault();
          const tag = draft.trim();
          if (tag && !tags.includes(tag)) change([...tags, tag]);
          setDraft("");
        } else if (event.key === "Backspace" && !draft && tags.length) {
          event.preventDefault(); change(tags.slice(0, -1));
        } else if (event.key === "Escape" && draft) {
          event.preventDefault(); event.stopPropagation(); setDraft("");
        }
      }} />
  </div>;
});
