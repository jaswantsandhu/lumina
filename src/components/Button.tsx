import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

/** The standard action button. Use one primary button per view. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading, leadingIcon, trailingIcon, fullWidth, disabled, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("lm-button", `lm-button--${variant}`, `lm-button--${size}`, fullWidth && "lm-button--full", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" label="Working" /> : leadingIcon}
      {children && <span className="lm-button__label">{children}</span>}
      {!loading && trailingIcon}
    </button>
  );
});

export interface IconButtonProps extends Omit<ButtonProps, "leadingIcon" | "trailingIcon" | "children"> {
  /** Required: icon-only buttons need an accessible name. */
  "aria-label": string;
  icon: ReactNode;
}

/** A square button with only an icon. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = "ghost", className, ...rest },
  ref,
) {
  return <Button ref={ref} variant={variant} className={cx("lm-icon-button", className)} leadingIcon={icon} {...rest} />;
});
