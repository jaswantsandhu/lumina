import { useEffect, useId, useState, type ReactNode } from "react";
import { cx } from "../utils";

export interface DisclosureProps {
  /** Always-visible row that toggles the content. */
  summary: ReactNode;
  children: ReactNode;
  /** Controlled open state (use with onOpenChange). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** "card" draws a bordered box; "plain" is just the toggle row. */
  variant?: "plain" | "card";
  className?: string;
}

/** Show/hide a section. The toggle is a real button with aria-expanded. */
export function Disclosure({ summary, children, open, defaultOpen = false, onOpenChange, variant = "plain", className }: DisclosureProps) {
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const id = useId();
  useEffect(() => {
    if (open !== undefined) setInner(open);
  }, [open]);
  const toggle = () => {
    setInner(!isOpen);
    onOpenChange?.(!isOpen);
  };
  return (
    <div className={cx("lm-disclosure", `lm-disclosure--${variant}`, isOpen && "lm-disclosure--open", className)}>
      <button type="button" className="lm-disclosure__summary" aria-expanded={isOpen} aria-controls={id} onClick={toggle}>
        <span className="lm-disclosure__chevron" aria-hidden="true" />
        {summary}
      </button>
      <div id={id} className="lm-disclosure__content" hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
}
