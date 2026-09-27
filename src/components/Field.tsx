import { createContext, useContext, useId, type ReactNode } from "react";
import { cx } from "../utils";

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** Controls inside a <Field> pick up its id, description and error state. */
export function useField(): FieldContextValue | null {
  return useContext(FieldContext);
}

export interface FieldProps {
  label: ReactNode;
  /** Help text under the control. */
  hint?: ReactNode;
  /** Error message; marks the control invalid. */
  error?: ReactNode;
  required?: boolean;
  /** Visually hide the label (still read by screen readers). */
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label, hint and error around one form control, wired for accessibility. */
export function Field({ label, hint, error, required = false, hideLabel, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required }}>
      <div className={cx("lm-field", className)}>
        <label htmlFor={id} className={cx("lm-field__label", hideLabel && "lm-visually-hidden")}>
          {label}
          {required && (
            <span className="lm-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {children}
        {error ? (
          <div id={errorId} className="lm-field__error" role="alert">
            {error}
          </div>
        ) : (
          hint && (
            <div id={hintId} className="lm-field__hint">
              {hint}
            </div>
          )
        )}
      </div>
    </FieldContext.Provider>
  );
}
