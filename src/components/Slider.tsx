import { forwardRef, type InputHTMLAttributes } from "react";
import { useField } from "./Field";
import { cx } from "../utils";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "defaultValue"> {
  /** Controlled numeric value. Omit for an uncontrolled range. */
  value?: number;
  /** Initial uncontrolled value. */
  defaultValue?: number;
  /** Minimum value; defaults to 0. */
  min?: number;
  /** Maximum value; defaults to 100. */
  max?: number;
  /** Increment between values; defaults to 1. */
  step?: number;
  /** Receives the native range's numeric value on change. */
  onValueChange?: (value: number) => void;
}

/** Native range with browser keyboard support. Use Field or aria-label for a name. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { className, min = 0, max = 100, step = 1, onValueChange, onChange, ...rest }, ref,
) {
  const field = useField();
  return <input {...rest} ref={ref} type="range" min={min} max={max} step={step}
    id={rest.id ?? field?.id} className={cx("lm-slider", className)}
    aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
    aria-invalid={rest["aria-invalid"] ?? (field?.invalid || undefined)}
    aria-required={rest["aria-required"] ?? (field?.required || undefined)}
    onChange={(event) => { onChange?.(event); onValueChange?.(event.currentTarget.valueAsNumber); }} />;
});
