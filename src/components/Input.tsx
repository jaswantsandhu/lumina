import { forwardRef, type AriaAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cx } from "../utils";
import { useField } from "./Field";

// Props a control inherits from its <Field>, unless set explicitly.
function useFieldProps(props: Pick<AriaAttributes, "aria-describedby" | "aria-invalid"> & { id?: string; required?: boolean }) {
  const field = useField();
  return {
    id: props.id ?? field?.id,
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field?.invalid || undefined),
    required: props.required ?? (field?.required || undefined),
  };
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  /** Icon or text at the start, e.g. a search icon. */
  leading?: ReactNode;
  trailing?: ReactNode;
}

/** Single-line text input. Put it inside a <Field> for a label. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ size = "md", leading, trailing, className, ...rest }, ref) {
  const field = useFieldProps(rest);
  const input = <input ref={ref} className={cx("lm-input", `lm-input--${size}`, !leading && !trailing && className)} {...rest} {...field} />;
  if (!leading && !trailing) return input;
  return (
    <div className={cx("lm-input-group", `lm-input--${size}`, className)}>
      {leading && <span className="lm-input-group__adornment">{leading}</span>}
      {input}
      {trailing && <span className="lm-input-group__adornment">{trailing}</span>}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Monospaced, for code or prompts. */
  mono?: boolean;
}

/** Multi-line text input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ mono, className, ...rest }, ref) {
  return <textarea ref={ref} className={cx("lm-input", "lm-textarea", mono && "lm-textarea--mono", className)} {...rest} {...useFieldProps(rest)} />;
});

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "sm" | "md" | "lg";
}

/** Native select with Lumina styling. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ size = "md", className, ...rest }, ref) {
  return <select ref={ref} className={cx("lm-input", "lm-select", `lm-input--${size}`, className)} {...rest} {...useFieldProps(rest)} />;
});
