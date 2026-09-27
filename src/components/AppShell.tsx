import { useEffect, useId, useState, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cx } from "../utils";

export interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  /** Shown in the top bar on small screens, where the sidebar becomes a drawer. */
  title?: ReactNode;
  className?: string;
}

/**
 * Full-height layout: sidebar on the left, scrollable main area.
 * Below 720px the sidebar turns into a drawer opened from a top bar; choosing a
 * nav item, pressing Escape or tapping the backdrop closes it.
 */
export function AppShell({ sidebar, children, title, className }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const closeOnNav = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest(".lm-nav__item")) setOpen(false);
  };

  return (
    <div className={cx("lm-app", open && "lm-app--open", className)}>
      <header className="lm-app__topbar">
        <button
          type="button"
          className="lm-app__menu"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={drawerId}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" width="20" height="20">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
        {title && <div className="lm-app__title">{title}</div>}
      </header>
      <div className="lm-app__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
      <aside id={drawerId} className="lm-app__sidebar" onClick={closeOnNav}>
        {sidebar}
      </aside>
      <main className="lm-app__main">{children}</main>
    </div>
  );
}

/** Sidebar parts: brand, a flexible middle and a footer pinned to the bottom. */
export function SidebarBrand({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("lm-sidebar__brand", className)} {...rest} />;
}
export function SidebarFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("lm-sidebar__footer", className)} {...rest} />;
}

export function NavSection({ label, children, className }: { label?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <nav className={cx("lm-nav", className)} aria-label={typeof label === "string" ? label : undefined}>
      {label && <div className="lm-nav__label">{label}</div>}
      {children}
    </nav>
  );
}

export interface NavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
  /** A count shown on the right, e.g. pending approvals. */
  count?: number;
}

export function NavItem({ active, icon, count, className, children, type = "button", ...rest }: NavItemProps) {
  return (
    <button type={type} className={cx("lm-nav__item", active && "lm-nav__item--active", className)} aria-current={active ? "page" : undefined} {...rest}>
      {icon && <span className="lm-nav__icon">{icon}</span>}
      <span className="lm-nav__text">{children}</span>
      {count != null && count > 0 && <span className="lm-nav__count">{count}</span>}
    </button>
  );
}
