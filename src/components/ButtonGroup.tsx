import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../utils";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Direction of the adjoining buttons. Native Tab navigation is preserved. */
  orientation?: "horizontal" | "vertical";
}

/** Visually joins existing Buttons. Provide aria-label to name the group. */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation = "horizontal", className, ...rest }, ref,
) {
  return <div {...rest} ref={ref} role="group" className={cx("lm-button-group", `lm-button-group--${orientation}`, className)} />;
});
