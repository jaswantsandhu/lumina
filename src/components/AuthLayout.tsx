import { useId, type ReactNode } from "react";
import { cx } from "../utils";

export interface AuthLayoutProps {
  /** e.g. "Sign in", "Welcome, Asha". */
  title: ReactNode;
  description?: ReactNode;
  /** Product name or logo above the card. */
  brand?: ReactNode;
  children: ReactNode;
  /** Small print under the card: help, privacy link. */
  footer?: ReactNode;
  className?: string;
}

/** A centred card on its own page: sign in, accept an invite, reset a password, errors before sign-in. */
export function AuthLayout({ title, description, brand, children, footer, className }: AuthLayoutProps) {
  const titleId = useId();
  return (
    <main className={cx("lm-auth", className)}>
      <div className="lm-auth__inner">
        {brand && <div className="lm-auth__brand">{brand}</div>}
        <section className="lm-auth__card" aria-labelledby={titleId}>
          <h1 id={titleId} className="lm-auth__title">
            {title}
          </h1>
          {description && <p className="lm-auth__description">{description}</p>}
          <div className="lm-auth__body">{children}</div>
        </section>
        {footer && <div className="lm-auth__footer">{footer}</div>}
      </div>
    </main>
  );
}
