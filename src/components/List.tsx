import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";

/** A vertical list of selectable items (e.g. conversations, tasks). */
export function List({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="list" className={cx("lm-list", className)} {...rest} />;
}

export interface ListItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  title: ReactNode;
  /** Secondary line, e.g. a timestamp. */
  meta?: ReactNode;
  /** Before the title, e.g. a Badge or Avatar. */
  leading?: ReactNode;
  /** After the text, e.g. a count. */
  trailing?: ReactNode;
  selected?: boolean;
}

export function ListItem({ title, meta, leading, trailing, selected, className, type = "button", ...rest }: ListItemProps) {
  return (
    <div role="listitem">
      <button type={type} className={cx("lm-list__item", selected && "lm-list__item--selected", className)} aria-current={selected || undefined} {...rest}>
        {leading && <span className="lm-list__leading">{leading}</span>}
        <span className="lm-list__text">
          <span className="lm-list__title">{title}</span>
          {meta && <span className="lm-list__meta">{meta}</span>}
        </span>
        {trailing && <span className="lm-list__trailing">{trailing}</span>}
      </button>
    </div>
  );
}
