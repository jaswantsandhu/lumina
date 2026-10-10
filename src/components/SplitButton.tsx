import { forwardRef } from "react";
import { Button, type ButtonProps } from "./Button";
import { DropdownMenu, type DropdownItem } from "./Dropdown";
import { cx } from "../utils";

export interface SplitButtonProps extends ButtonProps {
  /** Secondary actions displayed by the existing DropdownMenu. */
  items: DropdownItem[];
  /** Accessible name for the icon-only menu trigger. */
  menuLabel: string;
  /** Accessible name for the two-button group. */
  groupLabel?: string;
}

/** Primary action and an adjoining dropdown. The ref points to the primary Button. */
export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(function SplitButton(
  { items, menuLabel, groupLabel, className, variant = "secondary", size = "md", disabled, loading, fullWidth, ...rest }, ref,
) {
  return <div role="group" aria-label={groupLabel} className={cx("lm-split-button", fullWidth && "lm-split-button--full", className)}>
    <Button {...rest} ref={ref} className="lm-split-button__primary" variant={variant} size={size} disabled={disabled} loading={loading} />
    <DropdownMenu align="end" items={items} trigger={(props) => <Button {...props} className="lm-split-button__menu" variant={variant} size={size} disabled={disabled || loading} aria-label={menuLabel}><span aria-hidden="true">v</span></Button>} />
  </div>;
});
