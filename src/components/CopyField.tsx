import { useId, useRef, useState, type ReactNode } from "react";
import { cx } from "../utils";
import { Button } from "./Button";

export interface CopyFieldProps {
  /** The text to show and copy (a link, a token, a command). */
  value: string;
  label?: ReactNode;
  /**
   * A note under the value, e.g. "Copy it now: it won't be shown again." With `once`, it's styled as a warning
   * and the value is selected when shown, so it's ready to copy.
   */
  note?: ReactNode;
  /** The value is shown only this once (a secret or one-time link). */
  once?: boolean;
  onCopy?: () => void;
  className?: string;
}

/** A read-only value with a Copy button: invite links, API tokens, join codes, commands. */
export function CopyField({ value, label, note, once, onCopy, className }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const valueRef = useRef<HTMLElement>(null);
  const id = useId();

  const selectValue = () => {
    const el = valueRef.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // No clipboard access (e.g. not HTTPS): select the text so the user can copy it themselves.
      selectValue();
      return;
    }
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cx("lm-copyfield", once && "lm-copyfield--once", className)}>
      {label && (
        <span id={`${id}-label`} className="lm-copyfield__label">
          {label}
        </span>
      )}
      <div className="lm-copyfield__row">
        <code ref={valueRef} className="lm-copyfield__value" aria-labelledby={label ? `${id}-label` : undefined} tabIndex={0} onFocus={selectValue}>
          {value}
        </code>
        <Button size="sm" onClick={copy} aria-label={copied ? "Copied" : `Copy${typeof label === "string" ? ` ${label}` : ""}`}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <span className="lm-visually-hidden" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
      {note && <p className="lm-copyfield__note">{note}</p>}
    </div>
  );
}
