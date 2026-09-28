import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { portalTarget, usePopover } from "./popover";
import { cx } from "../utils";

export type DropdownItem =
  | { type?: "item"; label: ReactNode; onSelect: () => void; icon?: ReactNode; shortcut?: ReactNode; danger?: boolean; disabled?: boolean }
  | { type: "separator" }
  | { type: "label"; label: ReactNode };

export interface DropdownMenuProps {
  /** Renders the trigger; spread the props onto a button (e.g. <Button {...props}>). */
  trigger: (props: { ref: (el: HTMLButtonElement | null) => void; onClick: () => void; onKeyDown: (e: KeyboardEvent) => void; "aria-haspopup": "menu"; "aria-expanded": boolean; "aria-controls": string }) => ReactNode;
  items: DropdownItem[];
  /** Menu alignment under the trigger. */
  align?: "start" | "end";
  className?: string;
}

/** A menu of actions opened from a button. Arrow keys, Home/End, Enter and Escape work. */
export function DropdownMenu({ trigger, items, align = "start", className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const triggerEl = useRef<HTMLButtonElement | null>(null);
  const itemEls = useRef<(HTMLButtonElement | null)[]>([]);
  const menuEl = useRef<HTMLDivElement>(null);
  const style = usePopover(open, triggerEl, menuEl, { align });
  const actionable = items.map((it, i) => ((it.type ?? "item") === "item" && !(it as { disabled?: boolean }).disabled ? i : -1)).filter((i) => i >= 0);

  const close = (focusTrigger = true) => {
    setOpen(false);
    setActive(-1);
    if (focusTrigger) triggerEl.current?.focus();
  };
  const openAt = (index: number) => {
    setOpen(true);
    setActive(index);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!root.current?.contains(t) && !menuEl.current?.contains(t)) close(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) itemEls.current[active]?.focus();
  }, [open, active]);

  const move = (delta: number) => {
    const pos = actionable.indexOf(active);
    setActive(actionable[(pos + delta + actionable.length) % actionable.length] ?? -1);
  };
  const onMenuKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") move(1);
    else if (e.key === "ArrowUp") move(-1);
    else if (e.key === "Home") setActive(actionable[0] ?? -1);
    else if (e.key === "End") setActive(actionable[actionable.length - 1] ?? -1);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") close(false);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={root} className={cx("lm-dropdown", className)}>
      {trigger({
        ref: (el) => {
          triggerEl.current = el;
        },
        onClick: () => (open ? close(false) : openAt(actionable[0] ?? -1)),
        onKeyDown: (e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openAt(actionable[0] ?? -1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            openAt(actionable[actionable.length - 1] ?? -1);
          }
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": id,
      })}
      {open &&
        createPortal(
        <div ref={menuEl} id={id} role="menu" className={cx("lm-dropdown__menu", `lm-dropdown__menu--${align}`)} style={style} onKeyDown={onMenuKey}>
          {items.map((it, i) => {
            if (it.type === "separator") return <div key={i} role="separator" className="lm-dropdown__separator" />;
            if (it.type === "label")
              return (
                <div key={i} className="lm-dropdown__label" role="presentation">
                  {it.label}
                </div>
              );
            return (
              <button
                key={i}
                ref={(el) => {
                  itemEls.current[i] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={i === active ? 0 : -1}
                disabled={it.disabled}
                className={cx("lm-dropdown__item", it.danger && "lm-dropdown__item--danger")}
                onMouseEnter={() => !it.disabled && setActive(i)}
                onClick={() => {
                  close();
                  it.onSelect();
                }}
              >
                {it.icon && <span className="lm-dropdown__icon">{it.icon}</span>}
                <span className="lm-dropdown__text">{it.label}</span>
                {it.shortcut && <span className="lm-dropdown__shortcut">{it.shortcut}</span>}
              </button>
            );
          })}
        </div>,
          portalTarget(triggerEl.current) ?? document.body,
        )}
    </div>
  );
}
