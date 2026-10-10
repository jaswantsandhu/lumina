import { forwardRef, useId, type AriaAttributes, type ReactNode, type Ref } from "react";
import { cx } from "../utils";
import { useField } from "./Field";

export interface RadioOption {
  /** Unique native input value within this group. */
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** Ref to this option's native input. */
  inputRef?: Ref<HTMLInputElement>;
}

/** Supply aria-label or aria-labelledby to name the group. Clicking the Field label focuses its first input. */
export interface RadioGroupProps extends Pick<AriaAttributes, "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-invalid"> {
  options: RadioOption[];
  /** Controlled selected value. */
  value: string;
  onValueChange: (value: string) => void;
  /** Native form field name; defaults to a unique group name. */
  name?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

/** Native radios with browser keyboard behavior. The forwarded ref targets the first input. */
export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(function RadioGroup({ options, value, onValueChange, name, disabled, required, id, className, ...aria }, ref) {
  const auto = useId();
  const field = useField();
  const base = id ?? field?.id ?? auto;
  const describedBy = aria["aria-describedby"] ?? field?.describedBy;
  const invalid = aria["aria-invalid"] ?? (field?.invalid || undefined);
  return <div role="radiogroup" className={cx("lm-radio-group", className)} {...aria} aria-describedby={describedBy} aria-invalid={invalid} aria-required={required ?? field?.required}>
    {options.map((option, index) => <label key={option.value} className="lm-radio-group__option" htmlFor={index === 0 ? base : `${base}-${index}`}>
      <input type="radio" id={index === 0 ? base : `${base}-${index}`} name={name ?? auto} value={option.value}
        ref={(input) => {
          for (const target of [option.inputRef, index === 0 ? ref : undefined]) {
            if (typeof target === "function") target(input);
            else if (target) (target as { current: HTMLInputElement | null }).current = input;
          }
        }}
        className="lm-radio-group__input" checked={value === option.value} disabled={disabled || option.disabled}
        required={required ?? field?.required} aria-labelledby={`${base}-${index}-label`} aria-invalid={invalid} aria-describedby={[describedBy, option.description ? `${base}-${index}-description` : undefined].filter(Boolean).join(" ") || undefined}
        onChange={() => onValueChange(option.value)} />
      <span className="lm-radio-group__text"><span id={`${base}-${index}-label`}>{option.label}</span>{option.description && <span id={`${base}-${index}-description`} className="lm-radio-group__description">{option.description}</span>}</span>
    </label>)}
  </div>;
});
