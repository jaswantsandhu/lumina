import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cx } from "../utils";

/** A data table in a scrollable, bordered container. */
// The wrapper scrolls sideways on narrow screens, so it's a focusable, named region
// that keyboard users can scroll too.
export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="lm-table-wrap" tabIndex={0} role="region" aria-label={rest["aria-label"] ?? "Table"}>
      <table className={cx("lm-table", className)} {...rest} />
    </div>
  );
}
export const THead = (p: HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} />;
export const TBody = (p: HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export function TR({ selected, className, ...rest }: HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }) {
  return <tr className={cx(selected && "lm-table__row--selected", className)} aria-selected={selected || undefined} {...rest} />;
}
export const TH = ({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) => <th scope="col" className={cx("lm-table__th", className)} {...rest} />;
export function TD({ muted, numeric, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement> & { muted?: boolean; numeric?: boolean }) {
  return <td className={cx("lm-table__td", muted && "lm-table__td--muted", numeric && "lm-table__td--numeric", className)} {...rest} />;
}
