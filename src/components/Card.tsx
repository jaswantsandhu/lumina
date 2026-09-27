import { type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover and focus styles; use with onClick or a link inside. */
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

/** A surface that groups related content. */
export function Card({ interactive, padding = "md", className, ...rest }: CardProps) {
  return <div className={cx("lm-card", `lm-card--pad-${padding}`, interactive && "lm-card--interactive", className)} {...rest} />;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or menus on the right. */
  actions?: ReactNode;
}

export function CardHeader({ title, description, actions, className, ...rest }: CardHeaderProps) {
  return (
    <div className={cx("lm-card__header", className)} {...rest}>
      <div className="lm-card__heading">
        <h3 className="lm-card__title">{title}</h3>
        {description && <p className="lm-card__description">{description}</p>}
      </div>
      {actions && <div className="lm-card__actions">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("lm-card__body", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("lm-card__footer", className)} {...rest} />;
}
