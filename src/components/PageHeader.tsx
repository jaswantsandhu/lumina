import { type ReactNode } from "react";
import { cx } from "../utils";

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Primary actions on the right. */
  actions?: ReactNode;
  className?: string;
}

/** The title row at the top of a page. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cx("lm-page-header", className)}>
      <div className="lm-page-header__text">
        <h1 className="lm-page-header__title">{title}</h1>
        {description && <p className="lm-page-header__description">{description}</p>}
      </div>
      {actions && <div className="lm-page-header__actions">{actions}</div>}
    </header>
  );
}
