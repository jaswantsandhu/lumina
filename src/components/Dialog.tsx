import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "../utils";

export interface DialogProps {
  open: boolean;
  /** Called on Escape, backdrop click or the close button (only when dismissible). */
  onClose?: () => void;
  /**
   * false: a required choice. No close button, and Escape / backdrop clicks do nothing, so the user must use
   * one of the footer buttons (e.g. a consent decision). Always offer every choice there, equally easy.
   */
  dismissible?: boolean;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, right-aligned. Put the primary action last. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Modal dialog built on the native <dialog> (focus trap, Escape, top layer).
 */
export function Dialog({ open, onClose, title, description, children, footer, size = "md", dismissible = true, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx("lm-dialog", `lm-dialog--${size}`, className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose?.();
      }}
      onClick={(e) => {
        // Clicks on the backdrop land on the <dialog> element itself.
        if (dismissible && e.target === ref.current) onClose?.();
      }}
      onClose={() => {
        // The browser can close a modal on its own: Chrome lets Escape through, even when "cancel" is prevented,
        // if the user hasn't interacted with the page yet. Keep the DOM in step with the open prop.
        if (!open) return;
        if (dismissible) onClose?.();
        else ref.current?.showModal();
      }}
    >
      <div className="lm-dialog__panel">
        <div className="lm-dialog__header">
          <div>
            <h2 id={titleId} className="lm-dialog__title">
              {title}
            </h2>
            {description && (
              <p id={descId} className="lm-dialog__description">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button type="button" className="lm-dialog__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          )}
        </div>
        {children && <div className="lm-dialog__body">{children}</div>}
        {footer && <div className="lm-dialog__footer">{footer}</div>}
      </div>
    </dialog>
  );
}
