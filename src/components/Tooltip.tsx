import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";
import { cx } from "../utils";

export interface TooltipProps {
  content: ReactNode;
  /** One focusable element (e.g. a Button). */
  children: ReactElement;
  side?: "top" | "bottom";
}

/** Short hint on hover and keyboard focus. Not for essential information. */
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  if (!isValidElement(children)) return children;
  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  return (
    <span className="lm-tooltip-anchor" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onKeyDown={(e) => e.key === "Escape" && hide()}>
      {cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, { "aria-describedby": open ? id : undefined })}
      <span id={id} role="tooltip" className={cx("lm-tooltip", `lm-tooltip--${side}`, open && "lm-tooltip--open")}>
        {content}
      </span>
    </span>
  );
}
