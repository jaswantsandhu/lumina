import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label next to the box. */
  label?: ReactNode;
  description?: ReactNode;
}

/** A checkbox with an inline label. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, description, className, id, ...rest }, ref) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <label className={cx("lm-check", className)} htmlFor={inputId}>
      <input ref={ref} id={inputId} type="checkbox" className="lm-check__box" {...rest} />
      {(label || description) && (
        <span className="lm-check__text">
          {label && <span className="lm-check__label">{label}</span>}
          {description && <span className="lm-check__description">{description}</span>}
        </span>
      )}
    </label>
  );
});

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

/** An on/off toggle (role="switch") that applies immediately. */
export function Switch({ checked, onCheckedChange, label, disabled, id, className, ...rest }: SwitchProps) {
  const auto = useId();
  const switchId = id ?? auto;
  return (
    <span className={cx("lm-switch", disabled && "lm-switch--disabled", className)}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={rest["aria-label"]}
        disabled={disabled}
        className="lm-switch__track"
        onClick={() => onCheckedChange(!checked)}
      >
        <span className="lm-switch__thumb" />
      </button>
      {label && (
        <label htmlFor={switchId} className="lm-switch__label">
          {label}
        </label>
      )}
    </span>
  );
}
