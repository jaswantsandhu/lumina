import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cx } from "../utils";
import { portalTarget, usePopover } from "./popover";

/** Spread these props onto a native button (or a ref-forwarding button). */
export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref: RefObject<HTMLButtonElement>;
}

export interface PopoverProps {
  /** Render an accessible button using the supplied props. */
  trigger: (props: PopoverTriggerProps) => ReactNode;
  /** Accessible name of the non-modal dialog. */
  label: string;
  children: ReactNode;
  /** Controlled visibility; omit to use internal state. */
  open?: boolean;
  /** Initial visibility in uncontrolled mode. */
  defaultOpen?: boolean;
  /** Called when the trigger, Escape, outside pointer or focus requests a change. */
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "end";
  /** Applied to the portalled content. */
  className?: string;
}

/** Anchored non-modal dialog. Opens with focus inside; Escape restores trigger focus. */
export function Popover({ trigger, label, children, open: controlledOpen, defaultOpen = false, onOpenChange, align = "start", className }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const anchor = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const id = useId();
  const style = usePopover(open, anchor, content, { align });
  const change = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const changeRef = useRef(change);
  changeRef.current = change;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const panel = content.current;
    const candidates = content.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled):not([type='hidden']), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex='0']");
    for (const candidate of candidates ?? []) {
      if (candidate.closest("[hidden], [inert]")) continue;
      candidate.focus();
      if (document.activeElement === candidate) break;
    }
    if (!panel?.contains(document.activeElement)) panel?.focus();
    const outside = (event: Event) => {
      if (!anchor.current?.contains(event.target as Node) && !content.current?.contains(event.target as Node)) changeRef.current(false);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        event.stopPropagation();
        changeRef.current(false);
        anchor.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
      if (panel?.contains(document.activeElement) || document.activeElement === document.body) {
        if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
      }
    };
  }, [open]);
  return <>
    {trigger({ ref: anchor, type: "button", "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? id : undefined, onClick: () => change(!open) })}
    {open && createPortal(<div ref={content} id={id} role="dialog" aria-label={label} tabIndex={-1} className={cx("lm-popover", className)} style={style}>{children}</div>, portalTarget(anchor.current) ?? document.body)}
  </>;
}
