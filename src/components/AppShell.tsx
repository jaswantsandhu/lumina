import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";

export interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Full-height layout: sidebar on the left, scrollable main area. */
export function AppShell({ sidebar, children, className }: AppShellProps) {
  return (
    <div className={cx("lm-app", className)}>
      <aside className="lm-app__sidebar">{sidebar}</aside>
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
