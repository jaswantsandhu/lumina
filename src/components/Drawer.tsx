import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "../utils";

export interface DrawerProps {
  open: boolean;
  /** Called on Escape, backdrop click or the close button. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Actions pinned to the bottom (put the primary action last). */
  footer?: ReactNode;
  /** Which edge it slides in from (default "end": the right in left-to-right layouts). */
  side?: "start" | "end";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * A side panel for an item's details or a longer form, over the page. Built on
 * the native <dialog> (focus trap, Escape, top layer). Full width on phones.
 */
export function Drawer({ open, onClose, title, description, children, footer, side = "end", size = "md", className }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx("lm-drawer", `lm-drawer--${side}`, `lm-drawer--${size}`, className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="lm-drawer__panel">
        <div className="lm-drawer__header">
          <div>
            <h2 id={titleId} className="lm-drawer__title">
              {title}
            </h2>
            {description && (
              <p id={descId} className="lm-drawer__description">
                {description}
              </p>
            )}
          </div>
          <button type="button" className="lm-drawer__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="lm-drawer__body">{children}</div>
        {footer && <div className="lm-drawer__footer">{footer}</div>}
      </div>
    </dialog>
  );
}
